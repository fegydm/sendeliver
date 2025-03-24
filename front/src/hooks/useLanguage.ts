// ./front/src/hooks/useLanguage.ts
import { useState, useEffect } from 'react';
import { getIPLocation } from '../utils/geo';

interface LanguageState {
  primaryLanguage: string; // e.g., 'en'
  secondaryLanguage: string; // e.g., 'sk'
  translations: Record<string, string>;
  isLoading: boolean;
}

// Fallback translations (minimum set)
const fallbackTranslations = {
  "welcome": "Welcome",
  "about": "About",
  "login": "Log in",
  "register": "Register"
};

// Helper functions to work with localStorage instead of cookies
const saveLanguages = (primary: string, secondary: string): void => {
  try {
    localStorage.setItem('primaryLanguage', primary);
    localStorage.setItem('secondaryLanguage', secondary);
  } catch (error) {
    console.error('Failed to save languages to localStorage:', error);
  }
};

const getSavedLanguages = (): { primary: string | null, secondary: string | null } => {
  try {
    return {
      primary: localStorage.getItem('primaryLanguage'),
      secondary: localStorage.getItem('secondaryLanguage')
    };
  } catch (error) {
    console.error('Failed to get languages from localStorage:', error);
    return { primary: null, secondary: null };
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
        // Step 1: Try to get languages from user settings (DB)
        if (user?.id && user?.settings) {
          primaryLang = user.settings.primaryLanguage || 'en';
          secondaryLang = user.settings.secondaryLanguage || 'en';
          console.log('Using languages from user settings:', primaryLang, secondaryLang);
        } else {
          // Step 2: Try to get languages from localStorage
          const savedLangs = getSavedLanguages();
          if (savedLangs.primary || savedLangs.secondary) {
            primaryLang = savedLangs.primary || 'en';
            secondaryLang = savedLangs.secondary || 'en';
            console.log('Using languages from localStorage:', primaryLang, secondaryLang);
          } else {
            // Step 3: Use IP address only for secondary language
            try {
              const ipLang = await getIPLocation();
              primaryLang = 'en';
              secondaryLang = ipLang;
              console.log('Using languages from IP:', primaryLang, secondaryLang);
            } catch (error) {
              console.warn('Failed to get language from IP, using defaults:', 'en', 'en');
              primaryLang = 'en';
              secondaryLang = 'en';
            }
          }
        }

        // Load translations from API
        try {
          // Always load EN translations
          const enResponse = await fetch('/api/translations/en');

          if (enResponse.ok) {
            translations = await enResponse.json();
            console.log('EN translations loaded successfully');
          } else {
            console.warn('Failed to load EN translations, using fallback');
            translations = { ...fallbackTranslations };
          }

          // If secondary language is not EN, load its translations too
          if (secondaryLang !== 'en') {
            try {
              const secondaryResponse = await fetch(`/api/translations/${secondaryLang}`);
              if (secondaryResponse.ok) {
                const secondaryTranslations = await secondaryResponse.json();
                Object.assign(translations, secondaryTranslations);
                console.log(`${secondaryLang} translations loaded successfully`);
              } else {
                console.warn(`Failed to load ${secondaryLang} translations, using EN only`);
              }
            } catch (error) {
              console.warn(`Error loading ${secondaryLang} translations:`, error);
            }
          }
        } catch (error) {
          console.info('Failed to load translations, using English fallback only');
          translations = { ...fallbackTranslations };
        }
      } catch (error) {
        console.error('Failed to initialize language system:', error);
        primaryLang = 'en';
        secondaryLang = 'en';
        translations = { ...fallbackTranslations };
      }

      // Save selected languages to localStorage
      saveLanguages(primaryLang, secondaryLang);

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
      saveLanguages(primary, secondary);
      setState((prev) => ({
        ...prev,
        primaryLanguage: primary,
        secondaryLanguage: secondary,
      }));
    },
  };
}

function useTranslations(state: LanguageState) {
  // Function t() returns translation or "missing data" if translation doesn't exist
  const t = (key: string): string => {
    return state.translations[key] || "missing data"; 
  };
  return { t };
}