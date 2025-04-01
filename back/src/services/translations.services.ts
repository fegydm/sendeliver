// File: ./back/src/services/translations.services.ts
// Last change: Added performance timing and table check caching
import { pool } from '../configs/db.js';
import {
  GET_TRANSLATIONS_QUERY,
  CHECK_TRANSLATIONS_TABLE_QUERY,
  GET_LANGUAGE_ID_BY_LC_QUERY
} from "../queries/translations.queries.js";

interface Translation {
  key: string;
  text: string;
}

class TranslationsService {
  private tableCheckCache: boolean | null = null;
  private languageIdCache: Record<string, number> = {}; // Cache pre lc -> language_id

  async getTranslations(lc: string): Promise<Record<string, string>> {
    const start = performance.now();

    try {
      console.log(`[TranslationsService] Fetching translations for lc '${lc}'`);

      const tableExists = await this.checkTableExists();
      if (!tableExists) {
        console.warn('[TranslationsService] Translations table does not exist');
        return {};
      }

      // Mapping lc to language_id
      const languageId = await this.getLanguageIdByLc(lc);
      if (!languageId) {
        console.warn(`[TranslationsService] No language_id found for lc '${lc}'`);
        return {};
      }

      const result = await pool.query(GET_TRANSLATIONS_QUERY, [languageId]);
      const translations: Record<string, string> = {};

      result.rows.forEach((row: Translation) => {
        translations[row.key] = row.text;
      });

      const duration = performance.now() - start;
      console.log(`[TranslationsService] Fetched ${result.rowCount} rows for lc '${lc}' (language_id: ${languageId}) in ${duration.toFixed(2)}ms`);

      return translations;
    } catch (error) {
      console.error(`[TranslationsService] Error fetching translations for lc '${lc}':`, error);
      return {};
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
}

export default new TranslationsService();