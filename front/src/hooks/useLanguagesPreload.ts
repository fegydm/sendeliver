// File: ./front/src/hooks/useLanguagesPreload.ts
// Last change: Simplified solution - just use API values directly

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { Language } from '@/types/language.types';

interface LanguageCacheData {
  languages: Language[];
  timestamp: number;
  version: number;
}

interface UseLanguagesPreloadOptions {
  enabled?: boolean;
  priority?: boolean;
  cacheTime?: number;
  priorityLanguageCodes?: string[];
  filterCacheSize?: number;
}

interface UseLanguagesPreloadResult {
  languages: Language[];
  priorityLanguages: Language[];
  isLoading: boolean;
  isPriorityLoaded: boolean;
  error: Error | null;
  getFlagUrl: (countryCode: string) => string;
  getLanguageById: (id: number) => Language | undefined;
  getLanguageByCc: (cc: string | undefined) => Language | undefined;
  getLanguageByCode: (lc: string) => Language | undefined;
  filterLanguages: (query: string) => Language[];
  loadAllLanguages: () => Promise<void>;
}

const DEFAULT_PRIORITY_CODES = ['GB', 'DE', 'FR', 'ES', 'IT', 'SK', 'CZ', 'PL', 'RU', 'CN'];
const CACHE_VERSION = 2;

export const useLanguagesPreload = (options?: UseLanguagesPreloadOptions): UseLanguagesPreloadResult => {
  const {
    enabled = true,
    priority = true,
    cacheTime = 7 * 24 * 60 * 60 * 1000,
    priorityLanguageCodes = DEFAULT_PRIORITY_CODES,
    filterCacheSize = 100,
  } = options || {};

  const [languages, setLanguages] = useState<Language[]>([]);
  const [priorityLanguages, setPriorityLanguages] = useState<Language[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPriorityLoaded, setIsPriorityLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [filterCache, setFilterCache] = useState<Map<string, Language[]>>(new Map());

  const priorityLanguagesLoaded = useRef<boolean>(false);
  const allLanguagesLoaded = useRef<boolean>(false);
  const flagsPreloaded = useRef<Set<string>>(new Set());

  const [languagesCache, setLanguagesCache] = useLocalStorage<LanguageCacheData>('languages-cache', {
    languages: [],
    timestamp: 0,
    version: 0,
  });

  const isCacheValid = useMemo(() => {
    return (
      languagesCache.version === CACHE_VERSION &&
      languagesCache.languages?.length > 0 &&
      Date.now() - languagesCache.timestamp < cacheTime
    );
  }, [languagesCache, cacheTime]);

  const languageByIdMap = useMemo(() => {
    const map = new Map<number, Language>();
    languages.forEach(lang => map.set(lang.id, lang));
    return map;
  }, [languages]);

  const languageByCcMap = useMemo(() => {
    const map = new Map<string, Language>();
    languages.forEach(lang => map.set(lang.cc, lang));
    return map;
  }, [languages]);

  const languageByCodeMap = useMemo(() => {
    const map = new Map<string, Language>();
    languages.forEach(lang => map.set(lang.lc.toLowerCase(), lang));
    return map;
  }, [languages]);

  useEffect(() => {
    if (!enabled) return;

    if (isCacheValid) {
      const cachedLanguages = languagesCache.languages;
      const cachedPriorityLanguages = cachedLanguages.filter((lang: Language) =>
        priorityLanguageCodes.includes(lang.cc)
      );

      if (cachedPriorityLanguages.length > 0) {
        setPriorityLanguages(cachedPriorityLanguages);
        setIsPriorityLoaded(true);
        priorityLanguagesLoaded.current = true;
      }

      setLanguages(cachedPriorityLanguages.length > 0 ? cachedPriorityLanguages : cachedLanguages);
      setIsLoading(false);
    }
  }, [enabled, isCacheValid, languagesCache, priorityLanguageCodes]);

  const fetchPriorityLanguages = useCallback(async (): Promise<void> => {
    if (priorityLanguagesLoaded.current) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/geo/languages`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch languages: ${response.status}`);
      }

      const data = await response.json();
      
      // Just use the data directly as languages
      const allLanguages = Array.isArray(data) ? data : [];
      
      // Filter priority languages
      const priorityLangs = allLanguages.filter(lang => 
        priorityLanguageCodes.includes(lang.cc)
      );
      
      setPriorityLanguages(priorityLangs);
      setLanguages(allLanguages);
      setIsPriorityLoaded(true);
      priorityLanguagesLoaded.current = true;
      allLanguagesLoaded.current = true;

      // Cache the languages
      setLanguagesCache({
        languages: allLanguages,
        timestamp: Date.now(),
        version: CACHE_VERSION,
      });

      // Preload flags
      allLanguages.forEach(lang => preloadFlag(lang.cc));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error loading languages'));
      console.error('Error fetching languages:', err);
    } finally {
      setIsLoading(false);
    }
  }, [priorityLanguageCodes, setLanguagesCache]);

  const loadAllLanguages = useCallback(async (): Promise<void> => {
    if (allLanguagesLoaded.current) return;
    
    if (isCacheValid && languagesCache.languages?.length > 0) {
      setLanguages(languagesCache.languages);
      setPriorityLanguages(languagesCache.languages.filter(lang => 
        priorityLanguageCodes.includes(lang.cc)
      ));
      allLanguagesLoaded.current = true;
      return;
    }

    await fetchPriorityLanguages();
  }, [fetchPriorityLanguages, isCacheValid, languagesCache, priorityLanguageCodes]);

  const preloadFlag = useCallback((countryCode: string): void => {
    if (!countryCode || flagsPreloaded.current.has(countryCode)) return;

    const flagUrl = `/flags/4x3/optimized/${countryCode.toLowerCase()}.svg`;

    const img = new Image();
    img.onload = () => flagsPreloaded.current.add(countryCode);
    img.onerror = () => console.warn(`Failed to preload flag for ${countryCode}`);
    img.src = flagUrl;
  }, []);

  const getFlagUrl = useCallback((countryCode: string): string => {
    if (!countryCode) {
      return '/flags/4x3/optimized/gb.svg';
    }

    if (!flagsPreloaded.current.has(countryCode)) {
      preloadFlag(countryCode);
    }
    return `/flags/4x3/optimized/${countryCode.toLowerCase()}.svg`;
  }, [preloadFlag]);

  const getLanguageById = useCallback((id: number): Language | undefined => {
    return languageByIdMap.get(id);
  }, [languageByIdMap]);

  const getLanguageByCc = useCallback((cc: string | undefined): Language | undefined => {
    if (!cc) return undefined;
    return languageByCcMap.get(cc);
  }, [languageByCcMap]);

  const getLanguageByCode = useCallback((lc: string): Language | undefined => {
    if (!lc) return undefined;
    return languageByCodeMap.get(lc.toLowerCase());
  }, [languageByCodeMap]);

  const filterLanguages = useCallback((query: string): Language[] => {
    if (!query) return languages;

    const normalizedQuery = query.toLowerCase().trim();
    if (filterCache.has(normalizedQuery)) {
      return filterCache.get(normalizedQuery) || [];
    }

    const filtered = languages.filter(lang => {
      const matchesCode = lang.cc.toLowerCase().startsWith(normalizedQuery) ||
                         lang.lc.toLowerCase().startsWith(normalizedQuery);
      const matchesName =
        lang.name_en.toLowerCase().includes(normalizedQuery) ||
        (lang.name_sk && lang.name_sk.toLowerCase().includes(normalizedQuery)) ||
        lang.native_name.toLowerCase().includes(normalizedQuery);
      return matchesCode || matchesName;
    });

    setFilterCache(prev => {
      const newCache = new Map(prev);
      newCache.set(normalizedQuery, filtered);
      if (newCache.size > filterCacheSize) {
        const firstKey = Array.from(newCache.keys())[0];
        newCache.delete(firstKey);
      }
      return newCache;
    });

    return filtered;
  }, [languages, filterCache, filterCacheSize]);

  // Initialize on mount
  useEffect(() => {
    if (!enabled || !priority || isCacheValid || priorityLanguagesLoaded.current) return;
    fetchPriorityLanguages();
  }, [enabled, priority, fetchPriorityLanguages, isCacheValid]);

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
    loadAllLanguages,
  };
};

export default useLanguagesPreload;