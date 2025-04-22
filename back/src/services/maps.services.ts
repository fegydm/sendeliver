// File: ./back/src/services/maps.services.ts
// Last change: 2025-04-22
// Description: Map service for generating GeoJSON and MVT tiles, using SRID 3857 exclusively

import { pool } from "../configs/db.js";

// ENG: Define the GeoJSON interface.
interface GeoJson {
  type: string;
  features: any[];
  zoom?: number;
}

class MapsService {
  // ENG: Cache duration is set to 5 minutes for GeoJSON boundaries.
  private readonly CACHE_DURATION = 5 * 60 * 1000;
  // ENG: Cache for storing GeoJSON data with a unique key.
  private geoJsonCache: Map<string, GeoJson> = new Map();
  // ENG: Map to store last cache time per key.
  private lastCacheTime: Map<string, number> = new Map();
  // ENG: Cache for MVT tiles (24 hours validity)
  private mvtCache: Map<string, { data: Buffer, timestamp: number }> = new Map();
  private readonly MVT_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private isHealthy = true;

  // ENG: Check the database connectivity by executing a simple query.
  private async checkHealth(): Promise<void> {
    try {
      await pool.query('SELECT 1');
      this.isHealthy = true;
    } catch (error) {
      this.isHealthy = false;
      throw error;
    }
  }

  // ENG: Validate if the cache for a given key is still valid.
  private isCacheValid(key: string): boolean {
    const lastTime = this.lastCacheTime.get(key) || 0;
    return this.geoJsonCache.has(key) && Date.now() - lastTime < this.CACHE_DURATION;
  }

  // ENG: Check if MVT cache is valid
  private isMvtCacheValid(key: string): boolean {
    const entry = this.mvtCache.get(key);
    return !!entry && (Date.now() - entry.timestamp < this.MVT_CACHE_DURATION);
  }

  // ENG: Get countries and regions boundaries as GeoJSON based on zoom level and bbox.
  public async getCountriesGeoJson(zoom: number, bbox?: [number, number, number, number]): Promise<GeoJson> {
    try {
      if (!this.isHealthy) await this.checkHealth();
      const cacheKey = `${zoom}_${bbox ? bbox.join(',') : 'no_bbox'}`;
      if (this.isCacheValid(cacheKey)) {
        return this.geoJsonCache.get(cacheKey)!;
      }

      // ENG: Use ST_Transform to convert geometry to 4326 for GeoJSON output
      let query = `
        SELECT jsonb_build_object(
          'type', 'FeatureCollection',
          'features', jsonb_agg(
            jsonb_build_object(
              'type', 'Feature',
              'geometry', ST_AsGeoJSON(${zoom <= 3 ? 'ST_Simplify(ST_Transform(geom, 4326), 0.1)' : 'ST_Transform(geom, 4326)'})::jsonb,
              'properties', jsonb_build_object(
                'id', id,
                'code_2', code_2,
                'code_3', code_3,
                'name', name,
                'name_en', name_en,
                'colour', colour
              )
            )
          )
        ) AS geojson
        FROM maps.world_countries
      `;

      if (bbox) {
        const [minLon, minLat, maxLon, maxLat] = bbox;
        query += ` WHERE ST_Intersects(
            ST_Transform(geom, 4326),
            ST_MakeEnvelope(${minLon}, ${minLat}, ${maxLon}, ${maxLat}, 4326)
          )`;
      }

      const result = await pool.query(query);
      let geojson = result.rows[0]?.geojson || { type: 'FeatureCollection', features: [], zoom };

      if (!geojson.features || geojson.features.length === 0) {
        geojson = {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [[[-20, 40], [-20, 50], [-10, 50], [-10, 40], [-20, 40]]],
              },
              properties: {
                id: 1,
                code_2: 'TC',
                name: 'Testovacia krajina',
                name_en: 'Test Country',
                colour: '#ff0000'
              },
            },
            {
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [[[0, 40], [0, 50], [10, 50], [10, 40], [0, 40]]],
              },
              properties: {
                id: 2,
                code_2: 'DC',
                name: 'Druhá krajina',
                name_en: 'Second Country',
                colour: '#00ff00'
              },
            },
          ],
          zoom,
        };
      }

      this.geoJsonCache.set(cacheKey, geojson);
      this.lastCacheTime.set(cacheKey, Date.now());
      return geojson;
    } catch (error) {
      console.error('Failed to generate GeoJSON:', error);
      return {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [[[-20, 40], [-20, 50], [-10, 50], [-10, 40], [-20, 40]]],
            },
            properties: {
              id: 1,
              code_2: 'TC',
              name: 'Testovacia krajina',
              name_en: 'Test Country',
              colour: '#ff0000'
            },
          },
        ],
        zoom,
      };
    }
  }

  /**
   * Získa MVT dlaždicu pre hranice krajín (SRID 3857)
   */
  public async getBoundariesMVT(z: number, x: number, y: number): Promise<Buffer> {
    try {
      if (z > 8) {
        console.log(`Returning empty tile for high zoom level z=${z}, x=${x}, y=${y}`);
        return Buffer.from([]);
      }

      if (!this.isHealthy) await this.checkHealth();
      const cacheKey = `boundaries_mvt_${z}_${x}_${y}`;
      if (this.isMvtCacheValid(cacheKey)) {
        return this.mvtCache.get(cacheKey)!.data;
      }

      const simplification = z < 4 ? 0.1 : z < 6 ? 0.05 : 0.01;
      const query = `
        WITH 
        bounds AS (
          SELECT ST_TileEnvelope($1, $2, $3) AS geom
        ),
        mvt_data AS (
          SELECT
            id,
            code_2,
            name,
            colour,
            ST_AsMVTGeom(
              ST_Simplify(wc.geom, $4),
              bounds.geom,
              4096,
              256,
              true
            ) AS mvtgeom
          FROM maps.world_countries wc, bounds
          WHERE ST_Intersects(wc.geom, bounds.geom)
        )
        SELECT ST_AsMVT(mvt_data, 'boundaries', 4096, 'mvtgeom') AS mvt
        FROM mvt_data
      `;

      const result = await pool.query(query, [z, x, y, simplification]);
      const mvtBuffer = result.rows[0]?.mvt || Buffer.from([]);

      this.mvtCache.set(cacheKey, { 
        data: mvtBuffer, 
        timestamp: Date.now() 
      });

      return mvtBuffer;
    } catch (error) {
      console.error(`Error generating boundaries MVT for z=${z}, x=${x}, y=${y}:`, error);
      return Buffer.from([]);
    }
  }

  /**
   * Získa MVT dlaždicu pre cesty
   */
  public async getRoadsTile(z: number, x: number, y: number): Promise<Buffer> {
    try {
      if (z > 6) {
        console.log(`Returning empty roads tile for zoom level z=${z}, x=${x}, y=${y}`);
        return Buffer.from([]);
      }

      if (!this.isHealthy) await this.checkHealth();
      const cacheKey = `roads_mvt_${z}_${x}_${y}`;
      if (this.isMvtCacheValid(cacheKey)) {
        return this.mvtCache.get(cacheKey)!.data;
      }

      return Buffer.from([]);
    } catch (error) {
      console.error(`Error generating roads MVT for z=${z}, x=${x}, y=${y}:`, error);
      return Buffer.from([]);
    }
  }

  /**
   * Získa MVT dlaždicu pre konkrétnu krajinu podľa kódu (SRID 3857)
   */
  public async getCountryBoundariesMVT(z: number, x: number, y: number, countryCode: string): Promise<Buffer> {
    try {
      if (z > 8) {
        console.log(`Returning empty country tile for high zoom level z=${z}, x=${x}, y=${y}, country=${countryCode}`);
        return Buffer.from([]);
      }

      if (!this.isHealthy) await this.checkHealth();
      const cacheKey = `country_mvt_${countryCode}_${z}_${x}_${y}`;
      if (this.isMvtCacheValid(cacheKey)) {
        return this.mvtCache.get(cacheKey)!.data;
      }

      const simplification = z < 4 ? 0.1 : z < 6 ? 0.05 : 0.01;
      const query = `
        WITH 
        bounds AS (
          SELECT ST_TileEnvelope($1, $2, $3) AS geom
        ),
        mvt_data AS (
          SELECT
            wc.id,
            wc.code_2,
            wc.name,
            wc.colour,
            ST_AsMVTGeom(
              ST_Simplify(wc.geom, $4),
              bounds.geom,
              4096,
              256,
              true
            ) AS mvtgeom
          FROM maps.world_countries wc, bounds
          WHERE ST_Intersects(wc.geom, bounds.geom)
          AND wc.code_2 = $5
        )
        SELECT ST_AsMVT(mvt_data, 'boundaries', 4096, 'mvtgeom') AS mvt
        FROM mvt_data
      `;

      const result = await pool.query(query, [z, x, y, simplification, countryCode]);
      const mvtBuffer = result.rows[0]?.mvt || Buffer.from([]);

      this.mvtCache.set(cacheKey, { 
        data: mvtBuffer, 
        timestamp: Date.now() 
      });

      return mvtBuffer;
    } catch (error) {
      console.error(`Error generating country MVT for z=${z}, x=${x}, y=${y}, country=${countryCode}:`, error);
      return Buffer.from([]);
    }
  }

  /**
   * Aktualizuje farbu hranice krajiny
   */
  public async updateBoundaryColor(boundary_id: number, color: string): Promise<{ id: number; code_2: string; name_en: string; colour: string } | null> {
    try {
      if (!this.isHealthy) await this.checkHealth();
      const query = `
        UPDATE maps.world_countries
        SET colour = $2
        WHERE id = $1
        RETURNING id, code_2, name_en, colour
      `;

      const result = await pool.query(query, [boundary_id, color]);
      
      this.mvtCache.forEach((_, key) => {
        if (key.startsWith('boundaries_mvt_') || key.startsWith('country_mvt_')) {
          this.mvtCache.delete(key);
        }
      });
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Failed to update boundary color:', error);
      throw error;
    }
  }

  /**
   * Kontroluje, či existuje krajina s daným kódom
   */
  public async checkBoundaryExists(code_2: string): Promise<boolean> {
    try {
      if (!this.isHealthy) await this.checkHealth();
      const query = `
        SELECT EXISTS(
          SELECT 1 FROM maps.world_countries WHERE code_2 = $1
        ) AS found
      `;
      const result = await pool.query(query, [code_2]);
      return result.rows[0].found;
    } catch (error) {
      console.error('Failed to check boundary existence:', error);
      throw error;
    }
  }

  /**
   * Získa detaily o krajine podľa kódu
   */
  public async getBoundaryByCode(code_2: string): Promise<{ id: number; code_2: string; name: string; name_en: string; colour: string } | null> {
    try {
      if (!this.isHealthy) await this.checkHealth();
      const query = `
        SELECT id, code_2, name, name_en, colour
        FROM maps.world_countries
        WHERE code_2 = $1
      `;
      const result = await pool.query(query, [code_2]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Failed to fetch boundary by code:', error);
      throw error;
    }
  }
}

export default new MapsService();