// File: ./back/src/services/language.services.ts

import pool from '../configs/db.js';

interface Language {
  code: string;
  name_en: string;
  native_name: string;
  is_rtl: boolean;
  flag_url?: string; 
}

interface ColumnRow {
  column_name: string;
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
      // Check if table exists first
      const checkTableQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'geo' 
          AND table_name = 'languages'
        );
      `;
      
      const tableExists = await pool.query(checkTableQuery);
      console.log("Table geo.languages exists:", tableExists.rows[0].exists);
      
      if (!tableExists.rows[0].exists) {
        console.error("Table geo.languages does not exist");
        return fallbackLanguages;
      }
      
      // Check columns in the table
      const checkColumnsQuery = `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'geo' 
        AND table_name = 'languages';
      `;
      
      const columnsResult = await pool.query(checkColumnsQuery);
      const columns = columnsResult.rows.map((row: ColumnRow) => row.column_name);
      console.log("Columns in geo.languages:", columns);
      
      // Build dynamic query based on available columns
      let selectColumns = [];
      
      // Handle code column
      if (columns.includes('code_2')) selectColumns.push('code_2 as code');
      else if (columns.includes('code')) selectColumns.push('code');
      else {
        console.error("Required column 'code' or 'code_2' missing from geo.languages");
        return fallbackLanguages;
      }
      
      if (columns.includes('name_en')) selectColumns.push('name_en');
      else selectColumns.push("'Unknown' as name_en");
      
      if (columns.includes('native_name')) selectColumns.push('native_name');
      else if (columns.includes('name_local')) selectColumns.push('name_local as native_name');
      else selectColumns.push("code_2 as native_name");
      
      if (columns.includes('is_rtl')) selectColumns.push('is_rtl');
      else selectColumns.push("false as is_rtl");
      
      // Handle flag URL
      if (columns.includes('primary_country_code')) {
        selectColumns.push(`CASE WHEN primary_country_code IS NOT NULL 
                              THEN CONCAT('/flags/4x3/optimized/', LOWER(primary_country_code), '.svg') 
                              ELSE CONCAT('/flags/4x3/optimized/', LOWER(code_2), '.svg') 
                           END as flag_url`);
      } else {
        selectColumns.push(`CONCAT('/flags/4x3/optimized/', LOWER(code_2), '.svg') as flag_url`);
      }
      
      const query = `
        SELECT 
          ${selectColumns.join(', ')}
        FROM 
          geo.languages
        ORDER BY 
          ${columns.includes('name_en') ? 'name_en' : 'code'} ASC
      `;
      
      console.log("Executing query:", query);
      const result = await pool.query(query);
      console.log(`Query returned ${result.rows.length} languages`);
      
      if (result.rows.length === 0) {
        console.warn("No languages found in the database, using fallback");
        return fallbackLanguages;
      }
      
      // Cache the results
      this.cachedLanguages = result.rows;
      return result.rows;
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
      
      // First check if countries table exists
      const checkTableQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'geo' 
          AND table_name = 'countries'
        );
      `;
      
      const tableExists = await pool.query(checkTableQuery);
      if (!tableExists.rows[0].exists) {
        console.error("Table geo.countries does not exist");
        return 'en';
      }
      
      // Check if country_languages table exists
      const checkJoinTableQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'geo' 
          AND table_name = 'country_languages'
        );
      `;
      
      const joinTableExists = await pool.query(checkJoinTableQuery);
      
      if (joinTableExists.rows[0].exists) {
        try {
          const query = `
            SELECT 
              l.code_2 as code
            FROM 
              geo.country_languages cl
            JOIN
              geo.languages l ON cl.language_id = l.id
            WHERE 
              LOWER(cl.country_code) = $1
            ORDER BY
              cl.is_primary DESC,
              cl.population_percent DESC
            LIMIT 1
          `;
          
          const result = await pool.query(query, [validatedCountryCode]);
          
          if (result.rows.length > 0 && result.rows[0].code) {
            return result.rows[0].code;
          }
        } catch (error) {
          console.error('Error querying country_languages:', error);
          // Continue with fallback
        }
      }
      
      // Check if language_code column exists in countries table
      const checkColumnsQuery = `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'geo' 
        AND table_name = 'countries';
      `;
      
      const columnsResult = await pool.query(checkColumnsQuery);
      const columns = columnsResult.rows.map((row: ColumnRow) => row.column_name);
      
      // Try different possible column names
      const possibleColumns = ['language_code', 'lang', 'language', 'official_language'];
      let languageColumn = null;
      
      for (const col of possibleColumns) {
        if (columns.includes(col)) {
          languageColumn = col;
          break;
        }
      }
      
      if (!languageColumn) {
        console.error("No language column found in geo.countries");
        return 'en';
      }
      
      try {
        const query = `
          SELECT 
            ${languageColumn}
          FROM 
            geo.countries
          WHERE 
            LOWER(code_2) = $1
        `;
        
        const result = await pool.query(query, [validatedCountryCode]);
        
        if (result.rows.length > 0 && result.rows[0][languageColumn]) {
          return result.rows[0][languageColumn];
        }
      } catch (error) {
        console.error('Error querying countries table:', error);
      }
      
      // If country code is 'GB', return 'en'
      if (validatedCountryCode === 'gb') {
        return 'en';
      }
      
      // If country code is 'sk', return 'sk'
      if (validatedCountryCode === 'sk') {
        return 'sk';
      }
      
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