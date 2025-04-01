// File: ./back/src/services/geo.countries.services.ts
// Last change: Fixed return type handling for null values

import { pool } from "../configs/db.js";
import { 
  GET_COUNTRIES_QUERY,
  CHECK_LOCATION_EXISTS_QUERY,
  SEARCH_LOCATION_QUERY,
  SEARCH_LOCATION_BY_COUNTRY_QUERY,
  GET_COUNTRY_POSTAL_FORMAT_QUERY
} from "../queries/geo.countries.queries.js";

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

// Define the Country interface to match database structure
interface DbCountry {
  code_2: string;
  name_en: string;
  name_local: string;
  name_sk: string;
  logistics_priority: number;
  code_3?: string;
  [key: string]: any; // For any other properties that might exist
}

// Define the frontend Country interface
interface Country {
  cc: string;
  name_en: string;
  name_local: string;
  name_sk: string;
  logistics_priority: number;
  code_3?: string;
  [key: string]: any; // For any other properties we want to pass through
}

class CountriesService {
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private isHealthy = true;
  private countriesCache: Country[] = []; // Changed from null to empty array
  private lastCacheTime: number = 0;

  private isCacheValid(): boolean {
    const cacheAge = Date.now() - this.lastCacheTime;
    return this.countriesCache.length > 0 && cacheAge < this.CACHE_DURATION; // Check for length instead of null
  }

  private async checkHealth(): Promise<void> {
    try {
      await pool.query('SELECT 1');
      this.isHealthy = true;
    } catch (error) {
      this.isHealthy = false;
      throw error;
    }
  }

  private shouldUseExactCountryMatch(countryCode?: string): boolean {
    return countryCode?.length === 2;
  }

  private hasSearchInput(psc?: string, city?: string): boolean {
    return !!(psc || city);
  }

  private getCountryCodeFilter(countryCode?: string): string | undefined {
    if (!countryCode) return undefined;
    const normalizedCode = countryCode.trim().toUpperCase();
    if (normalizedCode.length === 2 || normalizedCode.length === 1) return normalizedCode;
    return undefined;
  }

  public async getCountries(): Promise<Country[]> {
    try {
      if (!this.isHealthy) await this.checkHealth();
      if (this.isCacheValid()) return this.countriesCache;

      const result = await pool.query(GET_COUNTRIES_QUERY);
      
      // Map database field code_2 to cc for frontend consistency
      this.countriesCache = result.rows.map((country: DbCountry): Country => ({
        cc: country.code_2,  // Map code_2 to cc
        name_en: country.name_en,
        name_local: country.name_local,
        name_sk: country.name_sk,
        logistics_priority: country.logistics_priority,
        // Preserve any other fields that might be needed
        code_3: country.code_3
      }));
      
      this.lastCacheTime = Date.now();
      return this.countriesCache;
    } catch (error) {
      this.countriesCache = []; // Set to empty array instead of null
      this.lastCacheTime = 0;
      throw error; // This will propagate the error up
    }
  }

  public async getCountryPostalFormat(cc: string) {
    try {
      if (!this.isHealthy) await this.checkHealth();

      const normalizedCC = cc.trim().toUpperCase();
      const result = await pool.query(GET_COUNTRY_POSTAL_FORMAT_QUERY, [normalizedCC]);

      if (result.rows.length === 0) return null;

      return {
        postal_code_format: result.rows[0].postal_code_format,
        postal_code_regex: result.rows[0].postal_code_regex
      };
    } catch (error) {
      throw error;
    }
  }

  public async searchLocations(params: SearchParams): Promise<SearchResult> {
    try {
      if (!this.isHealthy) await this.checkHealth();

      const countryFilter = this.getCountryCodeFilter(params.cc);

      if (!this.hasSearchInput(params.psc, params.city) && !countryFilter) {
        return { results: [], hasMore: false };
      }

      let result;
      if (this.shouldUseExactCountryMatch(params.cc)) {
        result = await pool.query(SEARCH_LOCATION_BY_COUNTRY_QUERY, [
          params.psc || null,
          params.city || null,
          params.cc,
          params.pagination.lastPsc || null,
          params.pagination.lastCity || null,
          params.limit
        ]);
      } else {
        result = await pool.query(SEARCH_LOCATION_QUERY, [
          params.psc || null,
          params.city || null,
          countryFilter || null,
          params.pagination.lastPsc || null,
          params.pagination.lastCity || null,
          params.limit
        ]);
      }

      return { 
        results: result.rows.map((row: any) => ({
          cc: row.country_code,  // This mapping should be consistent
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
      throw error;
    }
  }

  public async checkLocationExists(psc?: string, city?: string, cc?: string): Promise<boolean> {
    try {
      if (!this.isHealthy) await this.checkHealth();

      const result = await pool.query(CHECK_LOCATION_EXISTS_QUERY, [psc || null, city || null, cc || null]);
      return result.rows[0].found;
    } catch (error) {
      throw error;
    }
  }
}

export default new CountriesService();