// File: src/hooks/optimizedCountriesPreload.ts
// Last change: Fixed TypeScript error with Country type not having priority property

import { useState, useEffect, useCallback, useMemo } from 'react';
import optimizedCountriesManager from '../utils/OptimizedCountriesManager';
import type { Country } from '@/types/transport-forms.types';

/**
 * Enhanced hook for working with countries data
 * Features:
 * - Lazy loading with enabled parameter
 * - Cached filtering for better performance
 * - Subscribes to country manager updates
 * - Fast flag URL generation
 */
export function useCountriesPreload(enabled: boolean = true) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastQuery, setLastQuery] = useState<string>('');
  const [filteredResults, setFilteredResults] = useState<Country[]>([]);

  // Subscribe to country updates from the manager
  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Set initial loading state
    const hasCountriesInMemory = optimizedCountriesManager['countries']?.length > 0;
    setIsLoading(!hasCountriesInMemory);

    // Subscribe to updates
    const unsubscribe = optimizedCountriesManager.subscribeCountries(data => {
      setCountries(data);
      setIsLoading(false);
      
      // Re-apply last filter when countries update
      if (lastQuery) {
        const upperQuery = lastQuery.toUpperCase();
        const filtered = data.filter(c => 
          c.cc.startsWith(upperQuery) || 
          c.name_en.toUpperCase().includes(upperQuery)
        );
        setFilteredResults(filtered);
      }
    });

    // Fetch countries if they aren't already in memory
    if (!hasCountriesInMemory) {
      // Use a small timeout to avoid blocking the UI when component mounts
      const timerId = setTimeout(() => {
        optimizedCountriesManager.getCountries()
          .catch(err => console.error('[CountriesPreload] Error fetching countries:', err));
      }, 0);
      
      return () => {
        clearTimeout(timerId);
        unsubscribe();
      };
    }

    return unsubscribe;
  }, [enabled, lastQuery]);

  // Filter countries by query with memoization
  const filterCountries = useCallback((query: string): Country[] => {
    if (!query) {
      setLastQuery('');
      setFilteredResults([]);
      return countries;
    }

    // Use cached results if the query hasn't changed
    if (query === lastQuery && filteredResults.length > 0) {
      return filteredResults;
    }

    // Filter countries
    const upperQuery = query.toUpperCase();
    const filtered = countries.filter(c => 
      c.cc.startsWith(upperQuery) || 
      c.name_en.toUpperCase().includes(upperQuery)
    );

    // Cache the results
    setLastQuery(query);
    setFilteredResults(filtered);
    return filtered;
  }, [countries, lastQuery, filteredResults]);

  // Efficiently generate flag URL
  const getFlagUrl = useCallback((code: string): string => {
    return optimizedCountriesManager.getFlagUrl(code);
  }, []);

  // Popular countries to prioritize in sorting (can adjust these codes as needed)
  const priorityCountries = ['DE', 'FR', 'IT', 'GB', 'ES', 'PL', 'NL', 'BE', 'AT', 'CZ', 'SK', 'HU'];

  // Memoize sorted countries with priority countries first
  const sortedCountries = useMemo(() => {
    return [...countries].sort((a, b) => {
      // First prioritize specific countries
      const aIndex = priorityCountries.indexOf(a.cc);
      const bIndex = priorityCountries.indexOf(b.cc);
      
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex; // Both in priority list, sort by position
      } else if (aIndex !== -1) {
        return -1; // A is priority, comes first
      } else if (bIndex !== -1) {
        return 1; // B is priority, comes first
      }
      
      // Then sort by logistics_priority if available
      const aLogisticsPriority = (a as any).logistics_priority;
      const bLogisticsPriority = (b as any).logistics_priority;
      
      if (typeof aLogisticsPriority === 'number' && typeof bLogisticsPriority === 'number') {
        if (aLogisticsPriority !== bLogisticsPriority) {
          return bLogisticsPriority - aLogisticsPriority; // Higher priority first
        }
      }
      
      // Finally sort alphabetically by name
      return a.name_en.localeCompare(b.name_en);
    });
  }, [countries, priorityCountries]);

  return { 
    countries: sortedCountries, 
    isLoading, 
    filterCountries,
    getFlagUrl
  };
}

export default useCountriesPreload;