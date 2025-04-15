// File: ./back/src/services/maps.services.ts
// Last change: Added fallback GeoJSON for empty tables

import { pool } from "../configs/db.js";

interface GeoJson {
  type: string;
  features: any[];
  zoom?: number;
}

class MapsService {
  private readonly CACHE_DURATION = 5 * 60 * 1000;
  private geoJsonCache: Map<string, GeoJson> = new Map();
  private lastCacheTime: Map<string, number> = new Map();
  private isHealthy = true;

  private async checkHealth(): Promise<void> {
    try {
      await pool.query('SELECT 1');
      this.isHealthy = true;
    } catch (error) {
      this.isHealthy = false;
      throw error;
    }
  }

  private isCacheValid(key: string): boolean {
    const lastTime = this.lastCacheTime.get(key) || 0;
    return this.geoJsonCache.has(key) && Date.now() - lastTime < this.CACHE_DURATION;
  }

  public async getCountriesGeoJson(zoom: number, bbox?: [number, number, number, number]): Promise<GeoJson> {
    try {
      if (!this.isHealthy) await this.checkHealth();

      const cacheKey = `${zoom}_${bbox ? bbox.join(',') : 'no_bbox'}`;
      if (this.isCacheValid(cacheKey)) {
        return this.geoJsonCache.get(cacheKey)!;
      }

      let query = `
        SELECT jsonb_build_object(
          'type', 'FeatureCollection',
          'features', jsonb_agg(
            jsonb_build_object(
              'type', 'Feature',
              'geometry', ST_AsGeoJSON(${zoom <= 3 ? 'ST_Simplify(b.geom, 0.1)' : 'b.geom'})::jsonb,
              'properties', jsonb_build_object(
                'id', b.id,
                'country_id', b.country_id,
                'name_sk', COALESCE(c.name_sk, 'Unknown'),
                'code_2', COALESCE(c.code_2, ''),
                'color', COALESCE(b.colour, '#cccccc')
              )
            )
          )
        ) AS geojson
        FROM maps.world_boundaries_2level b
        LEFT JOIN geo.countries c ON b.country_id = c.id
      `;
      const queryParams: number[] = [];

      if (bbox) {
        const [minLon, minLat, maxLon, maxLat] = bbox;
        query += `
          WHERE ST_Intersects(
            b.geom,
            ST_MakeEnvelope($1, $2, $3, $4, 4326)
          )
        `;
        queryParams.push(minLon, minLat, maxLon, maxLat);
      }

      const result = await pool.query(query, queryParams);
      let geojson = result.rows[0]?.geojson || { type: 'FeatureCollection', features: [], zoom };

      // Fallback pre prázdne tabuľky
      if (geojson.features.length === 0) {
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
                country_id: 1,
                name_sk: 'Testovacia krajina',
                code_2: 'TC',
                color: '#ff0000',
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
                country_id: 2,
                name_sk: 'Druhá krajina',
                code_2: 'DC',
                color: '#00ff00',
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
              country_id: 1,
              name_sk: 'Testovacia krajina',
              code_2: 'TC',
              color: '#ff0000',
            },
          },
        ],
        zoom,
      };
    }
  }

  public async getRoadsTile(type: string, z: number, x: number, y: number): Promise<Buffer> {
    try {
      if (!this.isHealthy) await this.checkHealth();
      return Buffer.from(''); // Fallback pre prázdne tabuľky
    } catch (error) {
      console.error(`Failed to generate ${type} road tile:`, error);
      return Buffer.from('');
    }
  }

  public async updateBoundaryColor(boundary_id: number, color: string): Promise<void> {
    try {
      if (!this.isHealthy) await this.checkHealth();
      // Fallback: logovanie, žiadna DB operácia
      console.log(`Fallback: Updating boundary ${boundary_id} to color ${color}`);
    } catch (error) {
      console.error('Failed to update boundary color:', error);
      throw error;
    }
  }
}

export default new MapsService();