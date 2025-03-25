// File: ./front/src/hooks/useLanguage.ts
import { useState, useEffect, useCallback } from 'react';
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

  // Load translations for a specific language
  const loadTranslationsForLanguage = useCallback(async (langCode: string): Promise<Record<string, string>> => {
    try {
      // Updated URL endpoint to /api/geo/translations/ since BE routes translations in geo
      const response = await fetch(`/api/geo/translations/${langCode}`);
      if (response.ok) {
        const translationsData = await response.json();
        console.log(`${langCode} translations loaded successfully`);
        return translationsData;
      } else {
        console.warn(`Failed to load ${langCode} translations`);
        return {};
      }
    } catch (error) {
      console.warn(`Error loading ${langCode} translations:`, error);
      return {};
    }
  }, []);

  // Function to update languages and reload translations
  const setLanguages = useCallback(async (primary: string, secondary: string) => {
    // Save to localStorage
    saveLanguages(primary, secondary);
    
    // Update state with loading flag
    setState(prev => ({
      ...prev,
      primaryLanguage: primary,
      secondaryLanguage: secondary,
      isLoading: true
    }));
    
    // Load new translations
    try {
      // Always load English first as fallback
      let translations = { ...fallbackTranslations };
      
      // Load primary language translations
      const primaryTranslations = await loadTranslationsForLanguage(primary);
      translations = { ...translations, ...primaryTranslations };
      
      // If secondary is different from primary, load it too
      if (secondary !== primary) {
        const secondaryTranslations = await loadTranslationsForLanguage(secondary);
        translations = { ...translations, ...secondaryTranslations };
      }
      
      // Update state with new translations
      setState(prev => ({
        ...prev,
        translations,
        isLoading: false
      }));
    } catch (error) {
      console.error('Failed to load translations:', error);
      setState(prev => ({
        ...prev,
        isLoading: false
      }));
    }
  }, [loadTranslationsForLanguage]);

  useEffect(() => {
    const loadLanguageData = async () => {
      let primaryLang = 'en';
      let secondaryLang = 'en';

      try {
        // Step 1: Try to get languages from user settings (DB)
        if (user?.id && user?.settings) {
          primaryLang = user.settings.primaryLanguage || 'en';
          secondaryLang = user.settings.secondaryLanguage || 'en';
          console.log('Using languages from user settings:', primaryLang, secondaryLang);
        } else {
          // Step 2: Try to get languages from localStorage
          const savedLangs = getSavedLanguages();
          if (savedLangs.primary) {
            primaryLang = savedLangs.primary;
            secondaryLang = savedLangs.secondary || 'en';
            console.log('Using languages from localStorage:', primaryLang, secondaryLang);
          } else {
            // Step 3: Use IP address only for secondary language
            try {
              const ipLang = await getIPLocation();
              primaryLang = 'en';
              secondaryLang = ipLang || 'en';
              console.log('Using languages from IP:', primaryLang, secondaryLang);
            } catch (error) {
              console.warn('Failed to get language from IP, using defaults:', 'en', 'en');
              primaryLang = 'en';
              secondaryLang = 'en';
            }
          }
        }

        // Load translations
        await setLanguages(primaryLang, secondaryLang);
      } catch (error) {
        console.error('Failed to initialize language system:', error);
        setState({
          primaryLanguage: 'en',
          secondaryLanguage: 'en',
          translations: { ...fallbackTranslations },
          isLoading: false,
        });
      }
    };

    loadLanguageData();
  }, [user, setLanguages]);

  // Translation function
  const t = useCallback((key: string): string => {
    return state.translations[key] || key || "missing data";
  }, [state.translations]);

  return {
    currentLanguage: state.primaryLanguage,
    secondaryLanguage: state.secondaryLanguage,
    t,
    setLanguages,
    isLoading: state.isLoading
  };
}

export default useLanguage;
