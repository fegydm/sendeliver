// File: ./back/src/services/maps.services.ts
// Last change: Updated queries for BE services to differentiate between simple and OSM tile handling

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

  // ENG: Get countries boundaries as GeoJSON based on zoom level and bbox.
  // For zoom 0-4: Global countries with simplified geometry.
  // For zoom 5+: European regions with full detail (optionally filtering by admin_level).
  public async getCountriesGeoJson(zoom: number, bbox?: [number, number, number, number]): Promise<GeoJson> {
    try {
      // ENG: Ensure the database is healthy.
      if (!this.isHealthy) await this.checkHealth();

      // ENG: Create a unique cache key based on zoom and bbox.
      const cacheKey = `${zoom}_${bbox ? bbox.join(',') : 'no_bbox'}`;
      if (this.isCacheValid(cacheKey)) {
        return this.geoJsonCache.get(cacheKey)!;
      }

      let query = '';
      const queryParams: any[] = [];

      // ENG: Adjust the SQL query based on zoom level.
      if (zoom <= 4) {
        // ENG: For zoom levels 0-4, query global country boundaries with geometry simplified.
        query = `
          SELECT jsonb_build_object(
            'type', 'FeatureCollection',
            'features', jsonb_agg(
              jsonb_build_object(
                'type', 'Feature',
                'geometry', ST_AsGeoJSON(ST_Simplify(b.geom, 0.1))::jsonb,
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
      } else {
        // ENG: For zoom levels 5 and above, query European regions.
        // Optionally, filter by admin_level = 4 (assuming such column exists).
        query = `
          SELECT jsonb_build_object(
            'type', 'FeatureCollection',
            'features', jsonb_agg(
              jsonb_build_object(
                'type', 'Feature',
                'geometry', ST_AsGeoJSON(b.geom)::jsonb,
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
          WHERE b.admin_level = 4
        `;
      }

      // ENG: If bbox is provided, append a WHERE clause to restrict by spatial envelope.
      if (bbox) {
        const [minLon, minLat, maxLon, maxLat] = bbox;
        // If there is already a WHERE clause from admin_level filtering, use AND instead.
        const spatialCondition = `
          ST_Intersects(
            b.geom,
            ST_MakeEnvelope($${queryParams.length + 1}, $${queryParams.length + 2}, $${queryParams.length + 3}, $${queryParams.length + 4}, 4326)
          )
        `;
        queryParams.push(minLon, minLat, maxLon, maxLat);
        // Append condition appropriately.
        if (zoom > 4) {
          query += ` AND ${spatialCondition}`;
        } else {
          query += ` WHERE ${spatialCondition}`;
        }
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

  // ENG: Update the color of a boundary.
  // This is a fallback implementation that logs the change instead of performing a real DB update.
  public async updateBoundaryColor(boundary_id: number, color: string): Promise<void> {
    try {
      if (!this.isHealthy) await this.checkHealth();
      // ENG: Log the update operation (replace with actual DB update logic if needed).
      console.log(`Fallback: Updating boundary ${boundary_id} to color ${color}`);
    } catch (error) {
      console.error('Failed to update boundary color:', error);
      throw error;
    }
  }
}

export default new MapsService();
