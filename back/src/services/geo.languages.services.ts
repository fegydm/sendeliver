// File: ./back/src/services/geo.languages.services.ts
import { pool } from '../configs/db.js';
import { GET_LANGUAGES_QUERY, GET_COUNTRY_LANGUAGE_QUERY } from "../queries/geo.languages.queries.js";

interface Language {
  lc: string;         // Language code (always lowercase)
  cc: string;         // Country code for flags (always uppercase)
  name_en: string;
  native_name: string;
  is_rtl: boolean;
}

const fallbackLanguages: Language[] = [
  { lc: "en", cc: "GB", name_en: "English", native_name: "English", is_rtl: false },
  { lc: "sk", cc: "SK", name_en: "Slovak", native_name: "Slovenčina", is_rtl: false },
  { lc: "cs", cc: "CZ", name_en: "Czech", native_name: "Čeština", is_rtl: false },
  { lc: "de", cc: "DE", name_en: "German", native_name: "Deutsch", is_rtl: false }
];

class LanguagesService {
  async getAllLanguages(): Promise<Language[]> {
    try {
      const result = await pool.query(GET_LANGUAGES_QUERY);
      
      const validatedData = result.rows.map((row: any) => {
        // Get language code from code_2 and convert to lowercase
        const lc = row.code_2?.toLowerCase() || '';
        
        // Use primary_country_code if available; otherwise, use code_2 or fallback to "GB"
        let cc = '';
        if (row.primary_country_code && row.primary_country_code.trim() !== '') {
          cc = row.primary_country_code.toUpperCase();
        } else {
          cc = (row.code_2?.toUpperCase() || 'GB');
        }
        
        return {
          lc,  // Language code - always lowercase
          cc,  // Country code - always uppercase
          name_en: row.name_en || row.code_2 || 'Unknown',
          native_name: row.native_name || row.name_en || row.code_2 || 'Unknown',
          is_rtl: !!row.is_rtl
        };
      });
      
      if (validatedData.length === 0) return fallbackLanguages;
      
      return validatedData;
    } catch (error) {
      console.error('Error fetching languages:', error);
      return fallbackLanguages;
    }
  }

  async getCountryLanguage(countryCode: string): Promise<string> {
    try {
      if (!countryCode || typeof countryCode !== 'string' || countryCode.length > 2) {
        return 'en';
      }
      
      const validatedCountryCode = countryCode.trim().toLowerCase();
      const result = await pool.query(GET_COUNTRY_LANGUAGE_QUERY, [validatedCountryCode]);
      
      if (result.rows.length > 0 && result.rows[0].code_2) {
        return result.rows[0].code_2;
      }
      
      // Only mapping for GB → en
      const hardcodedMappings: Record<string, string> = {
        'gb': 'en'
      };
      return hardcodedMappings[validatedCountryCode] || 'en';
    } catch (error) {
      console.error('Error getting country language:', error);
      return 'en';
    }
  }

  async getLanguageDetails(languageCode: string): Promise<Language> {
    try {
      const allLanguages = await this.getAllLanguages();
      const languageDetails = allLanguages.find(lang => 
        lang.lc.toLowerCase() === languageCode.toLowerCase()
      );
      
      if (languageDetails) return languageDetails;
      
      const englishLanguage = allLanguages.find(lang => lang.lc === 'en');
      if (englishLanguage) return englishLanguage;
      
      return fallbackLanguages[0];
    } catch (error) {
      console.error('Error getting language details:', error);
      return fallbackLanguages[0];
    }
  }
}

export default new LanguagesService();
