// ✅ File: src/hooks/useLanguage.ts

import { useState, useEffect, useCallback } from 'react';
import { getIPLocation } from '@/utils/geo';

interface LanguageTranslation {
  [key: string]: string;
}

type TranslationsCache = {
  current: LanguageTranslation;
  secondary: LanguageTranslation;
  english: LanguageTranslation;
};

export function useLanguage() {
  const [currentLanguageCode, setCurrentLanguageCode] = useState<string>(
    () => localStorage.getItem('preferredLanguage') || 'en'
  );

  const [secondaryLanguageCode, setSecondaryLanguageCode] = useState<string | null>(
    () => localStorage.getItem('secondaryLanguage') || null
  );

  const [translations, setTranslations] = useState<TranslationsCache>({
    current: {},
    secondary: {},
    english: {}
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTranslations = useCallback(async (langCode: string): Promise<LanguageTranslation> => {
    try {
      const response = await fetch(`/api/geo/translations/${langCode}`);
      if (!response.ok) throw new Error(`Failed to fetch translations for language ${langCode}`);
      return await response.json();
    } catch (error) {
      console.error(`[useLanguage] Error fetching translations for '${langCode}':`, error);
      return {};
    }
  }, []);

  useEffect(() => {
    const loadTranslations = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const primary = currentLanguageCode;
        const secondary = secondaryLanguageCode || await getIPLocation();

        const [primaryData, secondaryData] = await Promise.all([
          fetchTranslations(primary),
          fetchTranslations(secondary)
        ]);

        const fallback = primary === 'en' ? primaryData : await fetchTranslations('en');

        setTranslations({
          current: primaryData,
          secondary: secondaryData,
          english: fallback
        });

        localStorage.setItem('preferredLanguage', primary);
        if (secondary) {
          localStorage.setItem('secondaryLanguage', secondary);
        } else {
          localStorage.removeItem('secondaryLanguage');
        }
      } catch (err) {
        console.error('[useLanguage] Failed to load translations:', err);
        setError('Translation load failed');
      } finally {
        setIsLoading(false);
      }
    };

    loadTranslations();
  }, [currentLanguageCode, secondaryLanguageCode, fetchTranslations]);

  const t = useCallback((key: string): string => {
    return (
      translations.current[key] ||
      translations.secondary[key] ||
      translations.english[key] ||
      key
    );
  }, [translations]);

  const changeLanguage = useCallback((langCode: string) => {
    if (langCode === secondaryLanguageCode) {
      setCurrentLanguageCode(langCode);
      setSecondaryLanguageCode(currentLanguageCode);
    } else {
      setCurrentLanguageCode(langCode);
    }
  }, [currentLanguageCode, secondaryLanguageCode]);

  const setSecondaryLanguage = useCallback((langCode: string | null) => {
    if (langCode === currentLanguageCode) return;
    setSecondaryLanguageCode(langCode);
  }, [currentLanguageCode]);

  return {
    t,
    currentLanguageCode,
    secondaryLanguageCode,
    changeLanguage,
    setSecondaryLanguage,
    isLoading,
    error
  };
}

export default useLanguage;
