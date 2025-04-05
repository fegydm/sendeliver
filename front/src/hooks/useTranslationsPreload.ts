// File: src/hooks/useTranslationsPreload.ts
// Last change: Jednoduché a čisté riešenie

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';

interface TranslationsPreloadOptions {
  primaryLc: string;
  secondaryLc: string | null;
  enabled: boolean;
}

type TranslationsData = Record<string, string>;

interface TranslationCache {
  [lc: string]: TranslationsData;
}

const DEFAULT_LC = 'en';
const TRANSLATION_CACHE_KEY = 'translation-cache';
const CACHE_VERSION = 1;

const useTertiaryLanguage = (primaryLc: string, secondaryLc: string | null): string | null =>
  useMemo(() => {
    if (primaryLc === DEFAULT_LC || secondaryLc === DEFAULT_LC) return null;
    return DEFAULT_LC;
  }, [primaryLc, secondaryLc]);

export const useTranslationsPreload = ({ primaryLc, secondaryLc, enabled }: TranslationsPreloadOptions) => {
  const tertiaryLc = useTertiaryLanguage(primaryLc, secondaryLc);

  const priorityLanguages = useMemo(() => {
    return [primaryLc, secondaryLc, tertiaryLc].filter(Boolean) as string[];
  }, [primaryLc, secondaryLc, tertiaryLc]);

  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [loadedLanguages, setLoadedLanguages] = useState<string[]>([]);

  // Inicializácia localStorage cache
  const [storageCache, setStorageCache] = useLocalStorage<{
    version: number;
    translations: TranslationCache;
  }>(TRANSLATION_CACHE_KEY, {
    version: CACHE_VERSION,
    translations: {}
  });

  // Inicializácia memory cache
  const [memoryCache, setMemoryCache] = useState<TranslationCache>(
    storageCache.version === CACHE_VERSION ? storageCache.translations : {}
  );

  // Načítanie prekladov z API
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
      return {};
    }
  }, []);

  // Načítanie prekladov s použitím cache
  const loadTranslations = useCallback(async (lc: string): Promise<TranslationsData> => {
    if (!lc) return {};
    
    // Ak už máme načítané v pamäti, vrátime ich
    if (memoryCache[lc] && Object.keys(memoryCache[lc]).length > 0) {
      console.log(`[TranslationsPreload] Using in-memory translations for ${lc}`);
      return memoryCache[lc];
    }
    
    // Ak máme v localStorage, vrátime ich
    if (storageCache.version === CACHE_VERSION && 
        storageCache.translations[lc] && 
        Object.keys(storageCache.translations[lc]).length > 0) {
      
      console.log(`[TranslationsPreload] Using localStorage translations for ${lc}`);
      
      const translations = storageCache.translations[lc];
      setMemoryCache(prev => ({ ...prev, [lc]: translations }));
      
      setLoadedLanguages(prev => prev.includes(lc) ? prev : [...prev, lc]);
      return translations;
    }
    
    // Potrebujeme načítať z API
    try {
      setIsLoading(true);
      
      const translations = await fetchTranslations(lc);
      
      if (Object.keys(translations).length > 0) {
        console.log(`[TranslationsPreload] Updating caches with translations`);
        
        // Aktualizovať memoryCache
        setMemoryCache(prev => ({ ...prev, [lc]: translations }));
        
        // Aktualizovať localStorage
        setStorageCache(prev => ({
          version: CACHE_VERSION,
          translations: { ...prev.translations, [lc]: translations }
        }));
        
        setLoadedLanguages(prev => prev.includes(lc) ? prev : [...prev, lc]);
        return translations;
      } else {
        console.warn(`[TranslationsPreload] No translations received for ${lc}`);
        setLoadedLanguages(prev => prev.includes(lc) ? prev : [...prev, lc]);
        return {};
      }
    } catch (error) {
      console.error(`[TranslationsPreload] Failed to load translations for ${lc}:`, error);
      setHasError(true);
      setLoadedLanguages(prev => prev.includes(lc) ? prev : [...prev, lc]);
      return {};
    } finally {
      setIsLoading(false);
    }
  }, [memoryCache, storageCache, fetchTranslations, setStorageCache]);

  // Načítať preklady, keď sa zmení jazyk
  useEffect(() => {
    if (!enabled) return;
    
    let mounted = true;
    
    const loadAllLanguages = async () => {
      try {
        // Načítať primárny jazyk
        if (primaryLc && mounted) {
          console.log(`[TranslationsPreload] Loading primary language: ${primaryLc}`);
          await loadTranslations(primaryLc);
        }
        
        // Načítať ostatné jazyky
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

  // Funkcia na preklad - vracia kľúč, ak preklad neexistuje
  const t = useCallback((key: string): string => {
    if (!key) return '';
    
    // Skúsiť nájsť preklad v primárnom jazyku
    if (memoryCache[primaryLc]?.[key]) {
      return memoryCache[primaryLc][key];
    }
    
    // Ak preklad neexistuje, vrátiť kľúč
    console.log(`[TranslationsPreload] Missing translation for key: ${key}`);
    return key;
  }, [memoryCache, primaryLc]);

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