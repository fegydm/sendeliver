// File: ./front/src/hooks/useCountriesPreload.ts
// Last change: Added getFlagUrl for flag integration with dropdown components

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { Country } from '@/types/transport-forms.types';

const CACHE_KEY = 'countries-cache';
const EXPECTED_COUNT = 110;
const CACHE_VERSION = 1;
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

interface CountryCacheData {
  countries: Country[];
  timestamp: number;
  version: number;
}

// Returns the local flag path for a given country code
function getFlagUrl(cc: string): string {
  if (!cc) return '/flags/4x3/optimized/placeholder.svg';
  return `/flags/4x3/optimized/${cc.toLowerCase()}.svg`;
}

export function useCountriesPreload() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [cache, setCache] = useLocalStorage<CountryCacheData>(CACHE_KEY, {
    countries: [],
    timestamp: 0,
    version: 0,
  });

  const isCacheValid = useMemo(() => {
    return (
      cache.version === CACHE_VERSION &&
      cache.countries.length === EXPECTED_COUNT &&
      Date.now() - cache.timestamp < CACHE_TTL
    );
  }, [cache]);

  const fetchCountries = useCallback(async () => {
    try {
      setIsLoading(true);

      if (isCacheValid) {
        setCountries(cache.countries);
        return;
      }

      const res = await fetch('/api/geo/countries');
      const data: Country[] = await res.json();

      if (!Array.isArray(data) || data.length !== EXPECTED_COUNT) {
        throw new Error('Unexpected country data');
      }

      setCountries(data);
      setCache({
        countries: data,
        timestamp: Date.now(),
        version: CACHE_VERSION,
      });
    } catch (err) {
      console.error('[useCountriesPreload] Error:', err);
      // fallback to whatever is cached
      if (cache.countries.length > 0) {
        setCountries(cache.countries);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isCacheValid, cache, setCache]);

  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  return {
    countries,
    isLoading,
    reload: fetchCountries,
    getFlagUrl, // ✅ make this available to CountrySelect
  };
}
