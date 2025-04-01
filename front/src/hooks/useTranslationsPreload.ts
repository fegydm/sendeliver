import { useState, useEffect, useCallback } from 'react';

interface TranslationsPreloadOptions {
  primaryLc: string;
  secondaryLc: string | null;
  enabled: boolean;
}

const DEFAULT_LC = 'en';
const CACHE_LIMIT = 3;

const fetchTranslations = async (lc: string): Promise<{ data: Record<string, string>; version: string }> => {
  const response = await fetch(`/api/translations?lc=${lc}`, {
    headers: { 'Cache-Control': 'max-age=3600' },
  });
  const { translations, version } = await response.json();
  const data = Object.fromEntries(Object.entries(translations).map(([key, text]) => [key, text as string]));
  return { data, version: version || 'v1.0' };
};

export const useTranslationsPreload = ({ primaryLc, secondaryLc, enabled }: TranslationsPreloadOptions) => {
  const [translations, setTranslations] = useState<Record<string, Record<string, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const loadTranslations = async () => {
      setIsLoading(true);
      setHasError(false);

      const storedTranslations = localStorage.getItem('translationsCache');
      let translationCache: Record<string, { data: Record<string, string>; version: string }> = storedTranslations
        ? JSON.parse(storedTranslations)
        : {};

      // 1. Načítaj EN ako prvý, ak nie je v cache alebo verzia nesedí
      const lcsToFetch = new Set<string>();
      if (!translationCache[DEFAULT_LC]) {
        lcsToFetch.add(DEFAULT_LC);
      } else {
        const enServer = await fetchTranslations(DEFAULT_LC);
        if (enServer.version !== translationCache[DEFAULT_LC].version) {
          lcsToFetch.add(DEFAULT_LC);
        }
      }

      // 2. Pridaj primárny a sekundárny (ak nie sú duplicitné)
      lcsToFetch.add(primaryLc);
      if (secondaryLc && secondaryLc !== primaryLc) lcsToFetch.add(secondaryLc);

      // 3. Načítaj chýbajúce jazyky
      const results = await Promise.all(
        Array.from(lcsToFetch).map(async (lc) => {
          if (translationCache[lc] && lc !== DEFAULT_LC) {
            console.log(`[TranslationsPreload] Using cached translations for lc '${lc}'`);
            return { lc, data: translationCache[lc].data, version: translationCache[lc].version };
          }
          return fetchTranslations(lc);
        })
      );

      // 4. Aktualizuj cache, chráň EN a secondaryLc
      const newTranslations = { ...translationCache };
      results.forEach(({ lc, data, version }) => {
        newTranslations[lc] = { data, version };
      });

      const allLcs = Object.keys(newTranslations);
      if (allLcs.length > CACHE_LIMIT) {
        const protectedLcs = [DEFAULT_LC, secondaryLc || ''].filter(Boolean);
        for (const lc of allLcs) {
          if (!protectedLcs.includes(lc) && lc !== primaryLc) {
            delete newTranslations[lc];
          }
          if (Object.keys(newTranslations).length <= CACHE_LIMIT) break;
        }
      }

      setTranslations(Object.fromEntries(Object.entries(newTranslations).map(([lc, { data }]) => [lc, data])));
      localStorage.setItem('translationsCache', JSON.stringify(newTranslations));
      setIsLoading(false);
    };

    loadTranslations();
  }, [primaryLc, secondaryLc, enabled]);

  const t = useCallback(
    (key: string, defaultValue?: string): string => {
      return (
        translations[primaryLc]?.[key] ||
        translations[DEFAULT_LC]?.[key] ||
        defaultValue ||
        key
      );
    },
    [translations, primaryLc]
  );

  return { t, isLoading, hasError };
};

export default useTranslationsPreload;