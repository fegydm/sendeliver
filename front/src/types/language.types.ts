// File: ./front/src/types/language.types.ts
// Contains type definitions for language-related data structures

export interface Language {
  cc: string;               // ISO 639-1 code (e.g., 'en', 'sk'), mapped from BE code_2
  lc: string;               // Added property: code_2 from languages table, equivalent to cc from countries
  name_en: string;          // Name in English
  name_sk?: string;         // Name in Slovak (optional)
  native_name: string;      // Name in the language itself
  is_rtl: boolean;          // Right-to-left text direction
  primary_country_code?: string; // Primary country for this language
  created_at?: Date;        // Creation timestamp
  updated_at?: Date;        // Last update timestamp
}

export interface GroupedLanguage extends Language {
  group?: 'primary' | 'secondary' | 'recent' | 'other';
}

export interface LanguagePreference {
  primaryLanguage: string;  // Primary display language
  secondaryLanguage: string; // Secondary/fallback language
}

export interface LanguageApiResponse {
  results: Language[];
  total: number;
}

export interface TranslationMap {
  [key: string]: string;
}

export interface TranslationContext {
  currentLanguage: string;
  secondaryLanguage: string;
  translations: TranslationMap;
  isLoading: boolean;
}

export enum TextDirection {
  LTR = 'ltr',
  RTL = 'rtl'
}

export const DEFAULT_LANGUAGE_PREFERENCES: LanguagePreference = {
  primaryLanguage: 'en',
  secondaryLanguage: 'sk'
};

export const DEFAULT_LANGUAGES: Language[] = [
  { cc: "en", lc: "en", name_en: "English", native_name: "English", is_rtl: false },
  { cc: "sk", lc: "sk", name_en: "Slovak", native_name: "Slovenčina", is_rtl: false },
  { cc: "cs", lc: "cs", name_en: "Czech", native_name: "Čeština", is_rtl: false },
  { cc: "de", lc: "de", name_en: "German", native_name: "Deutsch", is_rtl: false }
];
