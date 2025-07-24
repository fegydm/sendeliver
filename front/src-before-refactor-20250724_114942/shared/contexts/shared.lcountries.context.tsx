// File: src/shared/contexts/shared.lcountries.context.tsx
import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import type { Country } from "@/types/transport-forms.types";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const CACHE_KEY = 'countries-cache';
const EXPECTED_COUNT = 110;
const CACHE_VERSION = 1;
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

interface CountryCacheData {
  countries: Country[];
  timestamp: number;
  version: number;
}

// Create context with default values
const CountriesContext = createContext<{
  countries: Country[];
  isLoading: boolean;
  getFlagUrl: (cc: string) => string;
}>({
  countries: [],
  isLoading: true,
  getFlagUrl: () => "",
});

export const CountriesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State for countries and loading status
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // LocalStorage cache for countries
  const [cache, setCache] = useLocalStorage<CountryCacheData>(CACHE_KEY, {
    countries: [],
    timestamp: 0,
    version: 0,
  });

  // Check if the cache is valid based on version, count, and TTL
  const isCacheValid = useMemo(() => {
    return (
      cache.version === CACHE_VERSION &&
      cache.countries.length === EXPECTED_COUNT &&
      Date.now() - cache.timestamp < CACHE_TTL
    );
  }, [cache]);

  // Function to fetch countries from API or use cache
  const fetchCountries = useCallback(async () => {
    try {
      setIsLoading(true);

      // Use cache if valid
      if (isCacheValid) {
        setCountries(cache.countries);
        return;
      }

      // Fetch countries from API
      const res = await fetch('/api/geo/countries');
      const data: Country[] = await res.json();

      // Validate the fetched data
      if (!Array.isArray(data) || data.length !== EXPECTED_COUNT) {
        throw new Error("Unexpected country data");
      }

      // Update state and cache
      setCountries(data);
      setCache({
        countries: data,
        timestamp: Date.now(),
        version: CACHE_VERSION,
      });
    } catch (err) {
      console.error('[CountriesContext] Error fetching countries:', err);
      // Fallback to cache if available
      if (cache.countries.length > 0) {
        setCountries(cache.countries);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isCacheValid, cache, setCache]);

  // Load countries only once on mount
  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  // Function to get flag URL for a given country code
  const getFlagUrl = useCallback((cc: string): string => {
    if (!cc) return '/flags/4x3/optimized/placeholder.svg';
    return `/flags/4x3/optimized/${cc.toLowerCase()}.svg`;
  }, []);

  return (
    <CountriesContext.Provider value={{ countries, isLoading, getFlagUrl }}>
      {children}
    </CountriesContext.Provider>
  );
};

// Custom hook to use the CountriesContext
export const useCountriesContext = () => useContext(CountriesContext);

export default CountriesContext;
