// File: src/contexts/LanguagesContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { Language, GroupedLanguage } from '@/types/domains/language.types';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const CACHE_KEY = 'languages-cache';
const EXPECTED_COUNT = 100;
const CACHE_VERSION = 1;
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

// Define cache data structure for languages
interface LanguageCacheData {
  languages: Language[];
  timestamp: number;
  version: number;
}

// Define context type for languages
interface LanguagesContextType {
  languages: Language[];
  isLoading: boolean;
  error: Error | null;
  reload: () => Promise<void>;
  groupLanguagesByPriority: (primaryLc: string, secondaryLc: string | null, tertiaryLc: string | null) => {
      priorityLanguages: GroupedLanguage[];
      otherLanguages: GroupedLanguage[];
  };
  filterLanguages: (searchTerm: string) => Language[];
  getFlagUrl: (cc: string) => string;
}

// Create context with default values
const LanguagesContext = createContext<LanguagesContextType>({
  languages: [],
  isLoading: true,
  error: null,
  reload: async () => {},
  groupLanguagesByPriority: () => ({ priorityLanguages: [], otherLanguages: [] }),
  filterLanguages: () => [],
  getFlagUrl: () => '',
});

export const LanguagesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State for languages, loading status, and error
  const [languages, setLanguages] = useState<Language[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Use local storage for caching languages
  const [cache, setCache] = useLocalStorage<LanguageCacheData>(CACHE_KEY, {
    languages: [],
    timestamp: 0,
    version: 0,
  });

  // Check if the cache is valid (version, expected count, and TTL)
  const isCacheValid = useMemo(() => {
    const valid = (
      cache.version === CACHE_VERSION &&
      cache.languages.length >= EXPECTED_COUNT &&
      Date.now() - cache.timestamp < CACHE_TTL
    );
    console.log("[LanguagesContext] Cache valid:", valid, "Cache timestamp:", cache.timestamp);
    return valid;
  }, [cache]);

  // Function to fetch languages from API or use cache if valid
  const fetchLanguages = useCallback(async () => {
    try {
      console.log("[LanguagesContext] Starting fetchLanguages");
      setIsLoading(true);
      setError(null);

      // If cache is valid, use cached languages
      if (isCacheValid) {
        console.log("[LanguagesContext] Using valid cache", cache.languages);
        setLanguages(cache.languages);
        return;
      }

      // Fetch languages from API endpoint
      console.log("[LanguagesContext] Fetching from API /api/geo/languages");
      const response = await fetch('/api/geo/languages');
      console.log("[LanguagesContext] API response:", response);
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const data = await response.json();
      console.log("[LanguagesContext] Data fetched:", data);
      if (!Array.isArray(data)) throw new Error('Invalid language data format');

      // Update state and local storage cache
      setLanguages(data);
      setCache({
        languages: data,
        timestamp: Date.now(),
        version: CACHE_VERSION,
      });
      console.log("[LanguagesContext] Cache updated with new data");
    } catch (err) {
      console.error("[LanguagesContext] Error:", err);
      setError(err instanceof Error ? err : new Error("Unknown error"));
      // Fallback to cached languages if available
      if (cache.languages.length > 0) {
        console.log("[LanguagesContext] Falling back to cached languages", cache.languages);
        setLanguages(cache.languages);
      }
    } finally {
      setIsLoading(false);
      console.log("[LanguagesContext] fetchLanguages finished, isLoading:", false);
    }
  }, [isCacheValid, cache, setCache]);

  // Load languages only once on mount
  useEffect(() => {
    console.log("[LanguagesContext] useEffect - calling fetchLanguages");
    fetchLanguages();
  }, [fetchLanguages]);

  // Function to get flag URL for a given country code
  const getFlagUrl = useCallback((cc: string): string => {
    if (!cc) return '/flags/4x3/optimized/placeholder.svg';
    return `/flags/4x3/optimized/${cc.toLowerCase()}.svg`;
  }, []);

  // Function to group languages by priority
  const groupLanguagesByPriority = useCallback(
    (primaryLc: string, secondaryLc: string | null, tertiaryLc: string | null) => {
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

      // Sort priority languages based on defined order
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

      console.log("[LanguagesContext] groupLanguagesByPriority result:", { priorityLanguages, otherLanguages });
      return {
        priorityLanguages,
        otherLanguages,
      };
    },
    [languages]
  );

  // Function to filter languages by a search term
  const filterLanguages = useCallback(
    (searchTerm: string) => {
      if (!searchTerm.trim()) return languages;
      const lowerSearchTerm = searchTerm.toLowerCase();
      const filtered = languages.filter(
        lang =>
          lang.lc.toLowerCase().includes(lowerSearchTerm) ||
          lang.name_en.toLowerCase().includes(lowerSearchTerm) ||
          lang.native_name.toLowerCase().includes(lowerSearchTerm)
      );
      console.log("[LanguagesContext] filterLanguages result for", searchTerm, ":", filtered);
      return filtered;
    },
    [languages]
  );

  return (
    <LanguagesContext.Provider
      value={{
        languages,
        isLoading,
        error,
        reload: fetchLanguages,
        groupLanguagesByPriority,
        filterLanguages,
        getFlagUrl,
      }}
    >
      {children}
    </LanguagesContext.Provider>
  );
};

// Custom hook to use the LanguagesContext
export const useLanguagesContext = () => useContext(LanguagesContext);

export default LanguagesContext;
