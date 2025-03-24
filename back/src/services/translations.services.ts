// File: ./back/src/services/translations.services.ts

import pool from '../configs/db.js';

interface Translation {
  key: string;
  text: string;
  namespace?: string;
}

/**
 * Service for handling translations
 */
class TranslationsServices {
  /**
   * Retrieves translations for a specific language
   * @param {string} languageCode - ISO language code
   * @returns {Promise<Record<string, string>>} Object with key-value translation pairs
   */
  async getTranslations(languageCode: string): Promise<Record<string, string>> {
    try {
      // First check if table exists
      const tableExists = await this.checkTableExists();
      if (!tableExists) {
        console.error("Table geo.translations does not exist");
        return {};
      }
      
      // Convert language code to language_id
      const languageId = await this.getLanguageId(languageCode);
      if (!languageId) {
        console.warn(`Language ID not found for code: ${languageCode}`);
        return {};
      }
      
      // Fetch translations
      const query = `
        SELECT 
          key, 
          text,
          namespace
        FROM 
          geo.translations
        WHERE 
          language_id = $1
      `;
      
      const result = await pool.query(query, [languageId]);
      
      // Convert array to key-value object
      const translations: Record<string, string> = {};
      result.rows.forEach((row: Translation) => {
        translations[row.key] = row.text;
      });
      
      return translations;
    } catch (error) {
      console.error('Error fetching translations:', error);
      return {};
    }
  }
  
  /**
   * Get language_id from language code
   * @param {string} code - Language code
   * @returns {Promise<number|null>} - Language ID or null
   */
  private async getLanguageId(code: string): Promise<number | null> {
    try {
      const query = `
        SELECT id FROM geo.languages WHERE code_2 = $1
      `;
      
      const result = await pool.query(query, [code]);
      
      if (result.rows.length > 0) {
        return result.rows[0].id;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting language ID:', error);
      return null;
    }
  }
  
  /**
   * Check if translations table exists
   * @returns {Promise<boolean>}
   */
  private async checkTableExists(): Promise<boolean> {
    try {
      const query = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'geo' 
          AND table_name = 'translations'
        );
      `;
      
      const result = await pool.query(query);
      return result.rows[0].exists;
    } catch (error) {
      console.error('Error checking table existence:', error);
      return false;
    }
  }
}

export default new TranslationsServices();