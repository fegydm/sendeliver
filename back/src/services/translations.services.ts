// File: ./back/src/services/translations.services.ts
// Last change: Added performance timing and table check caching

import { pool } from '../configs/db.js';
import {
  GET_TRANSLATIONS_QUERY,
  CHECK_TRANSLATIONS_TABLE_QUERY
} from "../queries/translations.queries.js";

interface Translation {
  key: string;
  text: string;
}

class TranslationsService {
  // Cache for table check result
  private tableCheckCache: boolean | null = null;

  async getTranslations(languageCode: string): Promise<Record<string, string>> {
    const start = performance.now();

    try {
      console.log(`[TranslationsService] Fetching translations for '${languageCode}'`);

      const tableExists = await this.checkTableExists();
      if (!tableExists) {
        console.warn('[TranslationsService] Translations table does not exist');
        return {};
      }

      const result = await pool.query(GET_TRANSLATIONS_QUERY, [languageCode]);
      const translations: Record<string, string> = {};

      result.rows.forEach((row: Translation) => {
        translations[row.key] = row.text;
      });

      const duration = performance.now() - start;
      console.log(`[TranslationsService] Fetched ${result.rowCount} rows for '${languageCode}' in ${duration.toFixed(2)}ms`);

      return translations;
    } catch (error) {
      console.error(`[TranslationsService] Error fetching translations for '${languageCode}':`, error);
      return {};
    }
  }

  private async checkTableExists(): Promise<boolean> {
    if (this.tableCheckCache !== null) {
      return this.tableCheckCache === true; // ⬅️ explicitne vraciame boolean
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
