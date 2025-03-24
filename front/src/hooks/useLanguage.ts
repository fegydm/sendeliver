// ./front/src/hooks/useLanguage.ts
import { useState, useEffect } from 'react';
import { getIPLocation } from '../utils/geo';

interface LanguageState {
  primaryLanguage: string; // e.g., 'en'
  secondaryLanguage: string; // e.g., 'sk'
  translations: Record<string, string>;
  isLoading: boolean;
}

// Helper functions to work with localStorage instead of cookies
const saveLanguage = (language: string): void => {
  try {
    localStorage.setItem('lastLanguage', language);
  } catch (error) {
    console.error('Failed to save language to localStorage:', error);
  }
};

const getLanguage = (): string | null => {
  try {
    return localStorage.getItem('lastLanguage');
  } catch (error) {
    console.error('Failed to get language from localStorage:', error);
    return null;
  }
};

export function useLanguage(user?: { id: string; settings?: { primaryLanguage?: string; secondaryLanguage?: string } }) {
  const [state, setState] = useState<LanguageState>({
    primaryLanguage: 'en',
    secondaryLanguage: 'en',
    translations: {},
    isLoading: true,
  });

  const { t } = useTranslations(state);

  useEffect(() => {
    const loadLanguageData = async () => {
      let primaryLang = 'en';
      let secondaryLang = 'en';
      let translations: Record<string, string> = {};

      try {
        const ipLang = await getIPLocation();
        if (user?.id) {
          primaryLang = user.settings?.primaryLanguage || 'en';
          secondaryLang = user.settings?.secondaryLanguage || ipLang;
        } else {
          const storedLang = getLanguage();
          secondaryLang = storedLang || ipLang;
        }

        const [enResponse, nativeResponse] = await Promise.all([
          fetch('/api/translations/en'),
          secondaryLang !== 'en' ? fetch(`/api/translations/${secondaryLang}`) : null,
        ]);

        if (!enResponse.ok) throw new Error('EN translations failed');
        translations = await enResponse.json();

        if (nativeResponse && nativeResponse.ok) {
          Object.assign(translations, await nativeResponse.json());
        }
      } catch (error) {
        console.info('Failed to load translations, using EN only');
        const enResponse = await fetch('/api/translations/en');
        translations = enResponse.ok ? await enResponse.json() : {};
      }

      setState({
        primaryLanguage: primaryLang,
        secondaryLanguage: secondaryLang,
        translations,
        isLoading: false,
      });
    };

    loadLanguageData();
  }, [user]);

  return {
    currentLanguage: state.primaryLanguage,
    secondaryLanguage: state.secondaryLanguage,
    t,
    setLanguages: (primary: string, secondary: string) => {
      saveLanguage(primary); // Save to localStorage instead of cookies
      setState((prev) => ({
        ...prev,
        primaryLanguage: primary,
        secondaryLanguage: secondary,
      }));
    },
  };
}

function useTranslations(state: LanguageState) {
  const t = (key: string): string | null => {
    return state.translations[key] || null;
  };
  return { t };
}