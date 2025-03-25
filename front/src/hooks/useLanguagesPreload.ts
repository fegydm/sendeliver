// File: src/hooks/useLanguagesPreload.ts
// Hook for accessing cached languages with filtering
import { useState, useEffect, useCallback } from 'react';
import countriesManager from '../utils/CountriesManager';
import type { Language } from '@/types/language.types';

export function useLanguagesPreload() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = countriesManager.subscribeLanguages(data => {
      setLanguages(data);
      setIsLoading(false);
    });
    countriesManager.getLanguages();
    return () => unsubscribe();
  }, []);

  const filterLanguages = useCallback((query: string) => {
    if (!query) return languages;
    const lowerQuery = query.toLowerCase();
    return languages.filter(l => 
      l.cc.toLowerCase().includes(lowerQuery) || 
      l.name_en.toLowerCase().includes(lowerQuery)
    );
  }, [languages]);

  return { languages, isLoading, filterLanguages, getFlagUrl: countriesManager.getFlagUrl };
}