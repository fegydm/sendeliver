// File: .back/src/services/geo.services.ts
// Last change: Added equal handling of postal_code and place_name fields

import { pool } from "../configs/db.js";
import {
    GET_COUNTRIES_QUERY,
    CHECK_LOCATION_EXISTS_QUERY,
    SEARCH_LOCATION_QUERY,
    SEARCH_LOCATION_BY_COUNTRY_QUERY
} from "./geo.queries.js";

interface SearchParams {
    postalCode?: string;
    placeName?: string;  // Premenované z city na placeName pre konzistenciu
    countryCode?: string;
    limit: number;
    pagination: {
        lastPostalCode?: string;
        lastPlaceName?: string;
    };
}

interface SearchResult {
    results: LocationSuggestion[];
    hasMore: boolean;
}

interface LocationSuggestion {
    country_code: string;
    postal_code: string;
    place_name: string;
    country: string;
    flag_url: string;
    logistics_priority?: number;
}

export class GeoService {
    private static instance: GeoService;
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    private isHealthy = true;
    private countriesCache: any[] | null = null;
    private lastCacheTime: number = 0;

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
        return this.countriesCache !== null && 
               (Date.now() - this.lastCacheTime) < this.CACHE_DURATION;
    }

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

    private shouldUseExactCountryMatch(countryCode?: string): boolean {
        return countryCode?.length === 2;
    }

    private hasSearchInput(params: SearchParams): boolean {
        return !!(params.postalCode || params.placeName);
    }

    private getCountryCodeFilter(countryCode?: string): string | null {
        if (!countryCode) return null;
        if (countryCode.length === 2) return countryCode;
        if (countryCode.length === 1) return countryCode;
        return null;
    }

    public async searchLocations(params: SearchParams): Promise<SearchResult> {
        try {
            if (!this.isHealthy) {
                await this.checkHealth();
            }

            // Kontrolujeme všetky 3 polia
            console.log('🔍 Search params:', {
                countryCode: params.countryCode || 'empty',
                postalCode: params.postalCode || 'empty',
                placeName: params.placeName || 'empty'
            });

            // Pri prázdnych kritériách vrátime prázdne výsledky
            if (!this.hasSearchInput(params) && !this.shouldUseExactCountryMatch(params.countryCode)) {
                return { results: [], hasMore: false };
            }

            let result;
            const countryFilter = this.getCountryCodeFilter(params.countryCode);

            // Exact country match (2 chars) - použije špecifické query
            if (this.shouldUseExactCountryMatch(params.countryCode)) {
                result = await pool.query(SEARCH_LOCATION_BY_COUNTRY_QUERY, [
                    params.countryCode,
                    params.postalCode || null,           // Postal filter
                    params.pagination.lastPostalCode || null,
                    params.pagination.lastPlaceName || null,
                    params.limit
                ]);
            } 
            // General search - používa sa pre všetky ostatné prípady
            else {
                result = await pool.query(SEARCH_LOCATION_QUERY, [
                    params.postalCode || null,           // Postal filter
                    params.placeName || null,            // Place name filter
                    countryFilter,                       // Country filter (null/1-char)
                    params.pagination.lastPostalCode || null,
                    params.pagination.lastPlaceName || null,
                    params.limit
                ]);
            }

            console.log(`📊 Found ${result.rows.length} locations`);

            return { 
                results: result.rows,
                hasMore: result.rows.length >= params.limit
            };

        } catch (error) {
            console.error('Failed to search locations:', error);
            throw error;
        }
    }

    public async getCountries() {
        try {
            if (!this.isHealthy) {
                await this.checkHealth();
            }

            if (this.isCacheValid()) {
                return this.countriesCache;
            }

            const result = await pool.query(GET_COUNTRIES_QUERY);
            this.countriesCache = result.rows;
            this.lastCacheTime = Date.now();
            return result.rows;

        } catch (error) {
            console.error('Failed to fetch countries:', error);
            this.countriesCache = null;
            this.lastCacheTime = 0;
            throw error;
        }
    }

    public async checkLocationExists(
        postalCode?: string,
        placeName?: string,
        countryCode?: string
    ): Promise<boolean> {
        try {
            if (!this.isHealthy) {
                await this.checkHealth();
            }

            const result = await pool.query(CHECK_LOCATION_EXISTS_QUERY, [
                postalCode || null,
                placeName || null,
                countryCode || null
            ]);
            return result.rows[0].found;

        } catch (error) {
            console.error('Failed to check location:', error);
            throw error;
        }
    }
}