// File: ./front/src/hooks/useTranslationsPreload.ts
// Last change: Initial implementation of translations preload hook

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';

interface Translation {
  key: string;
  text: string;
  namespace?: string;
}

interface TranslationCache {
  [languageId: number]: {
    translations: Translation[];
    timestamp: number;
  };
}

interface UseTranslationsPreloadOptions {
  enabled?: boolean;
  cacheTime?: number;
  primaryLanguageId?: number;
  secondaryLanguageId?: number;
  namespaces?: string[];
}

interface UseTranslationsPreloadResult {
  translations: Record<string, string>;
  isLoading: boolean;
  error: Error | null;
  t: (key: string, fallback?: string) => string;
  reload: () => Promise<void>;
}

const DEFAULT_CACHE_TIME = 24 * 60 * 60 * 1000; // 24 hours

export const useTranslationsPreload = (options?: UseTranslationsPreloadOptions): UseTranslationsPreloadResult => {
  const {
    enabled = true,
    cacheTime = DEFAULT_CACHE_TIME,
    primaryLanguageId,
    secondaryLanguageId,
    namespaces,
  } = options || {};

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [translations, setTranslations] = useState<Record<string, string>>({});

  const [translationsCache, setTranslationsCache] = useLocalStorage<TranslationCache>('translations-cache', {});
  const translationsLoaded = useRef<boolean>(false);

  // Check if we have valid cache for the current language
  const isCacheValid = useCallback((languageId: number): boolean => {
    if (!translationsCache[languageId]) return false;
    
    return (
      !!translationsCache[languageId].translations &&
      translationsCache[languageId].translations.length > 0 &&
      Date.now() - translationsCache[languageId].timestamp < cacheTime
    );
  }, [translationsCache, cacheTime]);

  // Fetch translations for a specific language
  const fetchTranslations = useCallback(async (languageId: number): Promise<Translation[]> => {
    try {
      // Check cache first
      if (isCacheValid(languageId)) {
        console.log(`[TranslationsPreload] Using cached translations for language ${languageId}`);
        return translationsCache[languageId].translations;
      }

      console.log(`[TranslationsPreload] Fetching translations for language ${languageId}`);
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('languageId', languageId.toString());
      
      // Add namespaces if specified
      if (namespaces && namespaces.length > 0) {
        namespaces.forEach(ns => params.append('namespace', ns));
      }
      
      const response = await fetch(`/api/geo/translations/${languageId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch translations: ${response.status}`);
      }

      const data = await response.json();
      const fetchedTranslations = Array.isArray(data) ? data : [];
      
      console.log(`[TranslationsPreload] Fetched ${fetchedTranslations.length} translations for language ${languageId}`);
      
      // Update cache
      setTranslationsCache(prev => ({
        ...prev,
        [languageId]: {
          translations: fetchedTranslations,
          timestamp: Date.now(),
        }
      }));
      
      return fetchedTranslations;
    } catch (err) {
      console.error(`Error fetching translations for language ${languageId}:`, err);
      // Return empty array on error
      return [];
    }
  }, [isCacheValid, namespaces, translationsCache, setTranslationsCache]);

  // Load translations for primary and secondary languages
  const loadTranslations = useCallback(async (): Promise<void> => {
    if (!primaryLanguageId) {
      console.warn('[TranslationsPreload] No primary language ID provided');
      return;
    }
    
    if (translationsLoaded.current) {
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log(`[TranslationsPreload] Loading translations for languages: primary=${primaryLanguageId}, secondary=${secondaryLanguageId}`);
      
      // Fetch primary language translations
      const primaryTranslations = await fetchTranslations(primaryLanguageId);
      
      // Fetch secondary language translations if provided
      const secondaryTranslations = secondaryLanguageId ? 
        await fetchTranslations(secondaryLanguageId) : [];

      // Convert to dictionary format with fallback
      const translationMap: Record<string, string> = {};
      
      // First add secondary translations as fallback
      secondaryTranslations.forEach(item => {
        translationMap[item.key] = item.text;
      });
      
      // Then override with primary translations
      primaryTranslations.forEach(item => {
        translationMap[item.key] = item.text;
      });
      
      console.log(`[TranslationsPreload] Processed ${Object.keys(translationMap).length} translations`);
      
      setTranslations(translationMap);
      translationsLoaded.current = true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error loading translations');
      setError(error);
      console.error('Error loading translations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [primaryLanguageId, secondaryLanguageId, fetchTranslations]);

  // Initialize translations on mount or when language IDs change
  useEffect(() => {
    if (!enabled || !primaryLanguageId) return;
    
    // Reset loaded state when language changes
    if (translationsLoaded.current && (
        !translationsCache[primaryLanguageId] || 
        (secondaryLanguageId && !translationsCache[secondaryLanguageId])
    )) {
      translationsLoaded.current = false;
    }
    
    loadTranslations();
  }, [enabled, primaryLanguageId, secondaryLanguageId, loadTranslations, translationsCache]);

  // Translation function that gets a value by key with optional fallback
  const t = useCallback((key: string, fallback?: string): string => {
    if (!key) return fallback || '';
    
    return translations[key] || fallback || key;
  }, [translations]);

  // Force reload translations
  const reload = useCallback(async (): Promise<void> => {
    translationsLoaded.current = false;
    await loadTranslations();
  }, [loadTranslations]);

  return {
    translations,
    isLoading,
    error,
    t,
    reload,
  };
};

export default useTranslationsPreload;