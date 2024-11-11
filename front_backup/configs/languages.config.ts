export type LanguageCode = 'en' | 'sk' | 'af' | 'ar' | 'bn' | string;

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
  countryCode: string;
  priority?: number;
  isRTL?: boolean;
}

export type LanguageMap = {
  [key in LanguageCode]: Language;
};

export const DEFAULT_LANGUAGE: LanguageCode = 'en';

export const BASE_LANGUAGES: LanguageMap = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    countryCode: 'GB',
    priority: 1,
  },
};

export const SUPPORTED_LANGUAGES: LanguageMap = {
  af: { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', countryCode: 'ZA' },
  ar: { code: 'ar', name: 'Arabic', nativeName: 'العربية', countryCode: 'SA', isRTL: true },
  bn: { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', countryCode: 'BD' },
  bg: { code: 'bg', name: 'Bulgarian', nativeName: 'Български', countryCode: 'BG' },
  ca: { code: 'ca', name: 'Catalan', nativeName: 'Català', countryCode: 'ES' },
  zh: { code: 'zh', name: 'Chinese', nativeName: '中文', countryCode: 'CN' },
  hr: { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski', countryCode: 'HR' },
  cs: { code: 'cs', name: 'Czech', nativeName: 'Čeština', countryCode: 'CZ' },
  da: { code: 'da', name: 'Danish', nativeName: 'Dansk', countryCode: 'DK' },
  nl: { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', countryCode: 'NL' },
  et: { code: 'et', name: 'Estonian', nativeName: 'Eesti', countryCode: 'EE' },
  fi: { code: 'fi', name: 'Finnish', nativeName: 'Suomi', countryCode: 'FI' },
  fr: { code: 'fr', name: 'French', nativeName: 'Français', countryCode: 'FR' },
  de: { code: 'de', name: 'German', nativeName: 'Deutsch', countryCode: 'DE' },
  el: { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', countryCode: 'GR' },
  hi: { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', countryCode: 'IN' },
  hu: { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', countryCode: 'HU' },
  id: { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', countryCode: 'ID' },
  it: { code: 'it', name: 'Italian', nativeName: 'Italiano', countryCode: 'IT' },
  ja: { code: 'ja', name: 'Japanese', nativeName: '日本語', countryCode: 'JP' },
  ko: { code: 'ko', name: 'Korean', nativeName: '한국어', countryCode: 'KR' },
  lv: { code: 'lv', name: 'Latvian', nativeName: 'Latviešu', countryCode: 'LV' },
  lt: { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių', countryCode: 'LT' },
  no: { code: 'no', name: 'Norwegian', nativeName: 'Norsk', countryCode: 'NO' },
  pl: { code: 'pl', name: 'Polish', nativeName: 'Polski', countryCode: 'PL' },
  pt: { code: 'pt', name: 'Portuguese', nativeName: 'Português', countryCode: 'PT' },
  ro: { code: 'ro', name: 'Romanian', nativeName: 'Română', countryCode: 'RO' },
  ru: { code: 'ru', name: 'Russian', nativeName: 'Русский', countryCode: 'RU' },
  sk: { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina', countryCode: 'SK' },
  sl: { code: 'sl', name: 'Slovenian', nativeName: 'Slovenščina', countryCode: 'SI' },
  es: { code: 'es', name: 'Spanish', nativeName: 'Español', countryCode: 'ES' },
  sv: { code: 'sv', name: 'Swedish', nativeName: 'Svenska', countryCode: 'SE' },
  th: { code: 'th', name: 'Thai', nativeName: 'ไทย', countryCode: 'TH' },
  tr: { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', countryCode: 'TR' },
  uk: { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', countryCode: 'UA' },
  vi: { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', countryCode: 'VN' }
};

// Helper functions
export const getLanguagePath = (code: LanguageCode): string => 
  `/images/flags/${code.toLowerCase()}.svg`;

export const getCountryFlag = (countryCode: string): string => 
  `/images/flags/${countryCode.toLowerCase()}.svg`;

export const isRTL = (code: LanguageCode): boolean => 
  SUPPORTED_LANGUAGES[code]?.isRTL || false;

// Type guard
export const isValidLanguageCode = (code: string): code is LanguageCode =>
  code in SUPPORTED_LANGUAGES || code in BASE_LANGUAGES;

// Sorting utilities
export const sortLanguages = (languages: LanguageMap): LanguageMap => {
  return Object.entries(languages)
    .sort(([, a], [, b]) => (a.priority || 0) - (b.priority || 0))
    .reduce((acc, [code, lang]) => ({...acc, [code]: lang}), {} as LanguageMap);
};

export const excludeLanguages = (
  languages: LanguageMap,
  excludeCodes: LanguageCode[]
): LanguageMap => {
  return Object.entries(languages)
    .filter(([code]) => !excludeCodes.includes(code as LanguageCode))
    .reduce((acc, [code, lang]) => ({...acc, [code]: lang}), {} as LanguageMap);
};