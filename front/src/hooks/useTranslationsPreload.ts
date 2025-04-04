// File: src/hooks/useTranslationsPreload.ts
// Last change: Fixed potential issues with effect and async loading

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';

interface TranslationsPreloadOptions {
  primaryLc: string;
  secondaryLc: string | null;
  enabled: boolean;
}

// Type for translations
type TranslationsData = Record<string, string>;

// Type for cache
interface TranslationCache {
  [lc: string]: TranslationsData;
}

const DEFAULT_LC = 'en';
const TRANSLATION_CACHE_KEY = 'translation-cache';
const CACHE_VERSION = 1;

// Hardcoded essential translations for immediate UI rendering
const ESSENTIAL_TRANSLATIONS: TranslationsData = {
  'common.loading': 'Loading...',
  'common.error': 'Error',
  'language.en': 'English',
  'language.sk': 'Slovak', 
  'language.cs': 'Czech',
  'language.de': 'German'
};

export const useTranslationsPreload = ({ primaryLc, secondaryLc, enabled }: TranslationsPreloadOptions) => {
  // Determine tertiary language (English if neither primary nor secondary is English)
  const tertiaryLc = useMemo(() => {
    if (primaryLc === DEFAULT_LC || secondaryLc === DEFAULT_LC) return null;
    return DEFAULT_LC;
  }, [primaryLc, secondaryLc]);
  
  // Priority languages for this user
  const priorityLanguages = useMemo(() => {
    return [primaryLc, secondaryLc, tertiaryLc]
      .filter(Boolean) as string[];
  }, [primaryLc, secondaryLc, tertiaryLc]);
  
  // States
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [loadedLanguages, setLoadedLanguages] = useState<string[]>([]);
  
  // Translation cache in localStorage
  const [storageCache, setStorageCache] = useLocalStorage<{
    version: number;
    translations: TranslationCache;
  }>(TRANSLATION_CACHE_KEY, {
    version: CACHE_VERSION,
    translations: { [DEFAULT_LC]: ESSENTIAL_TRANSLATIONS }
  });
  
  // In-memory cache (includes localStorage + runtime loaded)
  const [memoryCache, setMemoryCache] = useState<TranslationCache>(
    storageCache.version === CACHE_VERSION ? 
      storageCache.translations : 
      { [DEFAULT_LC]: ESSENTIAL_TRANSLATIONS }
  );
  
  // Load translations from API
  const fetchTranslations = useCallback(async (lc: string): Promise<TranslationsData> => {
    try {
      console.log(`[useTranslationsPreload] 🌐 Fetching translations for ${lc} from API`);
      
      // MOCK API CALL - Replace with actual API call when ready
      // This simulates API response to avoid runtime errors
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            [`language.${lc}`]: lc === 'en' ? 'English' : 
                              lc === 'sk' ? 'Slovak' : 
                              lc === 'cs' ? 'Czech' :
                              lc === 'de' ? 'German' : lc,
            'common.loading': lc === 'en' ? 'Loading...' :
                            lc === 'sk' ? 'Načítavam...' :
                            lc === 'cs' ? 'Načítám...' :
                            lc === 'de' ? 'Laden...' : 'Loading...'
          });
        }, 100);
      });
      
      // Uncomment this when API is ready
      /*
      const response = await fetch(`/api/translations?lc=${lc}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load translations for ${lc}: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
      */
    } catch (error) {
      console.error(`[useTranslationsPreload] ❌ Error fetching translations for ${lc}:`, error);
      return {}; // Return empty object instead of throwing
    }
  }, []);
  
  // Load translations with storage cache or API
  const loadTranslations = useCallback(async (lc: string): Promise<TranslationsData> => {
    if (!lc) return {};
    
    // Already in memory cache
    if (memoryCache[lc]) {
      console.log(`[useTranslationsPreload] ✅ Using in-memory translations for ${lc}`);
      return memoryCache[lc];
    }
    
    try {
      setIsLoading(true);
      
      // Try to get translations
      let translations: TranslationsData;
      
      // Already in localStorage cache (and valid version)
      if (storageCache.version === CACHE_VERSION && storageCache.translations[lc]) {
        console.log(`[useTranslationsPreload] 📦 Using localStorage translations for ${lc}`);
        translations = storageCache.translations[lc];
      } else {
        // Not in cache, fetch from API
        translations = await fetchTranslations(lc);
      }
      
      // Update in-memory cache
      setMemoryCache(prev => ({
        ...prev,
        [lc]: translations
      }));
      
      // Update localStorage cache for priority languages
      if (priorityLanguages.includes(lc)) {
        setStorageCache(prev => ({
          version: CACHE_VERSION,
          translations: {
            ...prev.translations,
            [lc]: translations
          }
        }));
      }
      
      // Add to loaded languages
      setLoadedLanguages(prev => {
        if (prev.includes(lc)) return prev;
        return [...prev, lc];
      });
      
      return translations;
    } catch (error) {
      console.error(`[useTranslationsPreload] Failed to load translations:`, error);
      setHasError(true);
      return {};
    } finally {
      setIsLoading(false);
    }
  }, [memoryCache, storageCache, fetchTranslations, priorityLanguages, setStorageCache]);

  // Load current language immediately, and priority languages in the background
  useEffect(() => {
    if (!enabled) return;
    
    let mounted = true;
    
    const loadPrimaryLanguage = async () => {
      try {
        console.log(`[useTranslationsPreload] Loading primary language: ${primaryLc}`);
        
        // Load primary language first (wait for it)
        await loadTranslations(primaryLc);
        
        if (!mounted) return;
        
        // Load other priority languages in background
        const otherLanguages = priorityLanguages.filter(lc => lc !== primaryLc);
        
        if (otherLanguages.length > 0) {
          console.log(`[useTranslationsPreload] Loading other priority languages: ${otherLanguages.join(', ')}`);
          
          for (const lc of otherLanguages) {
            if (!mounted) break;
            // Don't await - load in background
            loadTranslations(lc).catch(err => {
              console.warn(`[useTranslationsPreload] Failed to load language ${lc}:`, err);
            });
          }
        }
      } catch (err) {
        console.error(`[useTranslationsPreload] Error loading languages:`, err);
      }
    };
    
    loadPrimaryLanguage();
    
    return () => {
      mounted = false;
    };
  }, [enabled, primaryLc, priorityLanguages, loadTranslations]);

  // Translation function with fallback chain
  const t = useCallback((key: string, defaultValue?: string): string => {
    // Try primary language
    if (memoryCache[primaryLc]?.[key]) {
      return memoryCache[primaryLc][key];
    }
    
    // Try secondary language if available
    if (secondaryLc && memoryCache[secondaryLc]?.[key]) {
      return memoryCache[secondaryLc][key];
    }
    
    // Try tertiary language (English) if available and not already tried
    if (tertiaryLc && memoryCache[tertiaryLc]?.[key]) {
      return memoryCache[tertiaryLc][key];
    }
    
    // If we get here, we don't have a translation
    // Return defaultValue or the key itself to indicate missing translation
    return defaultValue || key;
  }, [memoryCache, primaryLc, secondaryLc, tertiaryLc]);

  // Public API from this hook
  return { 
    t,
    isLoading,
    hasError,
    loadedLanguages,
    loadTranslations,
    priorityLanguages
  };
};

export default useTranslationsPreload;