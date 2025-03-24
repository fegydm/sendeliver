// File: back/src/services/language.services.ts

import pool from '../configs/db.js';

interface Language {
  code: string;
  name_en: string;
  native_name: string;
  is_rtl: boolean;
}

/**
 * Service for handling language-related operations
 */
class LanguageServices {
  /**
   * Retrieves all languages from the geo.languages table
   * @returns {Promise<Language[]>} Array of language objects
   */
  async getAllLanguages(): Promise<Language[]> {
    try {
      const query = `
        SELECT 
          code, 
          name_en, 
          native_name, 
          is_rtl
        FROM 
          geo.languages
        ORDER BY 
          name_en ASC
      `;
      
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error fetching languages:', error);
      return [];
    }
  }

  /**
   * Retrieves the default language for a country code
   * @param {string} countryCode ISO country code
   * @returns {Promise<string>} Language code
   */
  async getCountryLanguage(countryCode: string): Promise<string> {
    try {
      const query = `
        SELECT 
          language_code
        FROM 
          geo.countries
        WHERE 
          LOWER(code) = LOWER($1)
      `;
      
      const result = await pool.query(query, [countryCode]);
      
      if (result.rows.length > 0 && result.rows[0].language_code) {
        return result.rows[0].language_code;
      }
      
      // Default to English if no match found
      return 'en';
    } catch (error) {
      console.error('Error fetching country language:', error);
      return 'en';
    }
  }
}

export default new LanguageServices();