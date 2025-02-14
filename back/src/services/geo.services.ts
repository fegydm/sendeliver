// File: ./back/src/services/geo.service.ts
// Last change: Enhanced debugging and country code handling

import { pool } from "../configs/db.js";
import {
  GET_COUNTRIES_QUERY,
  CHECK_LOCATION_EXISTS_QUERY,
  SEARCH_LOCATION_QUERY,
  SEARCH_LOCATION_BY_COUNTRY_QUERY
} from "./geo.queries.js";

// Frontend interfaces
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

export class GeoService {
  private static instance: GeoService;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
  private isHealthy = true;
  private static countriesCache: any[] | null = null;
  private static lastCacheTime: number = 0;

  private constructor() {
    this.checkHealth();
  }

  public static getInstance(): GeoService {
    if (!GeoService.instance) {
      GeoService.instance = new GeoService();
    }
    return GeoService.instance;
  }

  private isCacheValid(): boolean {
    const cacheAge = Date.now() - GeoService.lastCacheTime;
    const isValid = GeoService.countriesCache !== null && cacheAge < this.CACHE_DURATION;
    
    console.log('Cache status:', {
      hasCache: GeoService.countriesCache !== null,
      cacheAge: `${Math.round(cacheAge / 1000)}s`,
      maxAge: `${this.CACHE_DURATION / 1000}s`,
      isValid
    });

    return isValid;
  }

  // Health check for database connection
  private async checkHealth(): Promise<void> {
    try {
      await pool.query('SELECT 1');
      this.isHealthy = true;
    } catch (error) {
      this.isHealthy = false;
      console.error("Database health check failed:", error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  // Check if we should use exact country matching
  private shouldUseExactCountryMatch(countryCode?: string): boolean {
    console.log('🕵️ Checking exact country match:', {
      countryCode,
      isExactMatch: countryCode?.length === 2
    });
    return countryCode?.length === 2;
  }

  // Check if there's any search input
  private hasSearchInput(psc?: string, city?: string): boolean {
    return !!(psc || city);
  }

  // Get appropriate country code filter
  private getCountryCodeFilter(countryCode?: string): string | undefined {
    if (!countryCode) return undefined;
    
    // Normalizácia vstupu
    const normalizedCode = countryCode.trim().toUpperCase();
    
    // Presná zhoda pre 2-znakový kód
    if (normalizedCode.length === 2) return normalizedCode;
    
    // Čiastočná zhoda pre 1-znakový kód
    if (normalizedCode.length === 1) return normalizedCode;
    
    return undefined;
  }

  // Get list of all countries
  public async getCountries() {
    try {
      if (!this.isHealthy) {
        await this.checkHealth();
      }

      if (this.isCacheValid()) {
        console.log('✅ Returning cached countries data');
        return GeoService.countriesCache;
      }

      console.log('🔄 Fetching fresh countries data');
      const result = await pool.query(GET_COUNTRIES_QUERY);
      GeoService.countriesCache = result.rows;
      GeoService.lastCacheTime = Date.now();
      return result.rows;

    } catch (error) {
      console.error('Failed to fetch countries:', error);
      GeoService.countriesCache = null;
      GeoService.lastCacheTime = 0;
      throw error;
    }
  }

  // Search locations with given parameters
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

      // Pridaná explicitná kontrola
      const countryFilter = this.getCountryCodeFilter(params.cc);
      
      console.log('🌍 Country Filter:', countryFilter);

      // Upravená podmienka pre spustenie query
      if (!this.hasSearchInput(params.psc, params.city) && !countryFilter) {
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

      // Transform database results to frontend format
      return { 
        results: result.rows.map(row => ({
          cc: row.country_code,
          psc: row.postal_code,
          city: row.place_name,
          country: row.country,
          flag_url: row.flag_url,
          logistics_priority: row.logistics_priority
        })),
        hasMore: result.rows.length >= params.limit
      };

    } catch (error) {
      console.error('Failed to search locations:', error);
      throw error;
    }
  }

  // Check if location exists
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
      
      return result.rows[0].found;

    } catch (error) {
      console.error('Failed to check location:', error);
      throw error;
    }
  }
}