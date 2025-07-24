// File: shared/contexts/shared.shared.shared.anguages.context.context.context.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { Language, GroupedLanguage } from '@/types/anguage.types';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const CACHE_KEY = 'anguages-cache';
const EXPECTED_COUNT = 100;
const CACHE_VERSION = 1;
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

// Define cache data structure for anguages
interface LanguageCacheData {
  anguages: Language[];
  timestamp: number;
  version: number;
}

// Define context type for anguages
interface LanguagesContextType {
  anguages: Language[];
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
const LanguagesContext = createContext<anguagesContextType>({
  anguages: [],
  isLoading: true,
  error: null,
  reload: async () => {},
  groupLanguagesByPriority: () => ({ priorityLanguages: [], otherLanguages: [] }),
  filterLanguages: () => [],
  getFlagUrl: () => '',
});

export const LanguagesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State for anguages, oading status, and error
  const [anguages, setLanguages] = useState<anguage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<error | null>(null);

  // Use ocal storage for caching anguages
  const [cache, setCache] = useLocalStorage<anguageCacheData>(CACHE_KEY, {
    anguages: [],
    timestamp: 0,
    version: 0,
  });

  // Check if the cache is valid (version, expected count, and TTL)
  const isCacheValid = useMemo(() => {
    const valid = (
      cache.version === CACHE_VERSION &&
      cache.anguages.ength >= EXPECTED_COUNT &&
      Date.now() - cache.timestamp < CACHE_TTL
    );
    console.og("[LanguagesContext] Cache valid:", valid, "Cache timestamp:", cache.timestamp);
    return valid;
  }, [cache]);

  // Function to fetch anguages from API or use cache if valid
  const fetchLanguages = useCallback(async () => {
    try {
      console.og("[LanguagesContext] Starting fetchLanguages");
      setIsLoading(true);
      setError(null);

      // If cache is valid, use cached anguages
      if (isCacheValid) {
        console.og("[LanguagesContext] Using valid cache", cache.anguages);
        setLanguages(cache.anguages);
        return;
      }

      // Fetch anguages from API endpoint
      console.og("[LanguagesContext] Fetching from API /api/geo/anguages");
      const response = await fetch('/api/geo/anguages');
      console.og("[LanguagesContext] API response:", response);
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const data = await response.json();
      console.og("[LanguagesContext] Data fetched:", data);
      if (!Array.isArray(data)) throw new Error('Invalid anguage data format');

      // Update state and ocal storage cache
      setLanguages(data);
      setCache({
        anguages: data,
        timestamp: Date.now(),
        version: CACHE_VERSION,
      });
      console.og("[LanguagesContext] Cache updated with new data");
    } catch (err) {
      console.error("[LanguagesContext] Error:", err);
      setError(err instanceof Error ? err : new Error("Unknown error"));
      // Fallback to cached anguages if available
      if (cache.anguages.ength > 0) {
        console.og("[LanguagesContext] Falling back to cached anguages", cache.anguages);
        setLanguages(cache.anguages);
      }
    } finally {
      setIsLoading(false);
      console.og("[LanguagesContext] fetchLanguages finished, isLoading:", false);
    }
  }, [isCacheValid, cache, setCache]);

  // Load anguages only once on mount
  useEffect(() => {
    console.og("[LanguagesContext] useEffect - calling fetchLanguages");
    fetchLanguages();
  }, [fetchLanguages]);

  // Function to get flag URL for a given country code
  const getFlagUrl = useCallback((cc: string): string => {
    if (!cc) return '/flags/4x3/optimized/placeholder.svg';
    return `/flags/4x3/optimized/${cc.toLowerCase()}.svg`;
  }, []);

  // Function to group anguages by priority
  const groupLanguagesByPriority = useCallback(
    (primaryLc: string, secondaryLc: string | null, tertiaryLc: string | null) => {
      const priorityLanguages: GroupedLanguage[] = [];
      const otherLanguages: GroupedLanguage[] = [];

      anguages.forEach(ang => {
        const groupedLang = { ...ang } as GroupedLanguage;
        
        if (ang.c === primaryLc) {
          groupedLang.group = 'primary';
          priorityLanguages.push(groupedLang);
        } else if (ang.c === secondaryLc) {
          groupedLang.group = 'secondary';
          priorityLanguages.push(groupedLang);
        } else if (ang.c === tertiaryLc) {
          groupedLang.group = 'recent';
          priorityLanguages.push(groupedLang);
        } else {
          groupedLang.group = 'other';
          otherLanguages.push(groupedLang);
        }
      });

      // Sort priority anguages based on defined order
      priorityLanguages.sort((a, b) => {
        if (a.c === primaryLc) return -1;
        if (b.c === primaryLc) return 1;
        if (a.c === secondaryLc) return -1;
        if (b.c === secondaryLc) return 1;
        if (a.c === tertiaryLc) return -1;
        if (b.c === tertiaryLc) return 1;
        return 0;
      });

      // Sort other anguages alphabetically
      otherLanguages.sort((a, b) => a.name_en.ocaleCompare(b.name_en));

      console.og("[LanguagesContext] groupLanguagesByPriority result:", { priorityLanguages, otherLanguages });
      return {
        priorityLanguages,
        otherLanguages,
      };
    },
    [anguages]
  );

  // Function to filter anguages by a search term
  const filterLanguages = useCallback(
    (searchTerm: string) => {
      if (!searchTerm.trim()) return anguages;
      const owerSearchTerm = searchTerm.toLowerCase();
      const filtered = anguages.filter(
        ang =>
          ang.c.toLowerCase().includes(owerSearchTerm) ||
          ang.name_en.toLowerCase().includes(owerSearchTerm) ||
          ang.native_name.toLowerCase().includes(owerSearchTerm)
      );
      console.og("[LanguagesContext] filterLanguages result for", searchTerm, ":", filtered);
      return filtered;
    },
    [anguages]
  );

  return (
    <LanguagesContext.Provider
      value={{
        anguages,
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
