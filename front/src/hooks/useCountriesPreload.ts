// File: src/hooks/useCountriesPreload.ts
// Last change: Simplified and optimized with separate flag management

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useFlagManager } from './useFlagManager';
import type { Country } from '@/types/transport-forms.types';

interface CountryCacheData {
  countries: Country[];
  timestamp: number;
  version: number;
}

interface UseCountriesOptions {
  enabled?: boolean;
  cacheTTL?: number;
}

// Priority countries for European focus
const PRIORITY_COUNTRIES = ['DE', 'FR', 'IT', 'GB', 'ES', 'PL', 'NL', 'BE', 'AT', 'CZ', 'SK', 'HU'];
const CACHE_VERSION = 1;
const DEFAULT_CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

export function useCountriesPreload(options?: UseCountriesOptions) {
  const { 
    enabled = true,
    cacheTTL = DEFAULT_CACHE_TTL 
  } = options || {};

  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastQuery, setLastQuery] = useState<string>('');
  const [filteredResults, setFilteredResults] = useState<Country[]>([]);

  // Use separate flag management
  const { getFlagUrl, preloadFlags, preloadAllFlags } = useFlagManager({
    priorityCodes: PRIORITY_COUNTRIES
  });

  // Country cache in localStorage
  const [countriesCache, setCountriesCache] = useLocalStorage<CountryCacheData>('countries-cache', {
    countries: [],
    timestamp: 0,
    version: 0,
  });

  // Check if cache is valid
  const isCacheValid = useMemo(() => {
    return (
      countriesCache.version === CACHE_VERSION &&
      countriesCache.countries?.length > 0 &&
      Date.now() - countriesCache.timestamp < cacheTTL
    );
  }, [countriesCache, cacheTTL]);

  // Fetch countries with timeout and error handling
  const fetchCountries = useCallback(async () => {
    if (!enabled) return;
    
    try {
      setIsLoading(true);
      setError(null);

      // Use cache if available and valid
      if (isCacheValid) {
        setCountries(countriesCache.countries);
        setIsLoading(false);
        
        // Preload flags for all countries in the background
        const countryCodes = countriesCache.countries.map(c => c.cc);
        preloadAllFlags(countryCodes);
        return;
      }

      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

      const response = await fetch('/api/geo/countries', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch countries: ${response.status}`);
      }

      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid country data format from API');
      }

      // Simplified mapping without waiting for flag loading
      const mappedCountries: Country[] = data.map((item: any) => ({
        cc: item.cc || '',
        name_en: item.name_en || 'Unknown',
        name_local: item.name_local || item.name_en || 'Unknown',
        name_sk: item.name_sk || '',
        logistics_priority: item.logistics_priority || 0,
        code_3: item.code_3 || '',
        flag: getFlagUrl(item.cc) // Just use the URL, don't fetch
      }));

      // Preload flags for priority countries immediately
      const priorityCodes = mappedCountries
        .filter(c => PRIORITY_COUNTRIES.includes(c.cc))
        .map(c => c.cc);
      
      preloadFlags(priorityCodes);
      
      // Preload all other flags in the background with delay
      const allCodes = mappedCountries.map(c => c.cc);
      preloadAllFlags(allCodes);

      setCountries(mappedCountries);
      
      // Save to cache
      setCountriesCache({
        countries: mappedCountries,
        timestamp: Date.now(),
        version: CACHE_VERSION,
      });
    } catch (err) {
      console.error('[CountriesPreload] Error fetching countries:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch countries'));
      
      // Try to use cache even if it's expired
      if (countriesCache.countries.length > 0) {
        console.log('[CountriesPreload] Using expired cache after fetch error');
        setCountries(countriesCache.countries);
      }
    } finally {
      setIsLoading(false);
    }
  }, [enabled, isCacheValid, countriesCache, setCountriesCache, getFlagUrl, preloadFlags, preloadAllFlags]);

  // Fetch countries on mount
  useEffect(() => {
    if (enabled) {
      fetchCountries();
    }
  }, [enabled, fetchCountries]);

  // Filter countries (with memoization for repeated queries)
  const filterCountries = useCallback(
    (query: string): Country[] => {
      if (!query) {
        setLastQuery('');
        setFilteredResults([]);
        return countries;
      }

      // Return cached results for repeated queries
      if (query === lastQuery && filteredResults.length > 0) {
        return filteredResults;
      }

      const upperQuery = query.toUpperCase();
      const filtered = countries.filter(c =>
        c.cc.startsWith(upperQuery) || 
        c.name_en.toUpperCase().includes(upperQuery) ||
        (c.name_local && c.name_local.toUpperCase().includes(upperQuery))
      );

      setLastQuery(query);
      setFilteredResults(filtered);
      return filtered;
    },
    [countries, lastQuery, filteredResults]
  );

  // Sort countries with priority countries first, then alphabetically
  const sortedCountries = useMemo(() => {
    return [...countries].sort((a, b) => {
      const aIndex = PRIORITY_COUNTRIES.indexOf(a.cc);
      const bIndex = PRIORITY_COUNTRIES.indexOf(b.cc);
      
      // Both are priority countries - sort by priority index
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      
      // Only a is priority
      if (aIndex !== -1) return -1;
      
      // Only b is priority
      if (bIndex !== -1) return 1;
      
      // Neither is priority - sort alphabetically
      return a.name_en.localeCompare(b.name_en);
    });
  }, [countries]);

  return {
    countries: sortedCountries,
    isLoading,
    error,
    filterCountries,
    getFlagUrl,
    reload: fetchCountries
  };
}

export default useCountriesPreload;