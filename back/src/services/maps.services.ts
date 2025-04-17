// File: ./back/src/services/maps.services.ts
// Last change: 2025-04-17
// Description: Updated queries for BE services to support world_boundaries_2level and europe_boundaries_6level

import { pool } from "../configs/db.js";
import { 
  GET_BOUNDARIES_GEOJSON_QUERY,
  UPDATE_BOUNDARY_COLOR_QUERY,
  CHECK_BOUNDARY_EXISTS_QUERY,
  GET_BOUNDARY_BY_CODE_QUERY 
} from "../queries/maps.queries.js";

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

  // ENG: Get countries and regions boundaries as GeoJSON based on zoom level and bbox.
  // For zoom 0-4: Global countries from world_boundaries_2level.
  // For zoom 5+: European regions from europe_boundaries_6level, with fallback to countries.
  public async getCountriesGeoJson(zoom: number, bbox?: [number, number, number, number]): Promise<GeoJson> {
    try {
      // ENG: Ensure the database is healthy.
      if (!this.isHealthy) await this.checkHealth();

      // ENG: Create a unique cache key based on zoom and bbox.
      const cacheKey = `${zoom}_${bbox ? bbox.join(',') : 'no_bbox'}`;
      if (this.isCacheValid(cacheKey)) {
        return this.geoJsonCache.get(cacheKey)!;
      }

      // ENG: Use query from maps.queries.ts with optional bbox filtering.
      let query = GET_BOUNDARIES_GEOJSON_QUERY;
      const queryParams: any[] = [zoom, 200]; // Default limit 200

      // ENG: If bbox is provided, append a WHERE clause to restrict by spatial envelope.
      if (bbox) {
        const [minLon, minLat, maxLon, maxLat] = bbox;
        const spatialCondition = `
          AND ST_Intersects(
            geom,
            ST_MakeEnvelope($${queryParams.length + 1}, $${queryParams.length + 2}, $${queryParams.length + 3}, $${queryParams.length + 4}, 4326)
          )
        `;
        query = query.replace('LIMIT CASE', `${spatialCondition} LIMIT CASE`);
        queryParams.push(minLon, minLat, maxLon, maxLat);
      }

      // ENG: Execute the SQL query with the parameters.
      const result = await pool.query(query, queryParams);
      let geojson = result.rows[0]?.geojson || { type: 'FeatureCollection', features: [], zoom };

      // ENG: Fallback for empty result: Return a predefined GeoJSON.
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
                colour: '#ff0000',
                level: 'country',
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
                colour: '#00ff00',
                level: 'country',
              },
            },
          ],
          zoom,
        };
      }

      // ENG: Cache the resulting GeoJSON.
      this.geoJsonCache.set(cacheKey, geojson);
      this.lastCacheTime.set(cacheKey, Date.now());
      return geojson;
    } catch (error) {
      console.error('Failed to generate GeoJSON:', error);
      // ENG: Return a fallback GeoJSON in case of failure.
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
              colour: '#ff0000',
              level: 'country',
            },
          },
        ],
        zoom,
      };
    }
  }

  // ENG: Get roads tile as a vector tile (MVT) for the 'simple' map type.
  // For other map types (osm, satellite), it is expected to be fetched externally.
  // Tiles are cached for 24 hours (caching to be implemented if needed).
  public async getRoadsTile(type: string, z: number, x: number, y: number): Promise<Buffer> {
    try {
      // ENG: Ensure the database is healthy.
      if (!this.isHealthy) await this.checkHealth();

      // ENG: Only generate vector tiles for the 'simple' type.
      if (type === 'simple') {
        const tileQuery = `
          SELECT ST_AsMVT(tile_data, 'tile', 4096, 'geom') AS mvt
          FROM (
            SELECT b.id, b.geom, b.road_type
            FROM maps.roads b
            WHERE b.road_type IN ('motorway', 'primary', 'secondary')
              AND ST_Intersects(b.geom, ST_TileEnvelope($1, $2, $3))
          ) AS tile_data
        `;
        const tileResult = await pool.query(tileQuery, [z, x, y]);
        const mvt = tileResult.rows[0]?.mvt;
        if (mvt) {
          // ENG: Return the generated vector tile as a Buffer.
          return Buffer.from(mvt);
        }
      }

      // ENG: For non-simple types or if tile generation fails, return an empty Buffer.
      return Buffer.from('');
    } catch (error) {
      console.error(`Failed to generate ${type} road tile:`, error);
      return Buffer.from('');
    }
  }

  // ENG: Update the color of a boundary using UPDATE_BOUNDARY_COLOR_QUERY.
  public async updateBoundaryColor(boundary_id: number, color: string): Promise<{ id: number; code_2: string; name_en: string; colour: string } | null> {
    try {
      // ENG: Ensure the database is healthy.
      if (!this.isHealthy) await this.checkHealth();

      // ENG: Execute the update query.
      const result = await pool.query(UPDATE_BOUNDARY_COLOR_QUERY, [boundary_id, color]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Failed to update boundary color:', error);
      throw error;
    }
  }

  // ENG: Check if a boundary exists by code_2.
  public async checkBoundaryExists(code_2: string): Promise<boolean> {
    try {
      // ENG: Ensure the database is healthy.
      if (!this.isHealthy) await this.checkHealth();

      // ENG: Execute the check query.
      const result = await pool.query(CHECK_BOUNDARY_EXISTS_QUERY, [code_2]);
      return result.rows[0].found;
    } catch (error) {
      console.error('Failed to check boundary existence:', error);
      throw error;
    }
  }

  // ENG: Get boundary details by code_2.
  public async getBoundaryByCode(code_2: string): Promise<{ id: number; code_2: string; name: string; name_en: string; colour: string; level: string } | null> {
    try {
      // ENG: Ensure the database is healthy.
      if (!this.isHealthy) await this.checkHealth();

      // ENG: Execute the query.
      const result = await pool.query(GET_BOUNDARY_BY_CODE_QUERY, [code_2]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Failed to fetch boundary by code:', error);
      throw error;
    }
  }
}

export default new MapsService();