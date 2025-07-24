// File: src/shared/hooks/shared.use-ltranslations-lpreload.hook.ts
// Last change: Handles unsupported languages dynamically without storing them in LS

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';

// Options for the hook
interface TranslationsPreloadOptions {
  primaryLc: string;
  secondaryLc: string | null;
  enabled: boolean;
}

// Type for translation data
type TranslationsData = Record<string, string>;

// Type for translation cache
interface TranslationCache {
  [lc: string]: TranslationsData;
}

// Constants
const DEFAULT_LC = 'en';
const TRANSLATION_CACHE_KEY = 'translation-cache';
const CACHE_VERSION = 1;

// Helper to determine tertiary language (English as fallback if not primary or secondary)
const useTertiaryLanguage = (primaryLc: string, secondaryLc: string | null): string | null =>
  useMemo(() => {
    if (primaryLc === DEFAULT_LC || secondaryLc === DEFAULT_LC) return null;
    return DEFAULT_LC;
  }, [primaryLc, secondaryLc]);

// Main hook for preloading translations
export const useTranslationsPreload = ({ primaryLc, secondaryLc, enabled }: TranslationsPreloadOptions) => {
  // Determine tertiary language
  const tertiaryLc = useTertiaryLanguage(primaryLc, secondaryLc);

  // Build list of priority languages, filtering out null/undefined values
  const priorityLanguages = useMemo(() => {
    return [primaryLc, secondaryLc, tertiaryLc].filter(Boolean) as string[];
  }, [primaryLc, secondaryLc, tertiaryLc]);

  // State for loading status, errors, loaded languages, and unsupported languages
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [loadedLanguages, setLoadedLanguages] = useState<string[]>([]);
  const [unsupportedLanguages, setUnsupportedLanguages] = useState<string[]>([]);

  // LocalStorage cache initialization (only for translations, not unsupported languages)
  const [storageCache, setStorageCache] = useLocalStorage<{
    version: number;
    translations: TranslationCache;
  }>(TRANSLATION_CACHE_KEY, {
    version: CACHE_VERSION,
    translations: {}
  });

  // Memory cache initialization, using localStorage if version matches
  const [memoryCache, setMemoryCache] = useState<TranslationCache>(
    storageCache.version === CACHE_VERSION ? storageCache.translations : {}
  );

  // Fetch translations from API
  const fetchTranslations = useCallback(async (lc: string): Promise<TranslationsData> => {
    try {
      console.log(`[TranslationsPreload] Fetching translations for ${lc} from API`);
      const response = await fetch(`/api/geo/translations?lc=${lc}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load translations for ${lc}: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`[TranslationsPreload] Received ${Object.keys(data).length} translations for ${lc}`);
      
      if (!data || typeof data !== 'object') {
        throw new Error(`Invalid translation data for ${lc}`);
      }
      
      return data;
    } catch (error) {
      console.error(`[TranslationsPreload] Error fetching translations for ${lc}:`, error);
      return {}; // Return empty object for failed fetches
    }
  }, []);

  // Load translations, using cache or fetching from API
  const loadTranslations = useCallback(async (lc: string): Promise<TranslationsData> => {
    if (!lc) return {};

    // Check memory cache first
    if (memoryCache[lc] && Object.keys(memoryCache[lc]).length > 0) {
      console.log(`[TranslationsPreload] Using in-memory translations for ${lc}`);
      return memoryCache[lc];
    }

    // Check localStorage cache if version is valid
    if (storageCache.version === CACHE_VERSION && 
        storageCache.translations[lc] && 
        Object.keys(storageCache.translations[lc]).length > 0) {
      console.log(`[TranslationsPreload] Using localStorage translations for ${lc}`);
      const translations = storageCache.translations[lc];
      setMemoryCache(prev => ({ ...prev, [lc]: translations }));
      setLoadedLanguages(prev => prev.includes(lc) ? prev : [...prev, lc]);
      setUnsupportedLanguages(prev => prev.filter(lang => lang !== lc)); // Remove from unsupported if in LS
      return translations;
    }

    // Fetch from API if not in cache
    try {
      setIsLoading(true);
      const translations = await fetchTranslations(lc);

      // If at least one translation exists, update caches and mark as supported
      if (Object.keys(translations).length > 0) {
        console.log(`[TranslationsPreload] Updating caches with translations for ${lc}`);
        setMemoryCache(prev => ({ ...prev, [lc]: translations }));
        setStorageCache(prev => ({
          version: CACHE_VERSION,
          translations: { ...prev.translations, [lc]: translations }
        }));
        setLoadedLanguages(prev => prev.includes(lc) ? prev : [...prev, lc]);
        setUnsupportedLanguages(prev => prev.filter(lang => lang !== lc)); // Remove from unsupported
      } else {
        console.warn(`[TranslationsPreload] No translations received for ${lc}, marking as unsupported`);
        setUnsupportedLanguages(prev => prev.includes(lc) ? prev : [...prev, lc]);
      }

      return translations;
    } catch (error) {
      console.error(`[TranslationsPreload] Failed to load translations for ${lc}:`, error);
      setHasError(true);
      setUnsupportedLanguages(prev => prev.includes(lc) ? prev : [...prev, lc]);
      return {};
    } finally {
      setIsLoading(false);
    }
  }, [memoryCache, storageCache, fetchTranslations, setStorageCache]);

  // Load translations when enabled or language changes
  useEffect(() => {
    if (!enabled) return;

    let mounted = true;

    const loadAllLanguages = async () => {
      try {
        // Load primary language first
        if (primaryLc && mounted) {
          console.log(`[TranslationsPreload] Loading primary language: ${primaryLc}`);
          await loadTranslations(primaryLc);
        }

        // Load other priority languages in the background
        for (const lc of priorityLanguages.filter(l => l !== primaryLc)) {
          if (!mounted) break;
          console.log(`[TranslationsPreload] Loading additional language: ${lc}`);
          await loadTranslations(lc).catch(err => {
            console.warn(`[TranslationsPreload] Failed to load language ${lc}:`, err);
          });
        }
      } catch (err) {
        console.error(`[TranslationsPreload] Error loading languages:`, err);
        setHasError(true);
      }
    };

    loadAllLanguages();

    return () => {
      mounted = false;
    };
  }, [enabled, primaryLc, priorityLanguages, loadTranslations]);

  // Translation function, falls back to key if no translation exists
  const t = useCallback((key: string): string => {
    if (!key) return '';

    // Return translation from primary language if available
    if (memoryCache[primaryLc]?.[key]) {
      return memoryCache[primaryLc][key];
    }

    // Fallback to the key itself if no translation is found
    console.log(`[TranslationsPreload] Missing translation for key: ${key} in ${primaryLc}`);
    return key;
  }, [memoryCache, primaryLc]);

  // Public API of the hook
  return {
    t,
    isLoading,
    hasError,
    loadedLanguages,
    unsupportedLanguages, // For Navbar to display "unsupported" status, not stored in LS
    loadTranslations,
    priorityLanguages
  };
};

export default useTranslationsPreload;