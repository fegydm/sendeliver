// File: src/hooks/optimizedLanguagesPreload.ts
// Last change: Added optimized hook for language data with better caching and filtering

import { useState, useEffect, useCallback, useMemo } from 'react';
import optimizedCountriesManager from '../utils/OptimizedCountriesManager';
import type { Language } from '@/types/language.types';

/**
 * Enhanced hook for working with languages data
 * Features similar to useCountriesPreload but specialized for languages
 */
export function useLanguagesPreload(enabled: boolean = true) {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastQuery, setLastQuery] = useState<string>('');
  const [filteredResults, setFilteredResults] = useState<Language[]>([]);

  // Subscribe to language updates from the manager
  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Set initial loading state
    const hasLanguagesInMemory = optimizedCountriesManager['languages']?.length > 0;
    setIsLoading(!hasLanguagesInMemory);

    // Subscribe to updates
    const unsubscribe = optimizedCountriesManager.subscribeLanguages(data => {
      setLanguages(data);
      setIsLoading(false);
      
      // Re-apply last filter when languages update
      if (lastQuery) {
        const upperQuery = lastQuery.toUpperCase();
        const filtered = data.filter(lang => 
          lang.lc.toUpperCase().startsWith(upperQuery) || 
          lang.name_en.toUpperCase().includes(upperQuery) ||
          (lang.native_name && lang.native_name.toUpperCase().includes(upperQuery))
        );
        setFilteredResults(filtered);
      }
    });

    // Fetch languages if they aren't already in memory
    if (!hasLanguagesInMemory) {
      // Use a small timeout to avoid blocking the UI when component mounts
      const timerId = setTimeout(() => {
        optimizedCountriesManager.getLanguages()
          .catch(err => console.error('[LanguagesPreload] Error fetching languages:', err));
      }, 0);
      
      return () => {
        clearTimeout(timerId);
        unsubscribe();
      };
    }

    return unsubscribe;
  }, [enabled, lastQuery]);

  // Filter languages by query with memoization
  const filterLanguages = useCallback((query: string): Language[] => {
    if (!query) {
      setLastQuery('');
      setFilteredResults([]);
      return languages;
    }

    // Use cached results if the query hasn't changed
    if (query === lastQuery && filteredResults.length > 0) {
      return filteredResults;
    }

    // Filter languages
    const upperQuery = query.toUpperCase();
    const filtered = languages.filter(lang => 
      lang.lc.toUpperCase().startsWith(upperQuery) || 
      lang.name_en.toUpperCase().includes(upperQuery) ||
      (lang.native_name && lang.native_name.toUpperCase().includes(upperQuery))
    );

    // Cache the results
    setLastQuery(query);
    setFilteredResults(filtered);
    return filtered;
  }, [languages, lastQuery, filteredResults]);

  // Efficiently generate flag URL for languages
  const getFlagUrl = useCallback((code: string): string => {
    return optimizedCountriesManager.getFlagUrl(code);
  }, []);

  // Memoize sorted languages - popular at top, then alphabetical
  const sortedLanguages = useMemo(() => {
    const popularCodes = ['en', 'de', 'fr', 'es', 'it', 'ru', 'zh', 'ja', 'ar', 'pt', 'sk', 'cs', 'pl', 'hu'];
    
    return [...languages].sort((a, b) => {
      // Sort by popular languages first
      const aIndex = popularCodes.indexOf(a.lc);
      const bIndex = popularCodes.indexOf(b.lc);
      
      if (aIndex >= 0 && bIndex >= 0) {
        return aIndex - bIndex;
      } else if (aIndex >= 0) {
        return -1;
      } else if (bIndex >= 0) {
        return 1;
      }
      
      // Then sort alphabetically by English name
      return a.name_en.localeCompare(b.name_en);
    });
  }, [languages]);

  return { 
    languages: sortedLanguages, 
    isLoading, 
    filterLanguages,
    getFlagUrl
  };
}

export default useLanguagesPreload;