// File: ./front/src/hooks/useLanguage.ts
// Last change: Refactored to use useTranslationsPreload hook

import { useCallback, useEffect, useState } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useTranslationsPreload } from './useTranslationsPreload';
import { getIPLocation } from '../utils/geo';

export interface LanguageHook {
  t: (key: string, defaultValue?: string) => string;
  currentLc: string;
  secondaryLc: string | null;
  changeLanguage: (lc: string) => void;
  setSecondaryLc: (lc: string | null) => void;
  isLoading: boolean;
  hasError: boolean;
}

const DEFAULT_LC = 'en';
const DEFAULT_SECONDARY_LC = null;

export const useLanguage = (): LanguageHook => {
  const [currentLc, setCurrentLc] = useLocalStorage('languagePrimary', DEFAULT_LC);
  const [secondaryLc, setSecondaryLcState] = useLocalStorage<string | null>('languageSecondary', DEFAULT_SECONDARY_LC);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const { t, isLoading, hasError } = useTranslationsPreload({
    primaryLc: currentLc,
    secondaryLc,
    enabled: true,
  });

  useEffect(() => {
    if (!isInitialLoad) return;

    const determineInitialLanguage = async () => {
      let primaryLc = DEFAULT_LC;
      let secLc: string | null = null;

      const cookieLc = document.cookie.split('; ').find(row => row.startsWith('lang='))?.split('=')[1];
      const hasCookies = navigator.cookieEnabled;

      const userResponse = await fetch('/api/user', { credentials: 'include' });
      if (userResponse.ok) {
        const user = await userResponse.json();
        primaryLc = user.language || DEFAULT_LC;
      } else if (hasCookies && cookieLc) {
        primaryLc = cookieLc;
      } else {
        primaryLc = DEFAULT_LC;
      }

      secLc = await getIPLocation();
      if (secLc === primaryLc) secLc = null;

      setCurrentLc(primaryLc);
      setSecondaryLcState(secLc);
      if (hasCookies) document.cookie = `lang=${primaryLc}; path=/; max-age=31536000`;
    };

    determineInitialLanguage();
    setIsInitialLoad(false);
  }, [setCurrentLc, setSecondaryLcState, isInitialLoad]);

  const changeLanguage = useCallback(
    (lc: string) => {
      if (lc && lc !== currentLc) {
        setCurrentLc(lc);
        if (navigator.cookieEnabled) document.cookie = `lang=${lc}; path=/; max-age=31536000`;
      }
    },
    [currentLc, setCurrentLc]
  );

  const setSecondaryLc = useCallback(
    (lc: string | null) => {
      if (lc !== secondaryLc && lc !== currentLc) {
        setSecondaryLcState(lc);
      }
    },
    [secondaryLc, currentLc, setSecondaryLcState]
  );

  return {
    t,
    currentLc,
    secondaryLc,
    changeLanguage,
    setSecondaryLc,
    isLoading,
    hasError,
  };
};

export default useLanguage;