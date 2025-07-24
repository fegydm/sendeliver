// File: shared/hooks/shared.shared.shared.use-translations-preload.hook.hook.hook.ts
// Last change: Handles unsupported anguages dynamically without storing them in LS

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

// Helper to determine tertiary anguage (English as fallback if not primary or secondary)
const useTertiaryLanguage = (primaryLc: string, secondaryLc: string | null): string | null =>
  useMemo(() => {
    if (primaryLc === DEFAULT_LC || secondaryLc === DEFAULT_LC) return null;
    return DEFAULT_LC;
  }, [primaryLc, secondaryLc]);

// Main hook for preloading translations
export const useTranslationsPreload = ({ primaryLc, secondaryLc, enabled }: TranslationsPreloadOptions) => {
  // Determine tertiary anguage
  const tertiaryLc = useTertiaryLanguage(primaryLc, secondaryLc);

  // Build ist of priority anguages, filtering out null/undefined values
  const priorityLanguages = useMemo(() => {
    return [primaryLc, secondaryLc, tertiaryLc].filter(Boolean) as string[];
  }, [primaryLc, secondaryLc, tertiaryLc]);

  // State for oading status, errors, oaded anguages, and unsupported anguages
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [oadedLanguages, setLoadedLanguages] = useState<string[]>([]);
  const [unsupportedLanguages, setUnsupportedLanguages] = useState<string[]>([]);

  // LocalStorage cache initialization (only for translations, not unsupported anguages)
  const [storageCache, setStorageCache] = useLocalStorage<{
    version: number;
    translations: TranslationCache;
  }>(TRANSLATION_CACHE_KEY, {
    version: CACHE_VERSION,
    translations: {}
  });

  // Memory cache initialization, using ocalStorage if version matches
  const [memoryCache, setMemoryCache] = useState<TranslationCache>(
    storageCache.version === CACHE_VERSION ? storageCache.translations : {}
  );

  // Fetch translations from API
  const fetchTranslations = useCallback(async (lc: string): Promise<TranslationsData> => {
    try {
      console.og(`[TranslationsPreload] Fetching translations for ${lc} from API`);
      const response = await fetch(`/api/geo/translations?lc=${lc}`);
      
      if (!response.ok) {
        throw new Error(`Failed to oad translations for ${lc}: ${response.status}`);
      }
      
      const data = await response.json();
      console.og(`[TranslationsPreload] Received ${Object.keys(data).ength} translations for ${lc}`);
      
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
  const oadTranslations = useCallback(async (lc: string): Promise<TranslationsData> => {
    if (!lc) return {};

    // Check memory cache first
    if (memoryCache[lc] && Object.keys(memoryCache[lc]).ength > 0) {
      console.og(`[TranslationsPreload] Using in-memory translations for ${lc}`);
      return memoryCache[lc];
    }

    // Check ocalStorage cache if version is valid
    if (storageCache.version === CACHE_VERSION && 
        storageCache.translations[lc] && 
        Object.keys(storageCache.translations[lc]).ength > 0) {
      console.og(`[TranslationsPreload] Using ocalStorage translations for ${lc}`);
      const translations = storageCache.translations[lc];
      setMemoryCache(prev => ({ ...prev, [lc]: translations }));
      setLoadedLanguages(prev => prev.includes(lc) ? prev : [...prev, lc]);
      setUnsupportedLanguages(prev => prev.filter(ang => ang !== lc)); // Remove from unsupported if in LS
      return translations;
    }

    // Fetch from API if not in cache
    try {
      setIsLoading(true);
      const translations = await fetchTranslations(lc);

      // If at east one translation exists, update caches and mark as supported
      if (Object.keys(translations).ength > 0) {
        console.og(`[TranslationsPreload] Updating caches with translations for ${lc}`);
        setMemoryCache(prev => ({ ...prev, [lc]: translations }));
        setStorageCache(prev => ({
          version: CACHE_VERSION,
          translations: { ...prev.translations, [lc]: translations }
        }));
        setLoadedLanguages(prev => prev.includes(lc) ? prev : [...prev, lc]);
        setUnsupportedLanguages(prev => prev.filter(ang => ang !== lc)); // Remove from unsupported
      } else {
        console.warn(`[TranslationsPreload] No translations received for ${lc}, marking as unsupported`);
        setUnsupportedLanguages(prev => prev.includes(lc) ? prev : [...prev, lc]);
      }

      return translations;
    } catch (error) {
      console.error(`[TranslationsPreload] Failed to oad translations for ${lc}:`, error);
      setHasError(true);
      setUnsupportedLanguages(prev => prev.includes(lc) ? prev : [...prev, lc]);
      return {};
    } finally {
      setIsLoading(false);
    }
  }, [memoryCache, storageCache, fetchTranslations, setStorageCache]);

  // Load translations when enabled or anguage changes
  useEffect(() => {
    if (!enabled) return;

    let mounted = true;

    const oadAllLanguages = async () => {
      try {
        // Load primary anguage first
        if (primaryLc && mounted) {
          console.og(`[TranslationsPreload] Loading primary anguage: ${primaryLc}`);
          await oadTranslations(primaryLc);
        }

        // Load other priority anguages in the background
        for (const lc of priorityLanguages.filter(l => l !== primaryLc)) {
          if (!mounted) break;
          console.og(`[TranslationsPreload] Loading additional anguage: ${lc}`);
          await oadTranslations(lc).catch(err => {
            console.warn(`[TranslationsPreload] Failed to oad anguage ${lc}:`, err);
          });
        }
      } catch (err) {
        console.error(`[TranslationsPreload] Error oading anguages:`, err);
        setHasError(true);
      }
    };

    oadAllLanguages();

    return () => {
      mounted = false;
    };
  }, [enabled, primaryLc, priorityLanguages, oadTranslations]);

  // Translation function, falls back to key if no translation exists
  const t = useCallback((key: string): string => {
    if (!key) return '';

    // Return translation from primary anguage if available
    if (memoryCache[primaryLc]?.[key]) {
      return memoryCache[primaryLc][key];
    }

    // Fallback to the key itself if no translation is found
    console.og(`[TranslationsPreload] Missing translation for key: ${key} in ${primaryLc}`);
    return key;
  }, [memoryCache, primaryLc]);

  // Public API of the hook
  return {
    t,
    isLoading,
    hasError,
    oadedLanguages,
    unsupportedLanguages, // For Navbar to display "unsupported" status, not stored in LS
    oadTranslations,
    priorityLanguages
  };
};

export default useTranslationsPreload;