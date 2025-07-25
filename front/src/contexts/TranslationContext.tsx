// File: src/contexts/TranslationContext.tsx
// Last change: Integrated geolocation functionality using getCountryFromIP utility

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { getCountryFromIP } from '@/lib/utils/getCountryFromIP';

// Interface for language information
export interface LanguageInfo {
  lc: string;         // Language code (e.g., 'en', 'sk')
  cc: string;         // Country code (e.g., 'GB', 'SK')
  name_en: string;    // English name of the language
  native_name: string;// Native name of the language
  is_rtl: boolean;    // Right-to-left script flag
}

// Interface for the context value
interface TranslationContextType {
  t: (key: string) => string;           // Translation function, returns key if translation is missing
  currentLanguage: LanguageInfo;        // Current language object
  secondaryLanguage: string | null;     // Secondary language code, if set
  changeLanguage: (lang: LanguageInfo) => void; // Function to change language
  setSecondaryLanguage: (langCode: string | null) => void; // Function to set secondary language
  isLoading: boolean;                   // Loading state for translations
  error: string | null;                 // Error message, if any
  unsupportedLanguages: string[];       // List of unsupported languages
}

// Default context value with fallback to key
const TranslationContext = createContext<TranslationContextType>({
  t: (key) => key,
  currentLanguage: { lc: 'en', cc: 'GB', name_en: 'English', native_name: 'English', is_rtl: false },
  secondaryLanguage: null,
  changeLanguage: () => {},
  setSecondaryLanguage: () => {},
  isLoading: false,
  error: null,
  unsupportedLanguages: []
});

// Local storage keys for language preferences and cache
const LS_KEYS = {
  PRIMARY: 'preferred_language',
  SECONDARY: 'secondary_language',
  TRANSLATION_CACHE: 'translation-cache'
};

// Constants
const DEFAULT_LC = 'en';
const CACHE_VERSION = 1;
const SUPPORTED_LANGUAGES = ['en', 'sk', 'de']; // Zoznam podporovaných jazykov

// Type for translation data
type TranslationsData = Record<string, string>;

// Type for translation cache
interface TranslationCache {
  [lc: string]: TranslationsData;
}

// Example language mapping (used as fallback or initial data)
const LANGUAGE_INFO: Record<string, Omit<LanguageInfo, 'lc'>> = {
  'en': { cc: 'GB', name_en: 'English', native_name: 'English', is_rtl: false },
  'sk': { cc: 'SK', name_en: 'Slovak', native_name: 'Slovenčina', is_rtl: false },
  'de': { cc: 'DE', name_en: 'German', native_name: 'Deutsch', is_rtl: false }
};

// Translation provider component
export const TranslationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State to track if initialization is complete
  const [isInitialized, setIsInitialized] = useState(false);

  // Local storage for primary and secondary languages
  const [primaryLanguage, setPrimaryLanguage] = useLocalStorage<string>(
    LS_KEYS.PRIMARY,
    localStorage.getItem(LS_KEYS.PRIMARY) || DEFAULT_LC
  );
  const [secondaryLanguage, setSecondaryLanguage] = useLocalStorage<string | null>(
    LS_KEYS.SECONDARY,
    null
  );
  
  // Nepoužívame vlastné geo cache, o to sa stará utilita getCountryFromIP

  // Current language state
  const [currentLanguage, setCurrentLanguage] = useState<LanguageInfo>(() => {
    const lc = primaryLanguage || DEFAULT_LC;
    const info = LANGUAGE_INFO[lc] || LANGUAGE_INFO[DEFAULT_LC];
    return { lc, ...info };
  });

  // Translation cache in localStorage and memory
  const [storageCache, setStorageCache] = useLocalStorage<{
    version: number;
    translations: TranslationCache;
  }>(LS_KEYS.TRANSLATION_CACHE, {
    version: CACHE_VERSION,
    translations: {}
  });

  const [memoryCache, setMemoryCache] = useState<TranslationCache>(
    storageCache.version === CACHE_VERSION ? storageCache.translations : {}
  );

  // State for loading, errors, and unsupported languages
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unsupportedLanguages, setUnsupportedLanguages] = useState<string[]>([]);

  // Validate language code
  const validateLanguage = (lc: string): string => {
    return SUPPORTED_LANGUAGES.includes(lc) ? lc : DEFAULT_LC;
  };

  // Fetch secondary language from geolocation
  const fetchSecondaryFromGeo = useCallback(async () => {
    try {
      // Get country code from IP - utilita sa stará o vlastnú logiku cacheovania a zlyhaní
      const countryCode = await getCountryFromIP();
      // Validácia jazykového kódu
      const validated = validateLanguage(countryCode);

      console.log('[TranslationContext] 🌍 Detected country from IP:', validated);

      // Return as secondary only if different from primary
      return validated !== primaryLanguage ? validated : null;
    } catch (err) {
      console.warn('[TranslationContext] ❌ Geo fetch failed:', err);
      return null;
    }
  }, [primaryLanguage]);

  // Fetch translations from API
  const fetchTranslations = useCallback(async (lc: string): Promise<TranslationsData> => {
    try {
      console.log(`[TranslationContext] Fetching translations for ${lc} from API`);
      const response = await fetch(`/api/geo/translations?lc=${lc}`);
      if (!response.ok) {
        throw new Error(`Failed to load translations for ${lc}: ${response.status}`);
      }
      const data = await response.json();
      console.log(`[TranslationContext] Received ${Object.keys(data).length} translations for ${lc}`);
      if (!data || typeof data !== 'object') {
        throw new Error(`Invalid translation data for ${lc}`);
      }
      return data;
    } catch (err) {
      console.error(`[TranslationContext] Error fetching translations for ${lc}:`, err);
      return {};
    }
  }, []);

  // Load translations, using cache or fetching from API
  const loadTranslations = useCallback(async (lc: string) => {
    if (!lc || memoryCache[lc]?.[Object.keys(memoryCache[lc])[0]]) return;

    if (storageCache.version === CACHE_VERSION && storageCache.translations[lc]) {
      console.log(`[TranslationContext] Using cached translations for ${lc}`);
      setMemoryCache(prev => ({ ...prev, [lc]: storageCache.translations[lc] }));
      setUnsupportedLanguages(prev => prev.filter(lang => lang !== lc));
      return;
    }

    setIsLoading(true);
    const translations = await fetchTranslations(lc);
    setIsLoading(false);

    if (Object.keys(translations).length > 0) {
      setMemoryCache(prev => ({ ...prev, [lc]: translations }));
      setStorageCache(prev => ({
        version: CACHE_VERSION,
        translations: { ...prev.translations, [lc]: translations }
      }));
      setUnsupportedLanguages(prev => prev.filter(lang => lang !== lc));
    } else {
      setUnsupportedLanguages(prev => prev.includes(lc) ? prev : [...prev, lc]);
    }
  }, [memoryCache, storageCache, fetchTranslations, setStorageCache]);

  // Translation function with fallback to key
  const t = useCallback((key: string): string => {
    if (!key) return '';
    const translation = memoryCache[currentLanguage.lc]?.[key];
    return translation || key; // Return key if no translation
  }, [memoryCache, currentLanguage.lc]);

  // Change language handler
  const changeLanguage = useCallback((lang: LanguageInfo) => {
    console.log(`[TranslationContext] Changing to: ${lang.lc}`);
    setPrimaryLanguage(lang.lc);
    setCurrentLanguage(lang);
    document.documentElement.lang = lang.lc;
    if (navigator.cookieEnabled) {
      document.cookie = `sendeliver_lang=${lang.lc}; path=/; max-age=31536000`;
    }
    loadTranslations(lang.lc); // Load translations for new language
  }, [setPrimaryLanguage, loadTranslations]);

  // Initial setup and language loading
  useEffect(() => {
    if (isInitialized) return;

    const init = async () => {
      // Set document language
      document.documentElement.lang = currentLanguage.lc;
      
      // Set language cookie
      if (navigator.cookieEnabled) {
        document.cookie = `sendeliver_lang=${currentLanguage.lc}; path=/; max-age=31536000`;
      }
      
      // Load translations for current language
      loadTranslations(currentLanguage.lc);
      
      // Try to determine secondary language based on location
      if (!secondaryLanguage) {
        try {
          const geoLanguage = await fetchSecondaryFromGeo();
          if (geoLanguage && geoLanguage !== currentLanguage.lc) {
            console.log(`[TranslationContext] Setting secondary language from geo: ${geoLanguage}`);
            setSecondaryLanguage(geoLanguage);
            loadTranslations(geoLanguage);
          }
        } catch (err) {
          console.error('[TranslationContext] Error setting secondary language:', err);
        }
      } else {
        // Load translations for existing secondary language
        loadTranslations(secondaryLanguage);
      }
      
      setIsInitialized(true);
    };

    init();
  }, [currentLanguage.lc, secondaryLanguage, isInitialized, loadTranslations, fetchSecondaryFromGeo, setSecondaryLanguage]);

  // Debug logging
  useEffect(() => {
    console.log(`[TranslationContext] Current: ${currentLanguage.lc}, Secondary: ${secondaryLanguage || 'none'}, Unsupported: ${unsupportedLanguages.join(',') || 'none'}`);
  }, [currentLanguage.lc, secondaryLanguage, unsupportedLanguages]);

  return (
    <TranslationContext.Provider
      value={{
        t,
        currentLanguage,
        secondaryLanguage,
        changeLanguage,
        setSecondaryLanguage,
        isLoading,
        error,
        unsupportedLanguages
      }}
    >
      {children}
    </TranslationContext.Provider>
  );
};

// Hook to access translation context
export const useTranslationContext = () => useContext(TranslationContext);

export default TranslationContext;