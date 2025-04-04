// File: ./front/src/hooks/useTranslationsPreload.ts
// This hook preloads translations for the application.
// It prioritizes loading the primary language translations immediately (from LS if available or from API)
// and then loads other priority languages (secondary and tertiary) in the background.
// The translations are cached in localStorage and in memory for fast access.

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';

interface TranslationsPreloadOptions {
  primaryLc: string;
  secondaryLc: string | null;
  enabled: boolean;
}

// Type for translations
type TranslationsData = Record<string, string>;

// Type for cache object for translations
interface TranslationCache {
  [lc: string]: TranslationsData;
}

const DEFAULT_LC = 'en';
const TRANSLATION_CACHE_KEY = 'translation-cache';
const CACHE_VERSION = 1;

// Minimal essential translations (could be preloaded)
const ESSENTIAL_TRANSLATIONS: TranslationsData = {};

// Calculate tertiary language: default (en) if neither primary nor secondary is en
const useTertiaryLanguage = (primaryLc: string, secondaryLc: string | null): string | null =>
  useMemo(() => {
    if (primaryLc === DEFAULT_LC || secondaryLc === DEFAULT_LC) return null;
    return DEFAULT_LC;
  }, [primaryLc, secondaryLc]);

export const useTranslationsPreload = ({ primaryLc, secondaryLc, enabled }: TranslationsPreloadOptions) => {
  // Determine tertiary language
  const tertiaryLc = useTertiaryLanguage(primaryLc, secondaryLc);

  // Build priority languages list: filter out falsy values
  const priorityLanguages = useMemo(() => {
    return [primaryLc, secondaryLc, tertiaryLc].filter(Boolean) as string[];
  }, [primaryLc, secondaryLc, tertiaryLc]);

  // Local state for loading and error status, and for tracking which languages are loaded
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [loadedLanguages, setLoadedLanguages] = useState<string[]>([]);

  // LocalStorage cache for translations
  const [storageCache, setStorageCache] = useLocalStorage<{
    version: number;
    translations: TranslationCache;
  }>(TRANSLATION_CACHE_KEY, {
    version: CACHE_VERSION,
    translations: { [DEFAULT_LC]: ESSENTIAL_TRANSLATIONS }
  });

  // In-memory cache combining LS cache and runtime loaded translations
  const [memoryCache, setMemoryCache] = useState<TranslationCache>(
    storageCache.version === CACHE_VERSION ? storageCache.translations : { [DEFAULT_LC]: ESSENTIAL_TRANSLATIONS }
  );

  // Function to fetch translations from API for a given language code
  const fetchTranslations = useCallback(async (lc: string): Promise<TranslationsData> => {
    try {
      console.log(`[useTranslationsPreload] 🌐 Fetching translations for ${lc} from API`);
      // API fetch logic (uncomment when API is available)
      /*
      const response = await fetch(`/api/translations?lc=${lc}`);
      if (!response.ok) {
        throw new Error(`Failed to load translations for ${lc}: ${response.status}`);
      }
      const data = await response.json();
      return data;
      */
      // For now, return an empty object (will fallback to keys)
      return {};
    } catch (error) {
      console.error(`[useTranslationsPreload] ❌ Error fetching translations for ${lc}:`, error);
      return {}; // Fallback to empty translations
    }
  }, []);

  // Function to load translations for a specific language, using LS cache or fetching from API
  const loadTranslations = useCallback(async (lc: string): Promise<TranslationsData> => {
    if (!lc) return {};
    // If translations already loaded in memory, return them
    if (memoryCache[lc]) {
      console.log(`[useTranslationsPreload] ✅ Using in-memory translations for ${lc}`);
      return memoryCache[lc];
    }
    try {
      setIsLoading(true);
      let translations: TranslationsData;
      // Check localStorage cache if version is valid
      if (storageCache.version === CACHE_VERSION && storageCache.translations[lc]) {
        console.log(`[useTranslationsPreload] 📦 Using localStorage translations for ${lc}`);
        translations = storageCache.translations[lc];
      } else {
        // Otherwise, fetch from API
        translations = await fetchTranslations(lc);
      }
      // Update in-memory cache
      setMemoryCache(prev => ({ ...prev, [lc]: translations }));
      // For priority languages, update localStorage cache
      if (priorityLanguages.includes(lc)) {
        setStorageCache(prev => ({
          version: CACHE_VERSION,
          translations: { ...prev.translations, [lc]: translations }
        }));
      }
      // Mark language as loaded (avoid duplicate entries)
      setLoadedLanguages(prev => prev.includes(lc) ? prev : [...prev, lc]);
      return translations;
    } catch (error) {
      console.error(`[useTranslationsPreload] Failed to load translations for ${lc}:`, error);
      setHasError(true);
      setLoadedLanguages(prev => prev.includes(lc) ? prev : [...prev, lc]);
      return {}; // Fallback to empty object if error
    } finally {
      setIsLoading(false);
    }
  }, [memoryCache, storageCache, fetchTranslations, priorityLanguages, setStorageCache]);

  // useEffect to load primary language translations immediately, then background load other priorities
  useEffect(() => {
    if (!enabled) return;
    let mounted = true;
    const loadPrimaryLanguage = async () => {
      try {
        console.log(`[useTranslationsPreload] Loading primary language: ${primaryLc}`);
        await loadTranslations(primaryLc);
        if (!mounted) return;
        // Load remaining priority languages in the background
        const otherLanguages = priorityLanguages.filter(lc => lc !== primaryLc);
        if (otherLanguages.length > 0) {
          console.log(`[useTranslationsPreload] Loading other priority languages: ${otherLanguages.join(', ')}`);
          for (const lc of otherLanguages) {
            if (!mounted) break;
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

  // Translation function: returns the translation for a given key based on the fallback chain
  const t = useCallback((key: string, defaultValue?: string): string => {
    // Try primary language translations
    if (memoryCache[primaryLc]?.[key]) {
      return memoryCache[primaryLc][key];
    }
    // Try secondary language if available
    if (secondaryLc && memoryCache[secondaryLc]?.[key]) {
      return memoryCache[secondaryLc][key];
    }
    // Try tertiary language (default English) if available
    if (tertiaryLc && memoryCache[tertiaryLc]?.[key]) {
      return memoryCache[tertiaryLc][key];
    }
    // Fallback: return provided defaultValue or the key itself
    return defaultValue || key;
  }, [memoryCache, primaryLc, secondaryLc, tertiaryLc]);

  // Public API of the hook
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
