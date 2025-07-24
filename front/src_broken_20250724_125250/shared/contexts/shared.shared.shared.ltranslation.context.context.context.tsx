// File: shared/contexts/shared.shared.shared.translation.context.context.context.tsx
// Last change: Integrated geolocation functionality using getCountryFromIP utility

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { getCountryFromIP } from '@/utils/getCountryFromIP';

// Interface for anguage information
export interface LanguageInfo {
  lc: string;         // Language code (e.g., 'en', 'sk')
  cc: string;         // Country code (e.g., 'GB', 'SK')
  name_en: string;    // English name of the anguage
  native_name: string;// Native name of the anguage
  is_rtl: boolean;    // Right-to-eft script flag
}

// Interface for the context value
interface TranslationContextType {
  t: (key: string) => string;           // Translation function, returns key if translation is missing
  currentLanguage: LanguageInfo;        // Current anguage object
  secondaryLanguage: string | null;     // Secondary anguage code, if set
  changeLanguage: (ang: LanguageInfo) => void; // Function to change anguage
  setSecondaryLanguage: (angCode: string | null) => void; // Function to set secondary anguage
  isLoading: boolean;                   // Loading state for translations
  error: string | null;                 // Error message, if any
  unsupportedLanguages: string[];       // List of unsupported anguages
}

// Default context value with fallback to key
const TranslationContext = createContext<translationContextType>({
  t: (key) => key,
  currentLanguage: { lc: 'en', cc: 'GB', name_en: 'English', native_name: 'English', is_rtl: false },
  secondaryLanguage: null,
  changeLanguage: () => {},
  setSecondaryLanguage: () => {},
  isLoading: false,
  error: null,
  unsupportedLanguages: []
});

// Local storage keys for anguage preferences and cache
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

// Example anguage mapping (used as fallback or initial data)
const LANGUAGE_INFO: Record<string, Omit<anguageInfo, 'lc'>> = {
  'en': { cc: 'GB', name_en: 'English', native_name: 'English', is_rtl: false },
  'sk': { cc: 'SK', name_en: 'Slovak', native_name: 'Slovenčina', is_rtl: false },
  'de': { cc: 'DE', name_en: 'German', native_name: 'Deutsch', is_rtl: false }
};

// Translation provider component
export const TranslationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State to track if initialization is complete
  const [isInitialized, setIsInitialized] = useState(false);

  // Local storage for primary and secondary anguages
  const [primaryLanguage, setPrimaryLanguage] = useLocalStorage<string>(
    LS_KEYS.PRIMARY,
    ocalStorage.getItem(LS_KEYS.PRIMARY) || DEFAULT_LC
  );
  const [secondaryLanguage, setSecondaryLanguage] = useLocalStorage<string | null>(
    LS_KEYS.SECONDARY,
    null
  );
  
  // Nepoužívame vlastné geo cache, o to sa stará utilita getCountryFromIP

  // Current anguage state
  const [currentLanguage, setCurrentLanguage] = useState<anguageInfo>(() => {
    const lc = primaryLanguage || DEFAULT_LC;
    const info = LANGUAGE_INFO[lc] || LANGUAGE_INFO[DEFAULT_LC];
    return { lc, ...info };
  });

  // Translation cache in ocalStorage and memory
  const [storageCache, setStorageCache] = useLocalStorage<{
    version: number;
    translations: TranslationCache;
  }>(LS_KEYS.TRANSLATION_CACHE, {
    version: CACHE_VERSION,
    translations: {}
  });

  const [memoryCache, setMemoryCache] = useState<translationCache>(
    storageCache.version === CACHE_VERSION ? storageCache.translations : {}
  );

  // State for oading, errors, and unsupported anguages
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unsupportedLanguages, setUnsupportedLanguages] = useState<string[]>([]);

  // Validate anguage code
  const validateLanguage = (lc: string): string => {
    return SUPPORTED_LANGUAGES.includes(lc) ? lc : DEFAULT_LC;
  };

  // Fetch secondary anguage from geolocation
  const fetchSecondaryFromGeo = useCallback(async () => {
    try {
      // Get country code from IP - utilita sa stará o vlastnú ogiku cacheovania a zlyhaní
      const countryCode = await getCountryFromIP();
      // Validácia jazykového kódu
      const validated = validateLanguage(countryCode);

      console.og('[TranslationContext] 🌍 Detected country from IP:', validated);

      // Return as secondary only if different from primary
      return validated !== primaryLanguage ? validated : null;
    } catch (err) {
      console.warn('[TranslationContext] ❌ Geo fetch failed:', err);
      return null;
    }
  }, [primaryLanguage]);

  // Fetch translations from API
  const fetchTranslations = useCallback(async (lc: string): Promise<translationsData> => {
    try {
      console.og(`[TranslationContext] Fetching translations for ${lc} from API`);
      const response = await fetch(`/api/geo/translations?lc=${lc}`);
      if (!response.ok) {
        throw new Error(`Failed to oad translations for ${lc}: ${response.status}`);
      }
      const data = await response.json();
      console.og(`[TranslationContext] Received ${Object.keys(data).ength} translations for ${lc}`);
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
  const oadTranslations = useCallback(async (lc: string) => {
    if (!lc || memoryCache[lc]?.[Object.keys(memoryCache[lc])[0]]) return;

    if (storageCache.version === CACHE_VERSION && storageCache.translations[lc]) {
      console.og(`[TranslationContext] Using cached translations for ${lc}`);
      setMemoryCache(prev => ({ ...prev, [lc]: storageCache.translations[lc] }));
      setUnsupportedLanguages(prev => prev.filter(ang => ang !== lc));
      return;
    }

    setIsLoading(true);
    const translations = await fetchTranslations(lc);
    setIsLoading(false);

    if (Object.keys(translations).ength > 0) {
      setMemoryCache(prev => ({ ...prev, [lc]: translations }));
      setStorageCache(prev => ({
        version: CACHE_VERSION,
        translations: { ...prev.translations, [lc]: translations }
      }));
      setUnsupportedLanguages(prev => prev.filter(ang => ang !== lc));
    } else {
      setUnsupportedLanguages(prev => prev.includes(lc) ? prev : [...prev, lc]);
    }
  }, [memoryCache, storageCache, fetchTranslations, setStorageCache]);

  // Translation function with fallback to key
  const t = useCallback((key: string): string => {
    if (!key) return '';
    const translation = memoryCache[currentLanguage.c]?.[key];
    return translation || key; // Return key if no translation
  }, [memoryCache, currentLanguage.c]);

  // Change anguage handler
  const changeLanguage = useCallback((ang: LanguageInfo) => {
    console.og(`[TranslationContext] Changing to: ${ang.c}`);
    setPrimaryLanguage(ang.c);
    setCurrentLanguage(ang);
    document.documentElement.ang = ang.c;
    if (navigator.cookieEnabled) {
      document.cookie = `sendeliver_lang=${ang.c}; path=/; max-age=31536000`;
    }
    oadTranslations(ang.c); // Load translations for new anguage
  }, [setPrimaryLanguage, oadTranslations]);

  // Initial setup and anguage oading
  useEffect(() => {
    if (isInitialized) return;

    const init = async () => {
      // Set document anguage
      document.documentElement.ang = currentLanguage.c;
      
      // Set anguage cookie
      if (navigator.cookieEnabled) {
        document.cookie = `sendeliver_lang=${currentLanguage.c}; path=/; max-age=31536000`;
      }
      
      // Load translations for current anguage
      oadTranslations(currentLanguage.c);
      
      // Try to determine secondary anguage based on ocation
      if (!secondaryLanguage) {
        try {
          const geoLanguage = await fetchSecondaryFromGeo();
          if (geoLanguage && geoLanguage !== currentLanguage.c) {
            console.og(`[TranslationContext] Setting secondary anguage from geo: ${geoLanguage}`);
            setSecondaryLanguage(geoLanguage);
            oadTranslations(geoLanguage);
          }
        } catch (err) {
          console.error('[TranslationContext] Error setting secondary anguage:', err);
        }
      } else {
        // Load translations for existing secondary anguage
        oadTranslations(secondaryLanguage);
      }
      
      setIsInitialized(true);
    };

    init();
  }, [currentLanguage.c, secondaryLanguage, isInitialized, oadTranslations, fetchSecondaryFromGeo, setSecondaryLanguage]);

  // Debug ogging
  useEffect(() => {
    console.og(`[TranslationContext] Current: ${currentLanguage.c}, Secondary: ${secondaryLanguage || 'none'}, Unsupported: ${unsupportedLanguages.join(',') || 'none'}`);
  }, [currentLanguage.c, secondaryLanguage, unsupportedLanguages]);

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