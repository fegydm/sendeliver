// File: src/hooks/useLanguage.ts
// Last change: Removed dependency on /api/user endpoint and fixed language detection

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
const SUPPORTED_LANGUAGES = ['en', 'sk', 'cs', 'de', 'pl', 'hu']; // Add all supported languages
const COOKIE_NAME = 'sendeliver_lang';

export const useLanguage = (): LanguageHook => {
  // Use stored language or default
  const [currentLc, setCurrentLc] = useLocalStorage('sendeliver_language_primary', DEFAULT_LC);
  const [secondaryLc, setSecondaryLcState] = useLocalStorage<string | null>('sendeliver_language_secondary', DEFAULT_SECONDARY_LC);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [translationsEnabled, setTranslationsEnabled] = useState(false);

  // Validate the language code is supported
  const validateLanguage = useCallback((lc: string): string => {
    return SUPPORTED_LANGUAGES.includes(lc) ? lc : DEFAULT_LC;
  }, []);

  // Initialize translations only after we have determined the language
  const { t, isLoading, hasError } = useTranslationsPreload({
    primaryLc: validateLanguage(currentLc),
    secondaryLc: secondaryLc ? validateLanguage(secondaryLc) : null,
    enabled: translationsEnabled,
  });

  // Get language from cookie
  const getLanguageFromCookie = useCallback((): string | null => {
    if (!navigator.cookieEnabled) return null;
    
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${COOKIE_NAME}=`))
      ?.split('=')[1];
      
    return cookieValue || null;
  }, []);

  // Set language cookie
  const setLanguageCookie = useCallback((lc: string): void => {
    if (!navigator.cookieEnabled) return;
    document.cookie = `${COOKIE_NAME}=${lc}; path=/; max-age=31536000`; // 1 year
  }, []);

  // Determine initial language on component mount
  useEffect(() => {
    if (!isInitialLoad) return;

    const determineInitialLanguage = async () => {
      try {
        let primaryLc = DEFAULT_LC;
        let secLc: string | null = null;
        const hasCookies = navigator.cookieEnabled;

        // User group detection
        const isNonC = hasCookies && getLanguageFromCookie() !== null;
        
        // For now, we only have nonC and nonN users
        // In the future, there will be 'reg' users with API-based preferences
        
        if (isNonC) {
          // NonC - unregistered user with cookies
          const cookieLc = getLanguageFromCookie();
          if (cookieLc) {
            primaryLc = validateLanguage(cookieLc);
          }
        } else {
          // NonN - unregistered user without cookies or new visitor
          // Try to use browser language
          const browserLc = navigator.language.substring(0, 2).toLowerCase();
          if (SUPPORTED_LANGUAGES.includes(browserLc)) {
            primaryLc = browserLc;
          }
        }

        // Try to determine secondary language from IP location
        try {
          secLc = await getIPLocation();
          secLc = secLc ? validateLanguage(secLc) : null;
          
          // If same as primary, don't use secondary
          if (secLc === primaryLc) {
            secLc = null;
          }
        } catch (error) {
          console.error('[useLanguage] Error getting IP location:', error);
          secLc = null;
        }

        // Update state and set cookie if allowed
        setCurrentLc(primaryLc);
        setSecondaryLcState(secLc);
        
        if (hasCookies) {
          setLanguageCookie(primaryLc);
        }
        
        console.log(`[useLanguage] Language initialized: primary=${primaryLc}, secondary=${secLc || 'none'}`);
      } catch (error) {
        console.error('[useLanguage] Error in language initialization:', error);
        // Use defaults on error
        setCurrentLc(DEFAULT_LC);
        setSecondaryLcState(DEFAULT_SECONDARY_LC);
      } finally {
        setIsInitialLoad(false);
        // Always enable translations, even on error
        setTranslationsEnabled(true);
      }
    };

    determineInitialLanguage();
  }, [validateLanguage, setCurrentLc, setSecondaryLcState, isInitialLoad, getLanguageFromCookie, setLanguageCookie]);

  // Update document attributes when language changes
  useEffect(() => {
    if (!isInitialLoad) {
      document.documentElement.lang = currentLc;
      document.documentElement.dir = 'ltr'; // We don't support RTL languages yet
    }
  }, [currentLc, isInitialLoad]);

  // Debug log when translations are loaded
  useEffect(() => {
    if (!isLoading && translationsEnabled) {
      console.log(`[useLanguage] Translations loaded for: primary=${currentLc}, secondary=${secondaryLc || 'none'}`);
    }
  }, [isLoading, translationsEnabled, currentLc, secondaryLc]);

  // Function to change the current language
  const changeLanguage = useCallback(
    (lc: string) => {
      const validLc = validateLanguage(lc);
      
      if (validLc && validLc !== currentLc) {
        console.log(`[useLanguage] Changing language to: ${validLc}`);
        setCurrentLc(validLc);
        
        if (navigator.cookieEnabled) {
          setLanguageCookie(validLc);
        }
      }
    },
    [currentLc, setCurrentLc, validateLanguage, setLanguageCookie]
  );

  // Function to update secondary language
  const setSecondaryLc = useCallback(
    (lc: string | null) => {
      const validLc = lc ? validateLanguage(lc) : null;
      
      if (validLc !== secondaryLc && validLc !== currentLc) {
        console.log(`[useLanguage] Setting secondary language to: ${validLc || 'none'}`);
        setSecondaryLcState(validLc);
      }
    },
    [secondaryLc, currentLc, setSecondaryLcState, validateLanguage]
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