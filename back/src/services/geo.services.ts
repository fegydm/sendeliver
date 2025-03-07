// File: .back/src/services/geo.services.ts
// Last change: Added explicit type for row parameter in map function

import { pool } from "../configs/db.js";
import {
  GET_COUNTRIES_QUERY,
  CHECK_LOCATION_EXISTS_QUERY,
  SEARCH_LOCATION_QUERY,
  SEARCH_LOCATION_BY_COUNTRY_QUERY,
  GET_COUNTRY_POSTAL_FORMAT_QUERY,
} from "./geo.queries.js";

interface SearchParams {
  psc?: string;
  city?: string;
  cc?: string;
  limit: number;
  pagination: {
    lastPsc?: string;
    lastCity?: string;
  };
}

interface SearchResult {
  results: any[];
  hasMore: boolean;
}

// Define location row interface
interface LocationRow {
  country_code: string;
  postal_code: string;
  place_name: string;
  country: string;
  flag_url: string;
  logistics_priority: number;
  latitude?: number;
  longitude?: number;
}

export class GeoService {
  private static instance: GeoService;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
  private isHealthy = true;
  private static countriesCache: any[] | null = null;
  private static lastCacheTime: number = 0;

  private constructor() {
    console.log('🔧 GeoService instance created');
    this.checkHealth().catch(err => console.error('Initial health check failed:', err));
  }

  public static getInstance(): GeoService {
    if (!GeoService.instance) {
      console.log('➕ Creating new GeoService instance');
      GeoService.instance = new GeoService();
    }
    return GeoService.instance;
  }

  private isCacheValid(): boolean {
    const cacheAge = Date.now() - GeoService.lastCacheTime;
    const isValid = GeoService.countriesCache !== null && cacheAge < this.CACHE_DURATION;
    
    console.log('🕵️ Checking cache validity:', {
      hasCache: GeoService.countriesCache !== null,
      cacheLength: GeoService.countriesCache?.length || 0,
      cacheAge: `${Math.round(cacheAge / 1000)}s`,
      maxAge: `${this.CACHE_DURATION / 1000}s`,
      isValid
    });

    return isValid;
  }

  private async checkHealth(): Promise<void> {
    console.log('🔍 Starting database health check');
    try {
      const result = await pool.query('SELECT 1');
      this.isHealthy = true;
      console.log('✅ Database health check passed:', result.rows);
    } catch (error) {
      this.isHealthy = false;
      console.error('❌ Database health check failed:', error instanceof Error ? error.stack : error);
      throw error;
    }
  }

  private shouldUseExactCountryMatch(countryCode?: string): boolean {
    console.log('🕵️ Checking exact country match:', {
      countryCode,
      isExactMatch: countryCode?.length === 2
    });
    return countryCode?.length === 2;
  }

  private hasSearchInput(psc?: string, city?: string): boolean {
    return !!(psc || city);
  }

  private getCountryCodeFilter(countryCode?: string): string | undefined {
    if (!countryCode) return undefined;
    
    const normalizedCode = countryCode.trim().toUpperCase();
    console.log('🌍 Normalizing country code:', { input: countryCode, normalized: normalizedCode });
    
    if (normalizedCode.length === 2) return normalizedCode;
    if (normalizedCode.length === 1) return normalizedCode;
    
    return undefined;
  }

  public async getCountries() {
    console.log('🌍 Starting getCountries');
    try {
      if (!this.isHealthy) {
        console.log('⚠️ Service not healthy, running health check');
        await this.checkHealth();
        console.log('✅ Health restored after check');
      }

      if (this.isCacheValid()) {
        console.log('✅ Returning cached countries:', GeoService.countriesCache?.length || 0);
        return GeoService.countriesCache;
      }

      console.log('🔄 Fetching fresh countries data');
      console.log('📜 Query:', GET_COUNTRIES_QUERY);
      const result = await pool.query(GET_COUNTRIES_QUERY);
      console.log('📊 Countries fetched from DB:', {
        rowCount: result.rowCount,
        rows: result.rows
      });
      GeoService.countriesCache = result.rows;
      GeoService.lastCacheTime = Date.now();
      console.log('✅ Countries cached:', {
        total: result.rows.length,
        timestamp: new Date(GeoService.lastCacheTime).toISOString()
      });
      return result.rows;

    } catch (error) {
      console.error('❌ Failed to fetch countries:', error instanceof Error ? error.stack : error);
      GeoService.countriesCache = null;
      GeoService.lastCacheTime = 0;
      throw error;
    }
  }

  public async getCountryPostalFormat(cc: string) {
    try {
      if (!this.isHealthy) {
        await this.checkHealth();
      }

      const normalizedCC = cc.trim().toUpperCase();
      console.log('📮 Fetching postal format for:', normalizedCC);

      const result = await pool.query(GET_COUNTRY_POSTAL_FORMAT_QUERY, [normalizedCC]);
      console.log('📊 Postal format result:', result.rows);

      if (result.rows.length === 0) {
        console.warn(`⚠️ No postal format found for country code: ${normalizedCC}`);
        return null;
      }

      return {
        postal_code_format: result.rows[0].postal_code_format,
        postal_code_regex: result.rows[0].postal_code_regex
      };

    } catch (error) {
      console.error(`❌ Failed to get postal format for ${cc}:`, error);
      throw error;
    }
  }

  public async searchLocations(params: SearchParams): Promise<SearchResult> {
    try {
      if (!this.isHealthy) {
        await this.checkHealth();
      }

      console.log('🔍 Detailed Search Params:', {
        cc: params.cc,
        psc: params.psc,
        city: params.city,
        shouldUseExactCountryMatch: this.shouldUseExactCountryMatch(params.cc),
        countryFilter: this.getCountryCodeFilter(params.cc)
      });

      const countryFilter = this.getCountryCodeFilter(params.cc);
      console.log('🌍 Country Filter:', countryFilter);

      if (!this.hasSearchInput(params.psc, params.city) && !countryFilter) {
        console.log('⚠️ No search input or country filter, returning empty');
        return { results: [], hasMore: false };
      }

      let result;
      if (this.shouldUseExactCountryMatch(params.cc)) {
        console.log('🎯 Using Exact Country Match Query');
        result = await pool.query(SEARCH_LOCATION_BY_COUNTRY_QUERY, [
          params.psc || null,
          params.city || null,
          params.cc,
          params.pagination.lastPsc || null,
          params.pagination.lastCity || null,
          params.limit
        ]);
      } else {
        console.log('🔎 Using General Location Query');
        result = await pool.query(SEARCH_LOCATION_QUERY, [
          params.psc || null,
          params.city || null,
          countryFilter || null,
          params.pagination.lastPsc || null,
          params.pagination.lastCity || null,
          params.limit
        ]);
      }

      console.log(`📊 Found ${result.rows.length} locations`);
      
      if (result.rows.length > 0) {
        console.log('🔍 Sample row data:', { 
          firstRow: result.rows[0],
          hasCoordinates: result.rows[0].latitude !== undefined && result.rows[0].longitude !== undefined
        });
      }

      return { 
        results: result.rows.map((row: LocationRow) => ({
          cc: row.country_code,
          psc: row.postal_code,
          city: row.place_name,
          country: row.country,
          flag_url: row.flag_url,
          logistics_priority: row.logistics_priority,
          lat: row.latitude,
          lng: row.longitude
        })),
        hasMore: result.rows.length >= params.limit
      };

    } catch (error) {
      console.error('❌ Failed to search locations:', error);
      throw error;
    }
  }

  public async checkLocationExists(
    psc?: string,
    city?: string,
    cc?: string
  ): Promise<boolean> {
    try {
      if (!this.isHealthy) {
        await this.checkHealth();
      }

      const result = await pool.query(CHECK_LOCATION_EXISTS_QUERY, [
        psc || null,
        city || null,
        cc || null
      ]);
      
      console.log('🕵️ Location check result:', result.rows[0]);
      return result.rows[0].found;

    } catch (error) {
      console.error('❌ Failed to check location:', error);
      throw error;
    }
  }
}