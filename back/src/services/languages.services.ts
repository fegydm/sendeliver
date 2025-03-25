// File: ./back/src/services/languages.services.ts
// Last change: Changed mapping from code_2 to lc (was cc)

import { pool } from '../configs/db.js';
import { GET_LANGUAGES_QUERY, GET_COUNTRY_LANGUAGE_QUERY } from "../queries/languages.queries.js";

interface Language {
  lc: string;  // Changed from cc to lc
  name_en: string;
  native_name: string;
  is_rtl: boolean;
}

const fallbackLanguages: Language[] = [
  { lc: "en", name_en: "English", native_name: "English", is_rtl: false },
  { lc: "sk", name_en: "Slovak", native_name: "Slovenčina", is_rtl: false },
  { lc: "cs", name_en: "Czech", native_name: "Čeština", is_rtl: false },
  { lc: "de", name_en: "German", native_name: "Deutsch", is_rtl: false }
];

class LanguagesService {
  private cachedLanguages: Language[] | null = null;

  async getAllLanguages(): Promise<Language[]> {
    if (this.cachedLanguages && this.cachedLanguages.length > 0) {
      return this.cachedLanguages;
    }
    
    try {
      const result = await pool.query(GET_LANGUAGES_QUERY);
      const validatedData = result.rows.map((row: any) => ({
        lc: row.code_2 || '',  // Changed from cc to lc
        name_en: row.name_en || row.code_2 || 'Unknown',
        native_name: row.native_name || row.name_en || row.code_2 || 'Unknown',
        is_rtl: !!row.is_rtl
      }));
      
      if (validatedData.length === 0) return fallbackLanguages;
      
      this.cachedLanguages = validatedData;
      return validatedData;
    } catch (error) {
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
      
      const hardcodedMappings: Record<string, string> = {
        'gb': 'en', 'us': 'en', 'sk': 'sk', 'cz': 'cs', 'de': 'de',
        'fr': 'fr', 'es': 'es', 'it': 'it', 'ru': 'ru', 'cn': 'zh', 'jp': 'ja'
      };
      return hardcodedMappings[validatedCountryCode] || 'en';
    } catch (error) {
      return 'en';
    }
  }

  async getLanguageDetails(languageCode: string): Promise<Language> {
    try {
      const allLanguages = await this.getAllLanguages();
      const languageDetails = allLanguages.find(lang => 
        lang.lc.toLowerCase() === languageCode.toLowerCase()  // Changed from cc to lc
      );
      
      if (languageDetails) return languageDetails;
      
      const englishLanguage = allLanguages.find(lang => lang.lc === 'en');  // Changed from cc to lc
      if (englishLanguage) return englishLanguage;
      
      return fallbackLanguages[0];
    } catch (error) {
      return fallbackLanguages[0];
    }
  }
}

export default new LanguagesService();