// File: ./back/src/services/translations.services.ts
import { pool } from '../configs/db.js';
import { 
  GET_TRANSLATIONS_QUERY, 
  GET_LANGUAGE_ID_QUERY, 
  CHECK_TRANSLATIONS_TABLE_QUERY 
} from "../queries/translations.queries.js";

interface Translation {
  key: string;
  text: string;
  namespace?: string;
}

class TranslationsService {
  async getTranslations(languageCode: string): Promise<Record<string, string>> {
    try {
      const tableExists = await this.checkTableExists();
      if (!tableExists) return {};
      
      const languageId = await this.getLanguageId(languageCode);
      if (!languageId) return {};
      
      const result = await pool.query(GET_TRANSLATIONS_QUERY, [languageId]);
      const translations: Record<string, string> = {};
      result.rows.forEach((row: Translation) => {
        translations[row.key] = row.text;
      });
      
      return translations;
    } catch (error) {
      return {};
    }
  }

  private async getLanguageId(code: string): Promise<number | null> {
    try {
      const result = await pool.query(GET_LANGUAGE_ID_QUERY, [code]);
      if (result.rows.length > 0) return result.rows[0].id;
      return null;
    } catch (error) {
      return null;
    }
  }

  private async checkTableExists(): Promise<boolean> {
    try {
      const result = await pool.query(CHECK_TRANSLATIONS_TABLE_QUERY);
      return result.rows[0].exists;
    } catch (error) {
      return false;
    }
  }
}

export default new TranslationsService();