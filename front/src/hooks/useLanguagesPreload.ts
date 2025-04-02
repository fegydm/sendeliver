// File: ./front/src/hooks/useLanguagesPreload.ts
// Last change: Added immediate loading for English language and translations

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useFlagManager } from './useFlagManager';
import type { Language } from '@/types/language.types';

// Pre-initialized English language data for immediate access
const ENGLISH_LANGUAGE: Language = {
  id: 1,
  lc: 'en',
  cc: 'GB',
  name_en: 'English',
  name_sk: 'Angličtina',
  native_name: 'English',
  is_rtl: false
};

interface LanguageCacheData {
  languages: Language[];
  timestamp: number;
  version: number;
}

interface UseLanguagesOptions {
  enabled?: boolean;
  priority?: boolean;
  cacheTTL?: number;
  priorityLanguageCodes?: string[];
  defaultLanguage?: 'en' | string;
}

const DEFAULT_PRIORITY_CODES = ['GB', 'DE', 'FR', 'ES', 'IT', 'SK', 'CZ', 'PL', 'RU'];
const CACHE_VERSION = 3;
const DEFAULT_CACHE_TTL = 7 * 24 * 60 * 60 * 1000;

export function useLanguagesPreload(options?: UseLanguagesOptions) {
  const {
    enabled = true,
    cacheTTL = DEFAULT_CACHE_TTL,
    priorityLanguageCodes = DEFAULT_PRIORITY_CODES,
    defaultLanguage = 'en'
  } = options || {};

  // Make sure GB is always the first priority for English
  const priorityCodes = useMemo(() => {
    const codes = [...priorityLanguageCodes];
    // Remove GB if it exists anywhere in the array
    const gbIndex = codes.findIndex(code => code.toUpperCase() === 'GB');
    if (gbIndex !== -1) {
      codes.splice(gbIndex, 1);
    }
    // Add GB to the beginning
    return ['GB', ...codes];
  }, [priorityLanguageCodes]);

  // Initialize with English already loaded
  const initialLanguages = useMemo(() => [ENGLISH_LANGUAGE], []);
  const initialPriorityLanguages = useMemo(() => [ENGLISH_LANGUAGE], []);

  const [languages, setLanguages] = useState<Language[]>(initialLanguages);
  const [priorityLanguages, setPriorityLanguages] = useState<Language[]>(initialPriorityLanguages);
  const [isLoading, setIsLoading] = useState(true);
  const [isPriorityLoaded, setIsPriorityLoaded] = useState(true); // Start with true since English is pre-loaded
  const [error, setError] = useState<Error | null>(null);
  const [filterCache] = useState<Map<string, Language[]>>(new Map());

  // Updated to use the correct parameter names and make GB the priority
  const { getFlagUrl, preloadFlags, loadedFlags } = useFlagManager({
    prioritizedCountry: 'GB', // Always make GB the priority
    otherCountryCodes: priorityCodes.slice(1),
    preloadPriority: true  // Set to true to load priority flags immediately
  });

  const [languagesCache, setLanguagesCache] = useLocalStorage<LanguageCacheData>('languages-cache', {
    languages: initialLanguages, // Initialize with English
    timestamp: Date.now(),
    version: CACHE_VERSION,
  });

  // Calculate localStorage size in bytes
  const getStorageSize = useCallback(() => {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += ((localStorage[key].length + key.length) * 2); // UTF-16, 2 bytes per character
      }
    }
    console.log(`[useLanguagesPreload] LocalStorage size: ${total} bytes (${(total / 1024).toFixed(2)} KB)`);
    return total;
  }, []);

  const isCacheValid = useMemo(() => {
    return (
      languagesCache.version === CACHE_VERSION &&
      languagesCache.languages?.length > 1 && // More than just English
      Date.now() - languagesCache.timestamp < cacheTTL
    );
  }, [languagesCache, cacheTTL]);

  const languageByIdMap = useMemo(() => {
    const map = new Map<number, Language>();
    languages.forEach(lang => map.set(lang.id, lang));
    return map;
  }, [languages]);

  const languageByCcMap = useMemo(() => {
    const map = new Map<string, Language>();
    languages.forEach(lang => {
      if (lang.cc) map.set(lang.cc, lang);
    });
    return map;
  }, [languages]);

  const languageByCodeMap = useMemo(() => {
    const map = new Map<string, Language>();
    languages.forEach(lang => {
      if (lang.lc) map.set(lang.lc.toLowerCase(), lang);
    });
    return map;
  }, [languages]);

  const fetchLanguages = useCallback(async () => {
    if (!enabled) return;
    
    try {
      setIsLoading(true);
      setError(null);

      if (isCacheValid) {
        const cachedLanguages = languagesCache.languages;
        
        // Make sure English is always present
        if (!cachedLanguages.some(lang => lang.lc === 'en')) {
          cachedLanguages.unshift(ENGLISH_LANGUAGE);
        }
        
        const cachedPriorityLanguages = cachedLanguages.filter(lang => 
          priorityCodes.includes(lang.cc)
        );
        
        if (cachedPriorityLanguages.length > 0) {
          setPriorityLanguages(cachedPriorityLanguages);
          setIsPriorityLoaded(true);
        }

        setLanguages(cachedLanguages);
        setIsLoading(false);
        getStorageSize();
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch('/api/geo/languages', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch languages: ${response.status}`);
      }

      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid language data format from API');
      }

      const fetchedLanguages: Language[] = data.map(item => ({
        id: item.id || 0,
        lc: item.code_2 || '',
        cc: item.primary_country_code || item.code_2?.toUpperCase() || '',
        name_en: item.name_en || 'Unknown',
        name_sk: item.name_sk || '',
        native_name: item.native_name || item.name_local || item.name_en || 'Unknown',
        is_rtl: item.is_rtl || false
      }));
      
      // Make sure English is always first
      const englishIndex = fetchedLanguages.findIndex(lang => lang.lc === 'en');
      if (englishIndex === -1) {
        fetchedLanguages.unshift(ENGLISH_LANGUAGE);
      } else if (englishIndex > 0) {
        const english = fetchedLanguages.splice(englishIndex, 1)[0];
        fetchedLanguages.unshift(english);
      }
      
      const priorityLangs = fetchedLanguages.filter(lang => 
        priorityCodes.includes(lang.cc)
      );
      
      setPriorityLanguages(priorityLangs);
      setLanguages(fetchedLanguages);
      setIsPriorityLoaded(true);
      
      setLanguagesCache({
        languages: fetchedLanguages,
        timestamp: Date.now(),
        version: CACHE_VERSION,
      });

      // Ensure all country codes are valid before preloading
      const priorityCCs = priorityLangs
        .map(lang => lang.cc)
        .filter(cc => cc && !loadedFlags.includes(cc));
        
      if (priorityCCs.length > 0) {
        preloadFlags(priorityCCs);
      }
      
      getStorageSize();
    } catch (err) {
      console.error('[LanguagesPreload] Error fetching languages:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch languages'));
      
      // Even if fetching fails, make sure English is available
      if (!languages.some(lang => lang.lc === 'en')) {
        setLanguages(prev => [ENGLISH_LANGUAGE, ...prev.filter(lang => lang.lc !== 'en')]);
        setPriorityLanguages(prev => [ENGLISH_LANGUAGE, ...prev.filter(lang => lang.lc !== 'en')]);
      }
      
      getStorageSize();
    } finally {
      setIsLoading(false);
    }
  }, [enabled, isCacheValid, languagesCache, priorityCodes, preloadFlags, setLanguagesCache, loadedFlags, getStorageSize, languages]);

  useEffect(() => {
    if (enabled) {
      fetchLanguages();
    }
  }, [enabled, fetchLanguages]);

  const getLanguageById = useCallback((id: number): Language | undefined => {
    // Always return English for ID 1 to ensure it's available immediately
    if (id === 1) return ENGLISH_LANGUAGE;
    return languageByIdMap.get(id);
  }, [languageByIdMap]);

  const getLanguageByCc = useCallback((cc?: string): Language | undefined => {
    if (!cc) return undefined;
    // Always return English for GB to ensure it's available immediately
    if (cc.toUpperCase() === 'GB') return ENGLISH_LANGUAGE;
    return languageByCcMap.get(cc);
  }, [languageByCcMap]);

  const getLanguageByCode = useCallback((lc: string): Language | undefined => {
    if (!lc) return undefined;
    // Always return English for 'en' to ensure it's available immediately
    if (lc.toLowerCase() === 'en') return ENGLISH_LANGUAGE;
    return languageByCodeMap.get(lc.toLowerCase());
  }, [languageByCodeMap]);

  const filterLanguages = useCallback((query: string): Language[] => {
    if (!query) return languages;

    const normalizedQuery = query.toLowerCase().trim();
    
    if (filterCache.has(normalizedQuery)) {
      return filterCache.get(normalizedQuery) || [];
    }

    const filtered = languages.filter(lang => {
      const matchesCode = 
        (lang.cc && lang.cc.toLowerCase().startsWith(normalizedQuery)) ||
        (lang.lc && lang.lc.toLowerCase().startsWith(normalizedQuery));
        
      const matchesName =
        lang.name_en.toLowerCase().includes(normalizedQuery) ||
        (lang.name_sk && lang.name_sk.toLowerCase().includes(normalizedQuery)) ||
        (lang.native_name && lang.native_name.toLowerCase().includes(normalizedQuery));
        
      return matchesCode || matchesName;
    });

    // Safely remove old cache items if we have too many
    if (filterCache.size >= 100) {
      const firstKey = filterCache.keys().next().value;
      if (firstKey !== undefined) {
        filterCache.delete(firstKey);
      }
    }
    
    filterCache.set(normalizedQuery, filtered);
    return filtered;
  }, [languages, filterCache]);

  return {
    languages,
    priorityLanguages,
    isLoading,
    isPriorityLoaded,
    error,
    getFlagUrl,
    getLanguageById,
    getLanguageByCc,
    getLanguageByCode,
    filterLanguages,
    loadAllLanguages: fetchLanguages
  };
}

export default useLanguagesPreload;