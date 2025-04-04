// File: ./front/src/contexts/LanguageContext.tsx
// This context provides language settings and translations for the application.
// It loads the primary language from localStorage/cookies or navigator.language,
// resolves the secondary language via geolocation, and preloads translations.

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getCountryFromIP } from '@/utils/getCountryFromIP';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useTranslationsPreload } from '@/hooks/useTranslationsPreload';

export interface LanguageInfo {
  lc: string;
  cc: string;
  name_en: string;
  native_name: string;
  is_rtl: boolean;
}

interface LanguageContextType {
  t: (key: string) => string;
  primaryLanguage: string;
  currentLanguage: LanguageInfo; // Now as LanguageInfo object
  secondaryLanguage: string | null;
  changeLanguage: (lang: LanguageInfo) => void;
  setSecondaryLanguage: (langCode: string | null) => void;
  isLoading: boolean;
  error: string | null;
}

// Create context with default values.
const LanguageContext = createContext<LanguageContextType>({
  t: (key) => key,
  primaryLanguage: 'en',
  currentLanguage: { lc: 'en', cc: 'GB', name_en: 'English', native_name: 'English', is_rtl: false },
  secondaryLanguage: null,
  changeLanguage: () => {},
  setSecondaryLanguage: () => {},
  isLoading: false,
  error: null
});

// LocalStorage keys.
const LS_KEYS = {
  PRIMARY: 'preferred_language',
  SECONDARY: 'secondary_language'
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load primary language from LS (or from navigator.language).
  const [primaryLanguage, setPrimaryLanguage] = useLocalStorage<string>(
    LS_KEYS.PRIMARY,
    navigator.language.substring(0, 2) || 'en'
  );
  
  // Current language is stored as LanguageInfo. Initially, it's based on primaryLanguage.
  const [currentLanguage, setCurrentLanguage] = useState<LanguageInfo>(() => ({
    lc: primaryLanguage,
    cc: primaryLanguage === 'en' ? 'GB' : primaryLanguage.toUpperCase(),
    name_en: primaryLanguage,
    native_name: primaryLanguage,
    is_rtl: false
  }));
  
  // Secondary language from LS (or null).
  const [secondaryLanguage, setSecondaryLanguage] = useLocalStorage<string | null>(
    LS_KEYS.SECONDARY,
    null
  );
  
  // State to enable translations preload.
  const [translationsEnabled, setTranslationsEnabled] = useState<boolean>(false);

  // Preload translations using our hook.
  const { t, isLoading, hasError } = useTranslationsPreload({
    primaryLc: currentLanguage.lc,
    secondaryLc: secondaryLanguage,
    enabled: translationsEnabled
  });

  // Initialization function.
  const initLanguage = useCallback(async () => {
    // Try to read primary language from cookie.
    const cookieLang = (() => {
      if (navigator.cookieEnabled) {
        const cookie = document.cookie.split('; ').find(row => row.startsWith('sendeliver_lang='));
        return cookie ? cookie.split('=')[1] : null;
      }
      return null;
    })();
    const determinedPrimary = cookieLang || primaryLanguage || navigator.language.substring(0, 2) || 'en';
    // Persist primary language.
    setPrimaryLanguage(determinedPrimary);
    // Update current language object.
    setCurrentLanguage({
      lc: determinedPrimary,
      cc: determinedPrimary === 'en' ? 'GB' : determinedPrimary.toUpperCase(),
      name_en: determinedPrimary,
      native_name: determinedPrimary,
      is_rtl: false
    });
    if (navigator.cookieEnabled) {
      document.cookie = `sendeliver_lang=${determinedPrimary}; path=/; max-age=31536000`;
    }
    // Enable translations preload.
    setTranslationsEnabled(true);
    // Set document language.
    document.documentElement.lang = determinedPrimary;
    // Resolve secondary language if not set.
    if (!secondaryLanguage) {
      try {
        const sec = await getCountryFromIP();
        setSecondaryLanguage(sec);
      } catch (err) {
        console.error('[LanguageProvider] Failed to resolve secondary language:', err);
        setSecondaryLanguage(null);
      }
    }
  }, [primaryLanguage, secondaryLanguage, setPrimaryLanguage, setSecondaryLanguage]);

  useEffect(() => {
    initLanguage();
    // Run only once on mount.
  }, []);

  // Function to change current language.
  const changeLanguage = useCallback((lang: LanguageInfo) => {
    console.log(`[LanguageProvider] Changing language to: ${lang.lc}`);
    // Update primary language if needed.
    if (lang.lc !== primaryLanguage) {
      setPrimaryLanguage(lang.lc);
      if (navigator.cookieEnabled) {
        document.cookie = `sendeliver_lang=${lang.lc}; path=/; max-age=31536000`;
      }
      document.documentElement.lang = lang.lc;
    }
    setCurrentLanguage(lang);
  }, [primaryLanguage, setPrimaryLanguage]);

  const contextValue: LanguageContextType = {
    t,
    primaryLanguage,
    currentLanguage,
    secondaryLanguage,
    changeLanguage,
    setSecondaryLanguage,
    isLoading,
    error: hasError ? 'Error loading translations' : null,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context.
export const useLanguageContext = () => useContext(LanguageContext);

export default LanguageContext;
