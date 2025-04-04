// File: ./front/src/hooks/useLanguage.ts
// Last change: Optimized for immediate language loading

import { useEffect, useState, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useTranslationsPreload } from './useTranslationsPreload';
import { getCountryFromIP } from '../utils/getCountryFromIP';

const DEFAULT_LC = 'en';
const COOKIE_NAME = 'sendeliver_lang';

const GEO_CACHE_KEY = 'ip-country-cache';
const FAIL_COUNT_KEY = 'ip-country-fail-count';
const GEO_CACHE_TTL = 14 * 24 * 60 * 60 * 1000; // 14 days

export const useLanguage = () => {
  const [primaryLc, setPrimaryLc] = useLocalStorage('sendeliver_language_primary', DEFAULT_LC);
  const [secondaryLc, setSecondaryLc] = useLocalStorage<string | null>('sendeliver_language_secondary', null);
  const [geoCache, setGeoCache] = useLocalStorage<{ code: string; timestamp: number } | null>(GEO_CACHE_KEY, null);
  const [failCount, setFailCount] = useLocalStorage<number>(FAIL_COUNT_KEY, 0);
  const [translationsEnabled, setTranslationsEnabled] = useState(false);

  // Basic validation to ensure we have a valid language code
  const validate = (lc: string): string => {
    if (!lc) return DEFAULT_LC;
    return lc.toLowerCase().trim();
  };

  const getLanguageFromCookie = (): string | null => {
    if (!navigator.cookieEnabled) return null;
    return document.cookie
      .split('; ')
      .find(row => row.startsWith(`${COOKIE_NAME}=`))
      ?.split('=')[1] || null;
  };

  const setLanguageCookie = (lc: string): void => {
    if (!navigator.cookieEnabled) return;
    document.cookie = `${COOKIE_NAME}=${lc}; path=/; max-age=31536000`; // 1 year
  };

  const fetchSecondaryFromGeo = useCallback(async () => {
    const now = Date.now();

    if (geoCache && now - geoCache.timestamp < GEO_CACHE_TTL) {
      console.log('[useLanguage] ✅ Cached secondary language:', geoCache.code);
      return validate(geoCache.code);
    }

    try {
      const countryCode = await getCountryFromIP();
      const validated = validate(countryCode);

      console.log('[useLanguage] 🌍 Fetched geo country:', validated);

      setGeoCache({ code: validated, timestamp: now });
      setFailCount(0); // reset fail count on success

      return validated !== primaryLc ? validated : null;
    } catch (err) {
      const newFailCount = failCount + 1;
      console.warn(`[useLanguage] ❌ Geo fetch failed (attempt ${newFailCount})`);
      setFailCount(newFailCount);

      if (newFailCount >= 3) {
        console.warn('[useLanguage] ⛔ Writing fallback "en" to geo cache');
        setGeoCache({ code: 'en', timestamp: now });
        return DEFAULT_LC;
      }

      return null;
    }
  }, [geoCache, primaryLc, failCount, setGeoCache, setFailCount]);

  // Get translations with our preload hook
  const { 
    t, 
    isLoading, 
    hasError, 
    loadTranslations, 
    loadedLanguages 
  } = useTranslationsPreload({
    primaryLc,
    secondaryLc,
    enabled: translationsEnabled,
  });

  // Initialize languages
  useEffect(() => {
    const init = async () => {
      let lc = getLanguageFromCookie() || navigator.language?.substring(0, 2) || DEFAULT_LC;
      lc = validate(lc);
      setPrimaryLc(lc);
      setLanguageCookie(lc);

      const secLc = await fetchSecondaryFromGeo();
      setSecondaryLc(secLc || null);

      setTranslationsEnabled(true);
      document.documentElement.lang = lc;
      document.documentElement.dir = 'ltr';
    };

    init();
  }, [setPrimaryLc, setSecondaryLc, fetchSecondaryFromGeo]);

  // Change language with optimized loading
  const changeLanguage = useCallback(async (lc: string) => {
    const valid = validate(lc);
    if (valid !== primaryLc) {
      console.log(`[useLanguage] 🔄 Changing language to ${valid}`);
      
      // First set the language so UI updates immediately
      setPrimaryLc(valid);
      setLanguageCookie(valid);
      document.documentElement.lang = valid;
      
      // Then ensure translations are loaded (if not already)
      if (!loadedLanguages.includes(valid)) {
        await loadTranslations(valid);
      }
    }
  }, [primaryLc, loadedLanguages, loadTranslations, setPrimaryLc, setLanguageCookie]);

  return {
    t,
    currentLc: primaryLc,
    secondaryLc,
    changeLanguage,
    setSecondaryLc,
    isLoading,
    hasError,
  };
};

export default useLanguage;