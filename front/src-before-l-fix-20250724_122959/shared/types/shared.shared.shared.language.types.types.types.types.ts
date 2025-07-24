// File: shared/types/shared.shared.shared.language.types.types.types.types.ts
// Last change: Updated Language interface and DEFAULT_LANGUAGES to match geo.languages table

export interface Language {
  id: number;               // Language ID from geo.languages
  cc: string;               // primary_country_code from geo.languages (uppercase, e.g., 'GB', 'SK')
  lc: string;               // code_2 from geo.languages (lowercase, e.g., 'en', 'sk')
  name_en: string;          // Name in English
  name_sk?: string;         // Name in Slovak (optional)
  native_name: string;      // Name in the language itself
  is_rtl: boolean;          // Right-to-left text direction
  primary_country_code?: string; // Optional, already covered by cc
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
  primaryLanguage: 'en',  // lc code
  secondaryLanguage: 'sk' // lc code
};

export const DEFAULT_LANGUAGES: Language[] = [
  { id: 1, cc: "GB", lc: "en", name_en: "English", native_name: "English", is_rtl: false },
  { id: 21, cc: "SK", lc: "sk", name_en: "Slovak", native_name: "Slovenčina", is_rtl: false },
  { id: 20, cc: "CZ", lc: "cs", name_en: "Czech", native_name: "Čeština", is_rtl: false },
  { id: 11, cc: "DE", lc: "de", name_en: "German", native_name: "Deutsch", is_rtl: false }
];