// File: ./back/src/services/geo.translations.services.ts
// Last change: Fixed TypeScript error with result.rowCount

import { pool } from '../configs/db.js';
import {
  GET_TRANSLATIONS_QUERY,
  CHECK_TRANSLATIONS_TABLE_QUERY,
  GET_LANGUAGE_ID_BY_LC_QUERY,
  COUNT_TRANSLATIONS_BY_LC_QUERY
} from "../queries/geo.translations.queries.js";

interface Translation {
  key: string;
  text: string;
}

class TranslationsService {
  private tableCheckCache: boolean | null = null;
  private languageIdCache: Record<string, number> = {};
  private readonly DEFAULT_LC = 'en'; // Fallback na "en"
  private availabilityCache: Record<string, {count: number, timestamp: number}> = {};
  private readonly AVAILABILITY_CACHE_TTL = 3600000; // 1 hour in milliseconds

  async getTranslations(lc: string): Promise<Record<string, string>> {
    const start = performance.now();

    if (!lc || lc.length !== 2) {
      console.warn(`[TranslationsService] Invalid lc '${lc}', falling back to '${this.DEFAULT_LC}'`);
      lc = this.DEFAULT_LC;
    }

    lc = lc.toLowerCase(); 

    try {
      console.log(`[TranslationsService] Fetching translations for lc '${lc}'`);

      const tableExists = await this.checkTableExists();
      if (!tableExists) {
        console.warn('[TranslationsService] Translations table does not exist');
        return {};
      }

      const languageIdOrNull = await this.getLanguageIdByLc(lc);
      if (!languageIdOrNull) {
        console.warn(`[TranslationsService] No language_id found for lc '${lc}', falling back to '${this.DEFAULT_LC}'`);
        const fallbackIdOrNull = await this.getLanguageIdByLc(this.DEFAULT_LC);
        if (!fallbackIdOrNull) {
          console.error('[TranslationsService] Fallback language_id for "en" not found');
          return {};
        }
        
        const result = await pool.query(GET_TRANSLATIONS_QUERY, [fallbackIdOrNull]);
        const translations: Record<string, string> = Object.fromEntries(
          result.rows.map((row: Translation) => [row.key, row.text])
        );

        const duration = performance.now() - start;
        console.log(`[TranslationsService] Fetched ${result.rows.length} rows for fallback '${this.DEFAULT_LC}' in ${duration.toFixed(2)}ms`);

        // Using rows.length which is definitely a number, not rowCount
        this.updateAvailabilityCache(lc, result.rows.length);
        return translations;
      }
      
      const languageId = languageIdOrNull; // Safe to use now
      const result = await pool.query(GET_TRANSLATIONS_QUERY, [languageId]);
      const translations: Record<string, string> = Object.fromEntries(
        result.rows.map((row: Translation) => [row.key, row.text])
      );

      const duration = performance.now() - start;
      // Use result.rows.length instead of result.rowCount to avoid type issues
      const rowCount = result.rows.length;
      console.log(`[TranslationsService] Fetched ${rowCount} rows for lc '${lc}' (language_id: ${languageId}) in ${duration.toFixed(2)}ms`);

      // Using rows.length which is definitely a number
      this.updateAvailabilityCache(lc, rowCount);

      return translations;
    } catch (error) {
      console.error(`[TranslationsService] Error fetching translations for lc '${lc}':`, error);
      return {};
    }
  }

  /**
   * Checks if translations are available for a specific language code
   * This method is optimized for quick response to avoid unnecessary full translation fetches
   */
  async checkTranslationsAvailable(lc: string): Promise<{available: boolean, count: number}> {
    if (!lc || lc.length !== 2) {
      console.warn(`[TranslationsService] Invalid lc '${lc}' in availability check`);
      return { available: false, count: 0 };
    }

    lc = lc.toLowerCase();

    // Check cache first for very fast response
    const cachedResult = this.getAvailabilityFromCache(lc);
    if (cachedResult !== null) {
      return { 
        available: cachedResult > 0, 
        count: cachedResult 
      };
    }

    try {
      const tableExists = await this.checkTableExists();
      if (!tableExists) {
        return { available: false, count: 0 };
      }

      // Get language ID for the requested language code
      const languageIdOrNull = await this.getLanguageIdByLc(lc);
      
      // Early return if language ID doesn't exist
      if (!languageIdOrNull) {
        console.log(`[TranslationsService] No language_id found for lc '${lc}' in availability check`);
        this.updateAvailabilityCache(lc, 0);
        return { available: false, count: 0 };
      }
      
      // At this point languageId is definitely not null
      const languageId = languageIdOrNull;

      // Count translations for this language (much faster than fetching all translations)
      const start = performance.now();
      const result = await pool.query(COUNT_TRANSLATIONS_BY_LC_QUERY, [languageId]);
      const count = parseInt(result.rows[0]?.count || '0', 10);
      
      const duration = performance.now() - start;
      console.log(`[TranslationsService] Checked translations count for lc '${lc}': ${count} (in ${duration.toFixed(2)}ms)`);
      
      // Update cache
      this.updateAvailabilityCache(lc, count);
      
      return { 
        available: count > 0, 
        count 
      };
    } catch (error) {
      console.error(`[TranslationsService] Error checking translations availability for lc '${lc}':`, error);
      return { available: false, count: 0 };
    }
  }

  private async getLanguageIdByLc(lc: string): Promise<number | null> {
    if (this.languageIdCache[lc]) {
      console.log(`[TranslationsService] Using cached language_id for lc '${lc}': ${this.languageIdCache[lc]}`);
      return this.languageIdCache[lc];
    }

    try {
      const result = await pool.query(GET_LANGUAGE_ID_BY_LC_QUERY, [lc]);
      if (result.rowCount === 0) return null;
      const languageId = result.rows[0].id;
      this.languageIdCache[lc] = languageId;
      console.log(`[TranslationsService] Mapped lc '${lc}' to language_id ${languageId}`);
      return languageId;
    } catch (error) {
      console.error(`[TranslationsService] Error mapping lc '${lc}' to language_id:`, error);
      return null;
    }
  }

  private async checkTableExists(): Promise<boolean> {
    if (this.tableCheckCache !== null) {
      return this.tableCheckCache === true;
    }
  
    try {
      const result = await pool.query(CHECK_TRANSLATIONS_TABLE_QUERY);
      this.tableCheckCache = result.rows[0].exists === true;
      return this.tableCheckCache;
    } catch (error) {
      console.error('[TranslationsService] Error checking table existence:', error);
      this.tableCheckCache = false;
      return false;
    }
  }

  private getAvailabilityFromCache(lc: string): number | null {
    const cacheEntry = this.availabilityCache[lc];
    if (!cacheEntry) return null;
    
    // Check if cache entry is still valid
    if (Date.now() - cacheEntry.timestamp < this.AVAILABILITY_CACHE_TTL) {
      return cacheEntry.count;
    }
    
    return null;
  }

  private updateAvailabilityCache(lc: string, count: number): void {
    this.availabilityCache[lc] = {
      count,
      timestamp: Date.now()
    };
  }
}

export default new TranslationsService();