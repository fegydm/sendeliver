// File: src/contexts/TranslationContext.tsx
// Last change: Jednoduché riešenie bez statických prekladov

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useTranslationsPreload } from '@/hooks/useTranslationsPreload';

export interface LanguageInfo {
  lc: string;
  cc: string;
  name_en: string;
  native_name: string;
  is_rtl: boolean;
}

interface TranslationContextType {
  t: (key: string) => string;
  primaryLanguage: string;
  currentLanguage: LanguageInfo;
  secondaryLanguage: string | null;
  changeLanguage: (lang: LanguageInfo) => void;
  setSecondaryLanguage: (langCode: string | null) => void;
  isLoading: boolean;
  error: string | null;
}

const TranslationContext = createContext<TranslationContextType>({
  t: (key) => key,
  primaryLanguage: 'en',
  currentLanguage: { lc: 'en', cc: 'GB', name_en: 'English', native_name: 'English', is_rtl: false },
  secondaryLanguage: null,
  changeLanguage: () => {},
  setSecondaryLanguage: () => {},
  isLoading: false,
  error: null
});

const LS_KEYS = {
  PRIMARY: 'preferred_language',
  SECONDARY: 'secondary_language'
};

// Podporované jazyky
const SUPPORTED_LANGUAGES = ['en', 'sk', 'cs', 'de', 'pl', 'hu'];

// Mapovanie jazykových kódov na informácie o krajinách
const LANGUAGE_INFO: Record<string, Omit<LanguageInfo, 'lc'>> = {
  'en': { cc: 'GB', name_en: 'English', native_name: 'English', is_rtl: false },
  'sk': { cc: 'SK', name_en: 'Slovak', native_name: 'Slovenčina', is_rtl: false },
  'cs': { cc: 'CZ', name_en: 'Czech', native_name: 'Čeština', is_rtl: false },
  'de': { cc: 'DE', name_en: 'German', native_name: 'Deutsch', is_rtl: false },
  'pl': { cc: 'PL', name_en: 'Polish', native_name: 'Polski', is_rtl: false },
  'hu': { cc: 'HU', name_en: 'Hungarian', native_name: 'Magyar', is_rtl: false }
};

export const TranslationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Inicializácia stavov
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Získať počiatočný jazyk z localStorage, navigator.language alebo predvolený 'en'
  const getInitialLanguage = (): string => {
    const storedLang = localStorage.getItem(LS_KEYS.PRIMARY);
    if (storedLang && SUPPORTED_LANGUAGES.includes(storedLang)) {
      return storedLang;
    }
    
    const browserLang = navigator.language?.substring(0, 2);
    if (browserLang && SUPPORTED_LANGUAGES.includes(browserLang)) {
      return browserLang;
    }
    
    return 'en';
  };

  // Inicializácia lokálnych úložísk
  const [primaryLanguage, setPrimaryLanguage] = useLocalStorage<string>(
    LS_KEYS.PRIMARY,
    getInitialLanguage()
  );
  
  const [secondaryLanguage, setSecondaryLanguage] = useLocalStorage<string | null>(
    LS_KEYS.SECONDARY,
    null
  );
  
  // Kontrola primárneho jazyka
  const validPrimaryLc = SUPPORTED_LANGUAGES.includes(primaryLanguage) ? primaryLanguage : 'en';
  
  // Vytvorenie currentLanguage objektu
  const [currentLanguage, setCurrentLanguage] = useState<LanguageInfo>(() => {
    const lc = validPrimaryLc;
    const info = LANGUAGE_INFO[lc] || LANGUAGE_INFO['en'];
    return { lc, ...info };
  });

  // Použitie hooku pre preklady
  const { t, isLoading, hasError } = useTranslationsPreload({
    primaryLc: currentLanguage.lc,
    secondaryLc: secondaryLanguage,
    enabled: true
  });

  // Inicializácia nastavení dokumentu - len raz
  useEffect(() => {
    if (isInitialized) return;
    
    // Nastavenie jazyka dokumentu
    document.documentElement.lang = validPrimaryLc;
    
    // Nastavenie cookie pre jazyk
    if (navigator.cookieEnabled) {
      document.cookie = `sendeliver_lang=${validPrimaryLc}; path=/; max-age=31536000`;
    }
    
    setIsInitialized(true);
  }, [validPrimaryLc, isInitialized]);

  // Funkcia na zmenu jazyka
  const changeLanguage = useCallback((lang: LanguageInfo) => {
    // Kontrola, či je jazyk podporovaný
    if (!SUPPORTED_LANGUAGES.includes(lang.lc)) {
      console.warn("[TranslationContext] Unsupported language:", lang.lc);
      return;
    }
    
    // Aktualizácia primárneho jazyka v localStorage, ak je to potrebné
    if (lang.lc !== primaryLanguage) {
      setPrimaryLanguage(lang.lc);
      
      // Aktualizácia cookie
      if (navigator.cookieEnabled) {
        document.cookie = `sendeliver_lang=${lang.lc}; path=/; max-age=31536000`;
      }
      
      // Aktualizácia jazyka dokumentu
      document.documentElement.lang = lang.lc;
    }
    
    // Aktualizácia currentLanguage stavu
    setCurrentLanguage(lang);
  }, [primaryLanguage, setPrimaryLanguage]);

  return (
    <TranslationContext.Provider
      value={{
        t,
        primaryLanguage: validPrimaryLc,
        currentLanguage,
        secondaryLanguage,
        changeLanguage,
        setSecondaryLanguage,
        isLoading,
        error: hasError ? 'Error loading translations' : null,
      }}
    >
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslationContext = () => useContext(TranslationContext);

export default TranslationContext;