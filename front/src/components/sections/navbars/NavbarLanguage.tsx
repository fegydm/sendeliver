import React, { useState, useRef, useCallback, useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import "./navbar.component.css";

// Define translation record types for TypeScript
type TranslationKey = 'language.en' | 'language.sk' | 'language.cs' | 'language.de';
type LanguageCode = 'en' | 'sk' | 'cs' | 'de';
type TranslationSet = Record<TranslationKey, string>;
type TranslationsMap = Record<LanguageCode, TranslationSet>;

// Default translations that are always immediately available
const DEFAULT_TRANSLATIONS: TranslationsMap = {
  'en': {
    'language.en': 'English',
    'language.sk': 'Slovak',
    'language.cs': 'Czech',
    'language.de': 'German'
  },
  'sk': {
    'language.en': 'Angličtina',
    'language.sk': 'Slovenčina',
    'language.cs': 'Čeština',
    'language.de': 'Nemčina'
  },
  'cs': {
    'language.en': 'Angličtina',
    'language.sk': 'Slovenština',
    'language.cs': 'Čeština',
    'language.de': 'Němčina'
  },
  'de': {
    'language.en': 'Englisch',
    'language.sk': 'Slowakisch',
    'language.cs': 'Tschechisch',
    'language.de': 'Deutsch'
  }
};

// Supported languages with localized names
const SUPPORTED_LANGUAGES = [
  { lc: 'en' as LanguageCode, cc: 'GB', nameKey: 'language.en' as TranslationKey },
  { lc: 'sk' as LanguageCode, cc: 'SK', nameKey: 'language.sk' as TranslationKey },
  { lc: 'cs' as LanguageCode, cc: 'CZ', nameKey: 'language.cs' as TranslationKey },
  { lc: 'de' as LanguageCode, cc: 'DE', nameKey: 'language.de' as TranslationKey }
];

const NavbarLanguage: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);
  
  // Get language data from context
  const { 
    currentLc,
    secondaryLc,
    changeLanguage,
    t
  } = useLanguage();

  // Get flag URL - simple function with no dependencies
  const getFlagUrl = (cc: string): string => {
    return `/flags/4x3/optimized/${cc.toLowerCase()}.svg`;
  };

  // Helper function to get translation that's always available
  const getLocalizedName = useCallback((nameKey: TranslationKey): string => {
    // First try to get from official t() function
    const translation = t(nameKey);
    
    // If t() returned the original key (translation not found),
    // use default translations
    if (translation === nameKey) {
      // Try current language first
      if (currentLc && isValidLanguageCode(currentLc) && DEFAULT_TRANSLATIONS[currentLc][nameKey]) {
        return DEFAULT_TRANSLATIONS[currentLc][nameKey];
      }
      
      // Try secondary language
      if (secondaryLc && isValidLanguageCode(secondaryLc) && DEFAULT_TRANSLATIONS[secondaryLc][nameKey]) {
        return DEFAULT_TRANSLATIONS[secondaryLc][nameKey];
      }
      
      // Fallback to English
      return DEFAULT_TRANSLATIONS['en'][nameKey] || nameKey;
    }
    
    return translation;
  }, [t, currentLc, secondaryLc]);

  // Type guard to check if a language code is valid
  function isValidLanguageCode(lc: string): lc is LanguageCode {
    return lc === 'en' || lc === 'sk' || lc === 'cs' || lc === 'de';
  }

  // Find current language object
  const currentLanguage = SUPPORTED_LANGUAGES.find(lang => 
    lang.lc === currentLc
  ) || SUPPORTED_LANGUAGES[0];

  // Toggle dropdown visibility with no side-effects
  const toggleDropdown = useCallback(() => {
    setIsDropdownOpen(prev => !prev);
  }, []);

  // Handle language selection
  const handleLanguageClick = useCallback((lc: string) => {
    if (lc !== currentLc) {
      changeLanguage(lc);
    }
    setIsDropdownOpen(false);
  }, [currentLc, changeLanguage]);

  // Use useCallback to create a stable reference for the event handler
  const handleClickOutside = useCallback((event: MouseEvent) => {
    // Check if click is outside the component
    if (componentRef.current && !componentRef.current.contains(event.target as Node)) {
      setIsDropdownOpen(false);
    }
  }, []);

  // Add event listener on mount and clean up on unmount
  useEffect(() => {
    window.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  return (
    <div className="navbar-language-container" ref={componentRef}>
      <button 
        onClick={toggleDropdown} 
        className="navbar-language-button" 
        aria-label="Change language"
        aria-expanded={isDropdownOpen}
      >
        <img 
          src={getFlagUrl(currentLanguage.cc)} 
          alt={`${currentLanguage.lc} flag`} 
          className="navbar-language-flag"
          onError={(e) => { e.currentTarget.src = getFlagUrl('GB'); }}
        />
        <span className="navbar-language-lc">{currentLanguage.lc}</span>
      </button>
      
      {isDropdownOpen && (
        <div className="navbar-language-dropdown-container">
          <div className="navbar-language-dropdown">
            {SUPPORTED_LANGUAGES.map(lang => (
              <button
                key={lang.lc}
                className={`navbar-language-item ${lang.lc === currentLc ? 'navbar-language-item--active' : ''}`}
                onClick={() => handleLanguageClick(lang.lc)}
              >
                <img 
                  src={getFlagUrl(lang.cc)} 
                  alt={`${lang.cc} flag`}
                  className="navbar-language-item-flag"
                  onError={(e) => { e.currentTarget.src = getFlagUrl('GB'); }}
                />
                <span className="navbar-language-item-lc">{lang.lc}</span>
                <span className="navbar-language-item-name">{getLocalizedName(lang.nameKey)}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NavbarLanguage;
