// File: ./back/src/services/language.services.ts

import pool from '../configs/db.js';

interface Language {
  code: string;
  name_en: string;
  native_name: string;
  is_rtl: boolean;
  flag_url?: string; 
}

// Define an interface for the database row
interface LanguageRow {
  code: string;
  name_en: string;
  native_name: string;
  is_rtl: boolean;
  flag_url?: string;
  [key: string]: any; // For any additional properties
}

// Default fallback languages to use if database query fails
const fallbackLanguages: Language[] = [
  { code: "en", name_en: "English", native_name: "English", is_rtl: false, flag_url: "/flags/4x3/optimized/gb.svg" },
  { code: "sk", name_en: "Slovak", native_name: "Slovenčina", is_rtl: false, flag_url: "/flags/4x3/optimized/sk.svg" },
  { code: "cs", name_en: "Czech", native_name: "Čeština", is_rtl: false, flag_url: "/flags/4x3/optimized/cz.svg" },
  { code: "de", name_en: "German", native_name: "Deutsch", is_rtl: false, flag_url: "/flags/4x3/optimized/de.svg" }
];

/**
 * Service for handling language-related operations
 */
class LanguageServices {
  private cachedLanguages: Language[] | null = null;
  
  /**
   * Retrieves all languages from the geo.languages table
   * @returns {Promise<Language[]>} Array of language objects
   */
  async getAllLanguages(): Promise<Language[]> {
    // Return cached languages if available
    if (this.cachedLanguages && this.cachedLanguages.length > 0) {
      return this.cachedLanguages;
    }
    
    try {
      // Simplified query that uses primary_country_code for flags
      const query = `
        SELECT 
          code_2 as code,
          name_en,
          native_name,
          is_rtl,
          CASE 
            WHEN primary_country_code IS NOT NULL AND primary_country_code != '' 
            THEN CONCAT('/flags/4x3/optimized/', LOWER(primary_country_code), '.svg')
            ELSE CONCAT('/flags/4x3/optimized/', LOWER(code_2), '.svg')
          END as flag_url
        FROM 
          geo.languages
        ORDER BY 
          name_en ASC
      `;
      
      console.log("Executing languages query");
      const result = await pool.query(query);
      console.log(`Query returned ${result.rows.length} languages`);
      
      // Validate data structure before returning - with explicit type for row
      const validatedData = result.rows.map((row: LanguageRow) => ({
        code: row.code || '',
        name_en: row.name_en || row.code || 'Unknown',
        native_name: row.native_name || row.name_en || row.code || 'Unknown',
        is_rtl: !!row.is_rtl,
        flag_url: row.flag_url || `/flags/4x3/optimized/${row.code?.toLowerCase() || 'xx'}.svg`
      }));
      
      if (validatedData.length === 0) {
        console.warn("No languages found in the database, using fallback");
        return fallbackLanguages;
      }
      
      // Cache the results
      this.cachedLanguages = validatedData;
      return validatedData;
    } catch (error) {
      console.error('Error fetching languages:', error);
      return fallbackLanguages;
    }
  }

  /**
   * Retrieves the default language for a country code
   * @param {string} countryCode ISO country code
   * @returns {Promise<string>} Language code
   */
  async getCountryLanguage(countryCode: string): Promise<string> {
    try {
      // Sanitize and validate country code
      if (!countryCode || typeof countryCode !== 'string' || countryCode.length > 2) {
        console.warn(`Invalid country code provided: ${countryCode}`);
        return 'en';
      }
      
      const validatedCountryCode = countryCode.trim().toLowerCase();
      
      // Find languages where this country is the primary country
      const query = `
        SELECT 
          code_2 as code
        FROM 
          geo.languages
        WHERE 
          LOWER(primary_country_code) = $1
        LIMIT 1
      `;
      
      const result = await pool.query(query, [validatedCountryCode]);
      
      if (result.rows.length > 0 && result.rows[0].code) {
        return result.rows[0].code;
      }
      
      // Hardcoded mappings for common countries
      if (validatedCountryCode === 'gb') return 'en';
      if (validatedCountryCode === 'us') return 'en';
      if (validatedCountryCode === 'sk') return 'sk';
      if (validatedCountryCode === 'cz') return 'cs';
      if (validatedCountryCode === 'de') return 'de';
      if (validatedCountryCode === 'fr') return 'fr';
      if (validatedCountryCode === 'es') return 'es';
      if (validatedCountryCode === 'it') return 'it';
      if (validatedCountryCode === 'ru') return 'ru';
      if (validatedCountryCode === 'cn') return 'zh';
      if (validatedCountryCode === 'jp') return 'ja';
      
      // Default to English if no match found
      return 'en';
    } catch (error) {
      console.error('Error fetching country language:', error);
      return 'en';
    }
  }
  
  /**
   * Gets language details for a specific language code
   * @param {string} languageCode ISO language code 
   * @returns {Promise<Language>} Language details
   */
  async getLanguageDetails(languageCode: string): Promise<Language> {
    try {
      // Get all languages first
      const allLanguages = await this.getAllLanguages();
      
      // Find the requested language
      const languageDetails = allLanguages.find(lang => 
        lang.code.toLowerCase() === languageCode.toLowerCase()
      );
      
      if (languageDetails) {
        return languageDetails;
      }
      
      // Fallback to English if not found
      const englishLanguage = allLanguages.find(lang => lang.code === 'en');
      if (englishLanguage) {
        return englishLanguage;
      }
      
      // Ultimate fallback
      return fallbackLanguages[0];
      
    } catch (error) {
      console.error('Error fetching language details:', error);
      return fallbackLanguages[0];
    }
  }
}

export default new LanguageServices();