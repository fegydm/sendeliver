// File: ./front/src/hooks/useLanguage.ts
// This hook manages language settings for the application.
// It reads the primary language from localStorage or cookie, sets current language,
// and uses getCountryFromIP to determine the secondary language (with caching).
// Comments in code are in English.

import { useEffect, useState, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useTranslationsPreload } from './useTranslationsPreload';
import { getCountryFromIP } from '../utils/getCountryFromIP';

const DEFAULT_LC = 'en';
const COOKIE_NAME = 'sendeliver_lang';

// Define a common Language interface.
export interface LanguageInfo {
  lc: string;
  cc: string;
  name_en: string;
  native_name: string;
  is_rtl: boolean;
}

export const useLanguage = () => {
  // Primary language stored in localStorage.
  const [primaryLc, setPrimaryLc] = useLocalStorage('sendeliver_language_primary', DEFAULT_LC);
  // Current language code state.
  const [currentLc, setCurrentLc] = useState<string>(primaryLc);
  // Full current language object.
  const [currentLanguage, setCurrentLanguage] = useState<LanguageInfo>({
    lc: currentLc,
    cc: "GB",
    name_en: "English",
    native_name: "English",
    is_rtl: false
  });
  // Secondary language stored in localStorage.
  const [secondaryLc, setSecondaryLc] = useLocalStorage<string | null>('sendeliver_language_secondary', null);
  const [translationsEnabled, setTranslationsEnabled] = useState(false);

  // Validate the input language code (ensure lowercase).
  const validate = (lc: string): string => {
    console.log(`[useLanguage:validate] Input lc: "${lc}"`);
    if (!lc || typeof lc !== 'string') {
      console.log(`[useLanguage:validate] Invalid input, returning DEFAULT_LC: "${DEFAULT_LC}"`);
      return DEFAULT_LC;
    }
    const result = lc.trim().toLowerCase();
    console.log(`[useLanguage:validate] Validated lc: "${result}"`);
    return result || DEFAULT_LC;
  };

  // Get language code from cookie.
  const getLanguageFromCookie = (): string | null => {
    if (!navigator.cookieEnabled) return null;
    const cookie = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${COOKIE_NAME}=`))
      ?.split('=')[1] || null;
    console.log(`[useLanguage:getLanguageFromCookie] Cookie value: "${cookie}"`);
    return cookie;
  };

  // Set language code to cookie.
  const setLanguageCookie = (lc: string): void => {
    if (!navigator.cookieEnabled) return;
    console.log(`[useLanguage:setLanguageCookie] Setting cookie: "${lc}"`);
    document.cookie = `${COOKIE_NAME}=${lc}; path=/; max-age=31536000`; // 1 year
  };

  // Initialization function to set primary and secondary languages.
  const initLanguage = useCallback(async () => {
    console.log('[useLanguage:init] Initializing language settings');
    let lc = getLanguageFromCookie() || navigator.language?.substring(0, 2) || DEFAULT_LC;
    console.log(`[useLanguage:init] Initial lc: "${lc}"`);
    lc = validate(lc);
    console.log(`[useLanguage:init] Setting primaryLc: "${lc}"`);
    setPrimaryLc(lc);
    setCurrentLc(lc);
    setCurrentLanguage({
      lc,
      cc: lc === 'en' ? 'GB' : lc.toUpperCase(),
      name_en: lc,
      native_name: lc,
      is_rtl: false
    });
    setLanguageCookie(lc);
    
    // Fetch secondary language using our utility function which handles caching.
    const secLc = await getCountryFromIP();
    console.log(`[useLanguage:init] Setting secondaryLc: "${secLc}"`);
    setSecondaryLc(secLc || null);
    
    setTranslationsEnabled(true);
    document.documentElement.lang = lc;
  }, [setPrimaryLc, setCurrentLc, setCurrentLanguage, setLanguageCookie, setSecondaryLc]);

  // Run initialization once on mount.
  useEffect(() => {
    initLanguage();
  }, [initLanguage]);

  // Load translations; if a key is missing, the key itself will be shown.
  const { t, isLoading, hasError } = useTranslationsPreload({
    primaryLc,
    secondaryLc,
    enabled: translationsEnabled,
  });

  // Change language: accepts a full language object.
  const changeLanguage = useCallback((lang: LanguageInfo) => {
    console.log(`[useLanguage:changeLanguage] Requested language change to: ${lang.lc}`);
    const valid = validate(lang.lc);
    console.log(`[useLanguage:changeLanguage] Validated language: "${valid}", current primary: "${primaryLc}"`);
    
    if (valid !== primaryLc) {
      console.log(`[useLanguage:changeLanguage] Updating primary language to: "${valid}"`);
      setPrimaryLc(valid);
      setLanguageCookie(valid);
      document.documentElement.lang = valid;
    }
    setCurrentLc(valid);
    setCurrentLanguage(lang);
    console.log(`[useLanguage:changeLanguage] Updated current language to: "${valid}"`);
  }, [primaryLc, setPrimaryLc]);

  return {
    t,
    currentLc,         // Simple language code for basic use.
    currentLanguage,   // Full language object for advanced use.
    secondaryLc,
    changeLanguage,
    setSecondaryLc,
    isLoading,
    hasError,
  };
};

export default useLanguage;
