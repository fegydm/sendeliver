// File: ./front/src/hooks/useCountriesPreload.ts
// Last change: Reverted to functional update for setFlagCache with updated useLocalStorage

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { Country } from '@/types/transport-forms.types';

interface CountryCacheData {
  countries: Country[];
  timestamp: number;
  version: number;
}

interface FlagCacheData {
  dataUrl: string; // base64 encoded SVG
  timestamp: number;
}

export function useCountriesPreload(enabled: boolean = true) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastQuery, setLastQuery] = useState<string>('');
  const [filteredResults, setFilteredResults] = useState<Country[]>([]);

  const CACHE_VERSION = 1;
  const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days
  const FLAG_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days for flags
  const [countriesCache, setCountriesCache] = useLocalStorage<CountryCacheData>('countries-cache', {
    countries: [],
    timestamp: 0,
    version: 0,
  });
  const [flagCache, setFlagCache] = useLocalStorage<Record<string, FlagCacheData>>('flag-cache', {});

  const isCacheValid = useMemo(() => {
    return (
      countriesCache.version === CACHE_VERSION &&
      countriesCache.countries?.length > 0 &&
      Date.now() - countriesCache.timestamp < CACHE_TTL
    );
  }, [countriesCache]);

  // Fetch and cache flag as base64
  const fetchFlag = useCallback(async (cc: string): Promise<string> => {
    const cacheKey = `flag_${cc.toLowerCase()}`;
    const cachedFlag = flagCache[cacheKey];

    if (cachedFlag && Date.now() - cachedFlag.timestamp < FLAG_TTL) {
      return cachedFlag.dataUrl;
    }

    try {
      const response = await fetch(`/flags/4x3/optimized/${cc.toLowerCase()}.svg`);
      if (!response.ok) throw new Error(`Failed to fetch flag for ${cc}`);
      const svgText = await response.text();
      const dataUrl = `data:image/svg+xml;base64,${btoa(svgText)}`;
      
      setFlagCache((prev: Record<string, FlagCacheData>) => ({
        ...prev,
        [cacheKey]: { dataUrl, timestamp: Date.now() },
      }));
      return dataUrl;
    } catch (err) {
      console.error(`[FlagFetch] Error fetching flag for ${cc}:`, err);
      return '/flags/4x3/optimized/gb.svg'; // Fallback to gb.svg
    }
  }, [flagCache, setFlagCache]);

  const fetchCountries = useCallback(async () => {
    try {
      setIsLoading(true);

      if (isCacheValid) {
        setCountries(countriesCache.countries);
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/geo/countries');
      if (!response.ok) throw new Error(`Failed to fetch countries: ${response.status}`);

      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('Invalid country data format from API');

      const mappedCountries: Country[] = await Promise.all(
        data.map(async (item: any) => {
          const cc = item.cc || '';
          return {
            cc,
            name_en: item.name_en || 'Unknown',
            name_local: item.name_local || item.name_en || 'Unknown',
            name_sk: item.name_sk || '',
            logistics_priority: item.logistics_priority || 0,
            code_3: item.code_3,
            flag: await fetchFlag(cc), // Cache flag as base64
          };
        })
      );

      setCountries(mappedCountries);
      setCountriesCache({
        countries: mappedCountries,
        timestamp: Date.now(),
        version: CACHE_VERSION,
      });
    } catch (err) {
      console.error('[CountriesPreload] Error fetching countries:', err);
      if (countriesCache.countries.length > 0) {
        setCountries(countriesCache.countries);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isCacheValid, countriesCache, setCountriesCache, fetchFlag]);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }
    const timerId = setTimeout(() => fetchCountries(), 0);
    return () => clearTimeout(timerId);
  }, [enabled, fetchCountries]);

  const filterCountries = useCallback(
    (query: string): Country[] => {
      if (!query) {
        setLastQuery('');
        setFilteredResults([]);
        return countries;
      }

      if (query === lastQuery && filteredResults.length > 0) {
        return filteredResults;
      }

      const upperQuery = query.toUpperCase();
      const filtered = countries.filter(c =>
        c.cc.startsWith(upperQuery) || c.name_en.toUpperCase().includes(upperQuery)
      );

      setLastQuery(query);
      setFilteredResults(filtered);
      return filtered;
    },
    [countries, lastQuery, filteredResults]
  );

  const getFlagUrl = useCallback((code: string): string => {
    if (!code) return '/flags/4x3/optimized/gb.svg'; // Immediate gb.svg as mock
    const cacheKey = `flag_${code.toLowerCase()}`;
    const cachedFlag = flagCache[cacheKey];
    return cachedFlag && Date.now() - cachedFlag.timestamp < FLAG_TTL 
      ? cachedFlag.dataUrl 
      : `/flags/4x3/optimized/${code.toLowerCase()}.svg`; // Fallback to direct path
  }, [flagCache]);

  const priorityCountries = ['DE', 'FR', 'IT', 'GB', 'ES', 'PL', 'NL', 'BE', 'AT', 'CZ', 'SK', 'HU'];

  const sortedCountries = useMemo(() => {
    return [...countries].sort((a, b) => {
      const aIndex = priorityCountries.indexOf(a.cc);
      const bIndex = priorityCountries.indexOf(b.cc);
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return a.name_en.localeCompare(b.name_en);
    });
  }, [countries]);

  return {
    countries: sortedCountries,
    isLoading,
    filterCountries,
    getFlagUrl,
  };
}

export default useCountriesPreload;