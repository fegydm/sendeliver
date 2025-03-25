/* File: src/hooks/useLanguagesPreload.ts */
/* Simplified hook for loading languages with minimal performance impact */

import { useState, useEffect, useCallback } from 'react';
import type { Language } from '@/types/language.types';

// Default languages for immediate use
const DEFAULT_LANGUAGES: Language[] = [
  { code: "en", name_en: "English", native_name: "English", is_rtl: false, flag_url: "/flags/4x3/optimized/gb.svg" },
  { code: "sk", name_en: "Slovak", native_name: "Slovenčina", is_rtl: false, flag_url: "/flags/4x3/optimized/sk.svg" }
];

export function useLanguagesPreload() {
  const [languages, setLanguages] = useState<Language[]>(DEFAULT_LANGUAGES);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load languages from API - only when explicitly called
  const loadLanguages = useCallback(async (): Promise<Language[]> => {
    console.log('Loading languages...'); // Debug log
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/languages');
      console.log('API response:', response.status); // Debug log
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Languages loaded:', data.length); // Debug log
      
      // More debugging
      if (!Array.isArray(data)) {
        console.error('API returned non-array:', data);
        return DEFAULT_LANGUAGES;
      }
      
      if (data.length === 0) {
        console.warn('API returned empty array');
        return DEFAULT_LANGUAGES;
      }
      
      setLanguages(data);
      return data;
    } catch (err) {
      console.error('Error loading languages:', err);
      return DEFAULT_LANGUAGES;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Filter languages by query (code or name)
  const filterLanguages = useCallback((query: string): Language[] => {
    if (!query) {
      return languages;
    }
    
    const lowerQuery = query.toLowerCase();
    
    return languages.filter(lang => 
      lang.code.toLowerCase().includes(lowerQuery) || 
      lang.name_en.toLowerCase().includes(lowerQuery) || 
      lang.native_name.toLowerCase().includes(lowerQuery)
    );
  }, [languages]);
  
  // Set up local storage for previously loaded languages
  useEffect(() => {
    // Try to load from localStorage on initial mount
    try {
      const storedData = localStorage.getItem('languages_cache');
      
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        
        if (Array.isArray(parsedData) && parsedData.length > DEFAULT_LANGUAGES.length) {
          console.log(`Using ${parsedData.length} languages from localStorage`);
          setLanguages(parsedData);
          setIsInitialized(true);
        }
      }
    } catch (err) {
      console.warn('Failed to load languages from localStorage:', err);
    }
  }, []);
  
  // Save to localStorage when languages are loaded
  useEffect(() => {
    if (isInitialized && languages.length > DEFAULT_LANGUAGES.length) {
      try {
        localStorage.setItem('languages_cache', JSON.stringify(languages));
      } catch (err) {
        console.warn('Failed to save languages to localStorage:', err);
      }
    }
  }, [isInitialized, languages]);

  return {
    languages,
    isLoading,
    error,
    loadLanguages,
    filterLanguages,
    isInitialized
  };
}

export default useLanguagesPreload;