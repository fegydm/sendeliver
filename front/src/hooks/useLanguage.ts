// File: ./front/src/hooks/useLanguage.ts
// Last change: Refactored to use useTranslationsPreload hook

import { useCallback, useMemo } from 'react';
import { useLocalStorage } from "./useLocalStorage";
import { useLanguagesPreload } from './useLanguagesPreload';
import { useTranslationsPreload } from './useTranslationsPreload';

export interface LanguageHook {
  t: (key: string, defaultValue?: string) => string;
  currentLanguageId: number;
  secondaryLanguageId: number | null;
  currentLanguageCode: string;
  secondaryLanguageCode: string | null;
  setCurrentLanguageId: (id: number) => void;
  setCurrentLanguageCode: (code: string) => void;
  setSecondaryLanguageId: (id: number | null) => void;
  setSecondaryLanguageCode: (code: string | null) => void;
  changeLanguage: (codeOrId: string | number) => void;
  isLoading: boolean;
  hasError: boolean;
}

const DEFAULT_LANGUAGE_ID = 1; // English
const FALLBACK_LANGUAGE_ID = 1; // English as fallback

export const useLanguage = (): LanguageHook => {
  const [currentLanguageId, setCurrentLanguageIdState] = useLocalStorage('languagePrimary', DEFAULT_LANGUAGE_ID);
  const [secondaryLanguageId, setSecondaryLanguageIdState] = useLocalStorage<number | null>('languageSecondary', null);
  
  // Get languages information
  const { 
    getLanguageById,
    getLanguageByCode,
    isPriorityLoaded
  } = useLanguagesPreload({
    priority: true
  });

  // Use the new translations preload hook
  const { 
    t: translateFn, 
    isLoading, 
    error: translationsError 
  } = useTranslationsPreload({
    primaryLanguageId: currentLanguageId,
    secondaryLanguageId: secondaryLanguageId || FALLBACK_LANGUAGE_ID,
    enabled: isPriorityLoaded
  });

  const currentLanguageCode = useMemo(() => {
    const lang = getLanguageById(currentLanguageId);
    return lang?.cc || 'GB';
  }, [currentLanguageId, getLanguageById]);
  
  const secondaryLanguageCode = useMemo(() => {
    if (!secondaryLanguageId) return null;
    const lang = getLanguageById(secondaryLanguageId);
    return lang?.cc || null;
  }, [secondaryLanguageId, getLanguageById]);

  // Custom translation function that handles default value
  const t = useCallback((key: string, defaultValue?: string): string => {
    return translateFn(key, defaultValue);
  }, [translateFn]);

  const setCurrentLanguageId = useCallback((id: number) => {
    if (id === secondaryLanguageId) {
      setSecondaryLanguageIdState(currentLanguageId);
    }
    setCurrentLanguageIdState(id);
  }, [currentLanguageId, secondaryLanguageId, setCurrentLanguageIdState, setSecondaryLanguageIdState]);

  const setCurrentLanguageCode = useCallback((code: string) => {
    if (!code) return;
    
    const language = getLanguageByCode(code);
    if (language) {
      setCurrentLanguageId(language.id);
    }
  }, [getLanguageByCode, setCurrentLanguageId]);

  const setSecondaryLanguageId = useCallback((id: number | null) => {
    if (id !== null && id === currentLanguageId) {
      return;
    }
    setSecondaryLanguageIdState(id);
  }, [currentLanguageId, setSecondaryLanguageIdState]);
  
  const setSecondaryLanguageCode = useCallback((code: string | null) => {
    if (!code) {
      setSecondaryLanguageId(null);
      return;
    }
    
    const language = getLanguageByCode(code);
    if (language) {
      setSecondaryLanguageId(language.id);
    }
  }, [getLanguageByCode, setSecondaryLanguageId]);
  
  const changeLanguage = useCallback((codeOrId: string | number) => {
    if (typeof codeOrId === 'number') {
      setCurrentLanguageId(codeOrId);
    } else if (typeof codeOrId === 'string' && codeOrId) {
      const language = getLanguageByCode(codeOrId);
      if (language) {
        setCurrentLanguageId(language.id);
      }
    }
  }, [getLanguageByCode, setCurrentLanguageId]);

  return {
    t,
    currentLanguageId,
    secondaryLanguageId,
    currentLanguageCode,
    secondaryLanguageCode,
    setCurrentLanguageId,
    setCurrentLanguageCode,
    setSecondaryLanguageId,
    setSecondaryLanguageCode,
    changeLanguage,
    isLoading,
    hasError: !!translationsError
  };
};

export default useLanguage;