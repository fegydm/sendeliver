// File: src/hooks/useCountriesPreload.ts
// Hook for accessing cached countries with filtering
import { useState, useEffect, useCallback } from 'react';
import countriesManager from '../utils/CountriesManager';
import type { Country } from '@/types/transport-forms.types';

export function useCountriesPreload() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = countriesManager.subscribeCountries(data => {
      setCountries(data);
      setIsLoading(false);
    });
    countriesManager.getCountries();
    return () => unsubscribe();
  }, []);

  const filterCountries = useCallback((query: string) => {
    if (!query) return countries;
    const upperQuery = query.toUpperCase();
    return countries.filter(c => 
      c.cc.startsWith(upperQuery) || c.name_en.toUpperCase().includes(upperQuery)
    );
  }, [countries]);

  return { countries, isLoading, filterCountries };
}