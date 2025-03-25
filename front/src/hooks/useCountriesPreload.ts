/* File: .front/src/hooks/useCountriesPreload.ts */
/* Hook for fast access to countries data using CountriesManager */

import { useState, useEffect, useCallback } from 'react';
import countriesManager from '../utils/CountriesManager';
import type { Country } from '@/types/transport-forms.types';

export function useCountriesPreload() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔄 useCountriesPreload hook mounted');
    
    // Subscribe to countries updates
    const unsubscribe = countriesManager.subscribe(data => {
      console.log(`📥 Received countries update in hook: ${data.length} countries`);
      setCountries(data);
      setIsLoading(false);
    });
    
    // Trigger countries loading if needed
    countriesManager.getCountries()
      .then(data => {
        console.log(`✅ Countries loaded in hook: ${data.length}`);
        setError(null);
      })
      .catch(err => {
        console.error('❌ Error loading countries in hook:', err);
        setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        setIsLoading(false);
      });
    
    // Cleanup subscription on unmount
    return () => {
      console.log('🧹 Cleaning up useCountriesPreload hook');
      unsubscribe();
    };
  }, []);

  // Filter countries by query (code or name)
  const filterCountries = useCallback((query: string): Country[] => {
    if (!query) {
      return countries;
    }
    
    const upperQuery = query.toUpperCase();
    
    // First search by country code (exact match)
    const codeMatches = countries.filter(country => 
      country.cc?.startsWith(upperQuery)
    );
    
    // Then search by name (includes)
    const nameMatches = countries.filter(country => 
      country.name_en?.toUpperCase().includes(upperQuery) && 
      !codeMatches.includes(country)
    );
    
    // Return code matches first (more specific), then name matches
    return [...codeMatches, ...nameMatches];
  }, [countries]);

  // Force refresh countries data
  const refreshCountries = useCallback(async () => {
    setIsLoading(true);
    try {
      // Force a new fetch
      const freshData = await countriesManager.getCountries();
      setCountries(freshData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    countries,
    isLoading,
    error,
    filterCountries,
    refreshCountries
  };
}

export default useCountriesPreload;