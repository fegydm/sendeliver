// File: src/hooks/useTranslationsPreload.ts
// Last change: Completely simplified version without useEffect to avoid infinite loops

import { useMemo, useCallback } from 'react';

interface TranslationsPreloadOptions {
  primaryLc: string;
  secondaryLc: string | null;
  enabled: boolean;
}

// Type for translations
type TranslationsData = Record<string, string>;

const DEFAULT_LC = 'en';

// Hardcoded basic English translations for immediate availability
const ESSENTIAL_TRANSLATIONS: TranslationsData = {
  'common.loading': 'Loading...',
  'common.error': 'Error',
  'common.success': 'Success',
  'common.cancel': 'Cancel',
  'common.save': 'Save',
  'lang.en': 'English'
};

export const useTranslationsPreload = ({ primaryLc }: TranslationsPreloadOptions) => {
  // Pre-defined translations that are always available
  const translations = useMemo(() => {
    return {
      [DEFAULT_LC]: ESSENTIAL_TRANSLATIONS
    };
  }, []);

  /**
   * Simplified translation function
   * Just uses essential English translations
   */
  const t = useCallback(
    (key: string, defaultValue?: string): string => {
      // Check if we have a translation in English
      if (ESSENTIAL_TRANSLATIONS[key]) {
        return ESSENTIAL_TRANSLATIONS[key];
      }
      
      // If not, return default value or key itself
      return defaultValue || key;
    },
    []
  );

  return { 
    t,
    isLoading: false,
    hasError: false,
    availableLanguages: [DEFAULT_LC]
  };
};

export default useTranslationsPreload;