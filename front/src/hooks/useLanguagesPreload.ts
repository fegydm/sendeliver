// File: ./front/src/hooks/useLanguagesPreload.ts
// Last change: Updated to use correct Language properties from language.types.ts

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { Language, GroupedLanguage } from '@/types/language.types';

const CACHE_KEY = 'languages-cache';
const EXPECTED_COUNT = 100;
const CACHE_VERSION = 1;
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

interface LanguageCacheData {
  languages: Language[];
  timestamp: number;
  version: number;
}

// Get flag URL for a country code
function getFlagUrl(cc: string): string {
  if (!cc) return '/flags/4x3/optimized/placeholder.svg';
  return `/flags/4x3/optimized/${cc.toLowerCase()}.svg`;
}

export function useLanguagesPreload() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [cache, setCache] = useLocalStorage<LanguageCacheData>(CACHE_KEY, {
    languages: [],
    timestamp: 0,
    version: 0
  });

  const isCacheValid = useMemo(() => {
    return (
      cache.version === CACHE_VERSION &&
      cache.languages.length >= EXPECTED_COUNT &&
      Date.now() - cache.timestamp < CACHE_TTL
    );
  }, [cache]);

  const fetchLanguages = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (isCacheValid) {
        setLanguages(cache.languages);
        return;
      }

      const response = await fetch('/api/geo/languages');
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('Invalid language data format');

      setLanguages(data);
      setCache({
        languages: data,
        timestamp: Date.now(),
        version: CACHE_VERSION
      });
    } catch (err) {
      console.error('[useLanguagesPreload] Error:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      
      // Fallback to cache if available
      if (cache.languages.length > 0) {
        setLanguages(cache.languages);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isCacheValid, cache, setCache]);

  useEffect(() => {
    fetchLanguages();
  }, [fetchLanguages]);

  // Group languages by priority (primary, secondary, tertiary and others)
  const groupLanguagesByPriority = useCallback((primaryLc: string, secondaryLc: string | null, tertiaryLc: string | null) => {
    const priorityLanguages: GroupedLanguage[] = [];
    const otherLanguages: GroupedLanguage[] = [];

    languages.forEach(lang => {
      const groupedLang = { ...lang } as GroupedLanguage;
      
      if (lang.lc === primaryLc) {
        groupedLang.group = 'primary';
        priorityLanguages.push(groupedLang);
      } else if (lang.lc === secondaryLc) {
        groupedLang.group = 'secondary';
        priorityLanguages.push(groupedLang);
      } else if (lang.lc === tertiaryLc) {
        groupedLang.group = 'recent';
        priorityLanguages.push(groupedLang);
      } else {
        groupedLang.group = 'other';
        otherLanguages.push(groupedLang);
      }
    });

    // Sort priority languages
    priorityLanguages.sort((a, b) => {
      if (a.lc === primaryLc) return -1;
      if (b.lc === primaryLc) return 1;
      if (a.lc === secondaryLc) return -1;
      if (b.lc === secondaryLc) return 1;
      if (a.lc === tertiaryLc) return -1;
      if (b.lc === tertiaryLc) return 1;
      return 0;
    });

    // Sort other languages alphabetically
    otherLanguages.sort((a, b) => a.name_en.localeCompare(b.name_en));

    return {
      priorityLanguages,
      otherLanguages
    };
  }, [languages]);

  // Filter languages by search term
  const filterLanguages = useCallback((searchTerm: string) => {
    if (!searchTerm.trim()) return languages;

    const lowerSearchTerm = searchTerm.toLowerCase();
    return languages.filter(lang => 
      lang.lc.toLowerCase().includes(lowerSearchTerm) ||
      lang.name_en.toLowerCase().includes(lowerSearchTerm) || 
      lang.native_name.toLowerCase().includes(lowerSearchTerm)
    );
  }, [languages]);

  return {
    languages,
    isLoading,
    error,
    reload: fetchLanguages,
    groupLanguagesByPriority,
    filterLanguages,
    getFlagUrl
  };
}

export default useLanguagesPreload;