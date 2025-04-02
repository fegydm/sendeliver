// File: ./front/src/contexts/LanguageContext.tsx
// Last change: Fixed infinite render loop by removing translations from dependencies

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getIPLocation } from '@/utils/geo';

interface LanguageTranslation {
  [key: string]: string;
}

type TranslationsCache = {
  current: LanguageTranslation;
  secondary: LanguageTranslation;
  english: LanguageTranslation;
};

interface LanguageContextType {
  t: (key: string) => string;
  currentLanguageCode: string;
  secondaryLanguageCode: string | null;
  changeLanguage: (langCode: string) => void;
  setSecondaryLanguage: (langCode: string | null) => void;
  isLoading: boolean;
  error: string | null;
}

// Create context with default values
const LanguageContext = createContext<LanguageContextType>({
  t: (key) => key,
  currentLanguageCode: 'en',
  secondaryLanguageCode: null,
  changeLanguage: () => {},
  setSecondaryLanguage: () => {},
  isLoading: false,
  error: null
});

// Constants for cache storage
const CACHE_KEYS = {
  PRIMARY_LANG: 'sendeliver_preferred_language',
  SECONDARY_LANG: 'sendeliver_secondary_language',
  TRANSLATIONS: 'sendeliver_translations_cache',
  TIMESTAMP: 'sendeliver_translations_timestamp'
};

// Cache expiration time (1 day in milliseconds)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

// Global shared translation cache to avoid duplicate fetches
const globalTranslationsCache: Record<string, LanguageTranslation> = {};

// Pending promises for translation fetches
const pendingFetches: Record<string, Promise<LanguageTranslation>> = {};

// Flag to track if initial translation load has started
let initialLoadStarted = false;
// Debugging variable to track render count
let renderCount = 0;
// Cache for memoizing the provider to prevent unnecessary re-renders
let memoizedProvider: React.FC<{children: ReactNode}> | null = null;

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Only increment render count on first render or if provider hasn't been memoized yet
  if (!memoizedProvider) {
    renderCount++;
  }
  console.log(`[LANGUAGE_CONTEXT] Provider initializing #${renderCount} - timestamp:`, new Date().toISOString());

  // Load initial languages from localStorage synchronously
  const [currentLanguageCode, setCurrentLanguageCode] = useState<string>(() => {
    const storedLang = localStorage.getItem(CACHE_KEYS.PRIMARY_LANG) || 'en';
    return storedLang;
  });

  const [secondaryLanguageCode, setSecondaryLanguageCode] = useState<string | null>(() => {
    return localStorage.getItem(CACHE_KEYS.SECONDARY_LANG) || null;
  });

  // Initial translations from cache if available - using useMemo for better performance
  const initialTranslations = React.useMemo(() => {
    console.log('[LANGUAGE_CONTEXT] Reading cache - timestamp:', new Date().toISOString());
    try {
      const cachedData = localStorage.getItem(CACHE_KEYS.TRANSLATIONS);
      const timestamp = localStorage.getItem(CACHE_KEYS.TIMESTAMP);
      
      if (cachedData && timestamp) {
        const cacheTime = parseInt(timestamp, 10);
        // Only use cache if it's not expired
        if (Date.now() - cacheTime < CACHE_EXPIRATION) {
          const parsedCache = JSON.parse(cachedData);
          console.log('[LANGUAGE_CONTEXT] Cache loaded - timestamp:', new Date().toISOString());
          
          // Initialize global cache with stored values
          Object.entries(parsedCache).forEach(([lang, trans]) => {
            if (lang !== 'current' && lang !== 'secondary' && lang !== 'english') {
              globalTranslationsCache[lang] = trans as LanguageTranslation;
            }
          });
          
          return parsedCache as TranslationsCache;
        } else {
          console.log('[LANGUAGE_CONTEXT] Cache expired, last updated:', new Date(parseInt(timestamp, 10)).toISOString());
        }
      }
    } catch (error) {
      console.error('[LANGUAGE_CONTEXT] Failed to load cache from localStorage:', error);
    }
    
    return {
      current: {},
      secondary: {},
      english: {}
    };
  }, []);
  
  const [translations, setTranslations] = useState<TranslationsCache>(initialTranslations);

  const [isLoading, setIsLoading] = useState(
    // Only set loading state to true if we don't have cached translations
    Object.keys(translations.current).length === 0
  );
  const [error, setError] = useState<string | null>(null);
  
  // Helper for fetching translations
  const fetchTranslations = useCallback(async (langCode: string): Promise<LanguageTranslation> => {
    // Use global cache if available
    if (globalTranslationsCache[langCode]) {
      return globalTranslationsCache[langCode];
    }
    
    // Check if a request is already in progress
    if (langCode in pendingFetches) {
      return pendingFetches[langCode];
    }
    
    console.log(`[LANGUAGE_CONTEXT] Starting fetch for ${langCode} - timestamp:`, new Date().toISOString());
    
    // Create new fetch promise
    pendingFetches[langCode] = (async () => {
      try {
        // Fixed API endpoint URL to use query parameter
        const response = await fetch(`/api/geo/translations?lc=${langCode}`);
        console.log(`[LANGUAGE_CONTEXT] Fetch response for ${langCode} - timestamp:`, new Date().toISOString());
        
        if (!response.ok) throw new Error(`Failed to fetch translations for language ${langCode}`);
        
        const data = await response.json();
        console.log(`[LANGUAGE_CONTEXT] Translation data parsed for ${langCode} - timestamp:`, new Date().toISOString());
        
        // Log a sample of translations to verify they're loaded correctly
        if (Object.keys(data).length > 0) {
          const sampleKeys = [
            'ai_form_title_sender', 
            'ai_form_title_hauler', 
            'ai_button_ask_sender'
          ];
          
          const samples: Record<string, string> = {};
          sampleKeys.forEach(key => {
            samples[key] = data[key] || '(missing)';
          });
          
          console.log(`[LANGUAGE_CONTEXT] Sample translations for ${langCode}:`, samples);
        } else {
          console.warn(`[LANGUAGE_CONTEXT] No translations found for ${langCode}`);
        }
        
        // Cache the result in global memory
        globalTranslationsCache[langCode] = data;
        
        return data;
      } catch (error) {
        console.error(`[LANGUAGE_CONTEXT] Error fetching translations for ${langCode}:`, error);
        return {};
      } finally {
        // Clear the pending promise
        delete pendingFetches[langCode];
      }
    })();
    
    return pendingFetches[langCode];
  }, []);
  
  // Load translations once on component mount
  useEffect(() => {
    // Prevent multiple initializations across module reloads
    if (initialLoadStarted) {
      console.log('[LANGUAGE_CONTEXT] Skipping translation load (already started) - timestamp:', new Date().toISOString());
      return;
    }
    
    console.log('[LANGUAGE_CONTEXT] Translation loading effect triggered - timestamp:', new Date().toISOString());
    
    initialLoadStarted = true;
    
    const loadTranslations = async () => {
      // Skip loading if we already have translations for this language
      if (
        globalTranslationsCache[currentLanguageCode] && 
        (secondaryLanguageCode === null || globalTranslationsCache[secondaryLanguageCode]) &&
        (currentLanguageCode === 'en' || globalTranslationsCache['en'])
      ) {
        // Just update translations from memory
        setTranslations({
          current: globalTranslationsCache[currentLanguageCode] || {},
          secondary: secondaryLanguageCode ? globalTranslationsCache[secondaryLanguageCode] || {} : {},
          english: globalTranslationsCache['en'] || {}
        });
        setIsLoading(false);
        return;
      }
      
      console.log('[LANGUAGE_CONTEXT] Starting translations load - timestamp:', new Date().toISOString());
      setIsLoading(true);
      setError(null);

      try {
        const primary = currentLanguageCode;
        
        // Resolve secondary language from IP if needed
        let secondary = secondaryLanguageCode;
        if (!secondary) {
          console.log('[LANGUAGE_CONTEXT] Resolving secondary language from IP - timestamp:', new Date().toISOString());
          try {
            secondary = await getIPLocation();
            console.log('[LANGUAGE_CONTEXT] IP location resolved - timestamp:', new Date().toISOString());
          } catch (error) {
            console.error('[LANGUAGE_CONTEXT] Failed to resolve IP location:', error);
            secondary = null;
          }
        }
        
        // Fetch translations in parallel
        console.log('[LANGUAGE_CONTEXT] Starting parallel fetches - timestamp:', new Date().toISOString());
        const [primaryData, secondaryData, englishData] = await Promise.all([
          fetchTranslations(primary),
          secondary ? fetchTranslations(secondary) : Promise.resolve({}),
          primary === 'en' ? Promise.resolve({}) : fetchTranslations('en')
        ]);
        console.log('[LANGUAGE_CONTEXT] All fetches completed - timestamp:', new Date().toISOString());
        
        // Get English data
        const finalEnglishData = primary === 'en' ? primaryData : englishData;
        
        // Log loaded translation keys count
        console.log('[LANGUAGE_CONTEXT] Loaded translations count:', {
          primary: Object.keys(primaryData).length,
          secondary: Object.keys(secondaryData).length,
          english: Object.keys(finalEnglishData).length
        });
        
        setTranslations({
          current: primaryData,
          secondary: secondaryData,
          english: finalEnglishData
        });
        
        // Save to localStorage for future use
        saveToCache(primaryData, secondaryData, finalEnglishData, primary, secondary);

        // Update localStorage language preferences
        localStorage.setItem(CACHE_KEYS.PRIMARY_LANG, primary);
        if (secondary) {
          localStorage.setItem(CACHE_KEYS.SECONDARY_LANG, secondary);
          if (secondaryLanguageCode !== secondary) {
            setSecondaryLanguageCode(secondary);
          }
        } else {
          localStorage.removeItem(CACHE_KEYS.SECONDARY_LANG);
        }
        
        console.log('[LANGUAGE_CONTEXT] Translation state updated - timestamp:', new Date().toISOString());
        setIsLoading(false);
      } catch (err) {
        console.error('[LANGUAGE_CONTEXT] Failed to load translations:', err);
        setError('Translation load failed');
        setIsLoading(false);
      }
    };

    loadTranslations();
  // IMPORTANT: Removed translations from dependencies to prevent infinite loop
  }, [currentLanguageCode, secondaryLanguageCode, fetchTranslations]);

  // Update translations from cache without fetching
  const updateTranslationsFromCache = useCallback(() => {
    setTranslations({
      current: globalTranslationsCache[currentLanguageCode] || {},
      secondary: secondaryLanguageCode ? globalTranslationsCache[secondaryLanguageCode] || {} : {},
      english: globalTranslationsCache['en'] || {}
    });
  }, [currentLanguageCode, secondaryLanguageCode]);

  // Update translations when language changes - REMOVED to prevent infinite loops
  // Second useEffect that was causing infinite loop has been removed

  // Translation function with added debug logging
  const t = useCallback((key: string): string => {
    // Start translation performance measurement for slow keys
    const startTime = performance.now();
    
    let result = key;
    let source = 'fallback';
    
    if (translations.current[key]) {
      result = translations.current[key];
      source = 'primary';
    } else if (translations.secondary[key]) {
      result = translations.secondary[key];
      source = 'secondary';
    } else if (translations.english[key]) {
      result = translations.english[key];
      source = 'english';
    }
    
    // Log if key is missing in all languages
    if (source === 'fallback') {
      console.warn(`[LANGUAGE_CONTEXT] Missing translation for key: "${key}"`);
    }
    
    // Log slow translations that might cause rendering delay
    const endTime = performance.now();
    const duration = endTime - startTime;
    if (duration > 5) { // Log translations taking more than 5ms
      console.log(`[LANGUAGE_CONTEXT] Slow translation for key "${key}" (${source}) - ${duration.toFixed(2)}ms`);
    }
    
    return result;
  }, [translations]);

  // Change primary language
  const changeLanguage = useCallback((langCode: string) => {
    if (langCode === secondaryLanguageCode) {
      // Swap primary and secondary languages
      setCurrentLanguageCode(langCode);
      setSecondaryLanguageCode(currentLanguageCode);
    } else {
      setCurrentLanguageCode(langCode);
    }
    
    // Manually update translations after language change
    // Use setTimeout to ensure this happens after state updates
    setTimeout(() => {
      if (globalTranslationsCache[langCode]) {
        setTranslations(prev => ({
          ...prev,
          current: globalTranslationsCache[langCode] || {},
        }));
      }
    }, 0);
  }, [currentLanguageCode, secondaryLanguageCode]);

  // Set secondary language
  const updateSecondaryLanguage = useCallback((langCode: string | null) => {
    if (langCode === currentLanguageCode) return;
    setSecondaryLanguageCode(langCode);
    
    // Manually update translations after secondary language change
    setTimeout(() => {
      if (langCode && globalTranslationsCache[langCode]) {
        setTranslations(prev => ({
          ...prev,
          secondary: globalTranslationsCache[langCode] || {},
        }));
      } else {
        setTranslations(prev => ({
          ...prev,
          secondary: {},
        }));
      }
    }, 0);
  }, [currentLanguageCode]);

  const contextValue = React.useMemo(() => ({
    t,
    currentLanguageCode,
    secondaryLanguageCode,
    changeLanguage,
    setSecondaryLanguage: updateSecondaryLanguage,
    isLoading,
    error
  }), [t, currentLanguageCode, secondaryLanguageCode, changeLanguage, updateSecondaryLanguage, isLoading, error]);

  // Memoize the provider component to prevent unnecessary re-renders
  if (!memoizedProvider) {
    memoizedProvider = React.memo(({ children }: { children: ReactNode }) => (
      <LanguageContext.Provider value={contextValue}>
        {children}
      </LanguageContext.Provider>
    ));
    console.log('[LANGUAGE_CONTEXT] Provider memoized - timestamp:', new Date().toISOString());
  }

  const MemoProvider = memoizedProvider;
  return <MemoProvider>{children}</MemoProvider>;
};

// Helper function to save translations to localStorage
function saveToCache(
  primaryData: LanguageTranslation,
  secondaryData: LanguageTranslation,
  englishData: LanguageTranslation,
  primaryLang: string,
  secondaryLang: string | null
) {
  console.log('[LANGUAGE_CONTEXT] Saving to localStorage - timestamp:', new Date().toISOString());
  try {
    // Create a cache object with language codes as keys
    const cacheObject = {
      current: primaryData,
      secondary: secondaryData,
      english: englishData,
      [primaryLang]: primaryData,
    };
    
    // Add secondary language if available
    if (secondaryLang) {
      cacheObject[secondaryLang] = secondaryData;
    }
    
    // Add English if it's not already included
    if (primaryLang !== 'en' && secondaryLang !== 'en') {
      cacheObject['en'] = englishData;
    }
    
    localStorage.setItem(CACHE_KEYS.TRANSLATIONS, JSON.stringify(cacheObject));
    localStorage.setItem(CACHE_KEYS.TIMESTAMP, Date.now().toString());
  } catch (error) {
    console.error('[LANGUAGE_CONTEXT] Error saving translations to localStorage:', error);
  }
}

// Custom hook to use the language context
export const useLanguage = () => useContext(LanguageContext);

// Export default for convenience
export default LanguageContext;