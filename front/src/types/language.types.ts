// File: ./front/src/types/language.types.ts
// Contains type definitions for language-related data structures

// Basic language data structure
export interface Language {
  code: string;             // ISO 639-1 code (e.g., 'en', 'sk')
  name_en: string;          // Name in English
  name_sk?: string;         // Name in Slovak (optional)
  native_name: string;      // Name in the language itself
  is_rtl: boolean;          // Right-to-left text direction
  flag_url?: string;        // URL to country flag image
  primary_country_code?: string; // Primary country for this language
  created_at?: Date;        // Creation timestamp
  updated_at?: Date;        // Last update timestamp
}

// Language with UI grouping information
export interface GroupedLanguage extends Language {
  group?: 'primary' | 'secondary' | 'recent' | 'other';
}

// User language preferences
export interface LanguagePreference {
  primaryLanguage: string;  // Primary display language
  secondaryLanguage: string; // Secondary/fallback language
}

// Language API response format
export interface LanguageApiResponse {
  results: Language[];
  total: number;
}

// Translation data map
export interface TranslationMap {
  [key: string]: string;
}

// Translation context
export interface TranslationContext {
  currentLanguage: string;
  secondaryLanguage: string;
  translations: TranslationMap;
  isLoading: boolean;
}

// Supported language directions
export enum TextDirection {
  LTR = 'ltr',
  RTL = 'rtl'
}

// Default language preferences
export const DEFAULT_LANGUAGE_PREFERENCES: LanguagePreference = {
  primaryLanguage: 'en',
  secondaryLanguage: 'sk'
};

// Default fallback languages if API fails
export const DEFAULT_LANGUAGES: Language[] = [
  { code: "en", name_en: "English", native_name: "English", is_rtl: false, flag_url: "/flags/4x3/optimized/gb.svg" },
  { code: "sk", name_en: "Slovak", native_name: "Slovenčina", is_rtl: false, flag_url: "/flags/4x3/optimized/sk.svg" },
  { code: "cs", name_en: "Czech", native_name: "Čeština", is_rtl: false, flag_url: "/flags/4x3/optimized/cz.svg" },
  { code: "de", name_en: "German", native_name: "Deutsch", is_rtl: false, flag_url: "/flags/4x3/optimized/de.svg" }
];