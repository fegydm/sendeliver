// ./front/src/config/languages.config.js
export const DEFAULT_LANGUAGE = 'en';

export const BASE_LANGUAGES = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    countryCode: 'GB',
    priority: 1
  }
};

export const SUPPORTED_LANGUAGES = {
  af: { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', countryCode: 'ZA' },
  ar: { code: 'ar', name: 'Arabic', nativeName: 'العربية', countryCode: 'SA' },
  bn: { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', countryCode: 'BD' },
  // ... ďalšie jazyky
};

// ./front/src/services/language.service.js
import { DEFAULT_LANGUAGE, BASE_LANGUAGES, SUPPORTED_LANGUAGES } from '../config/languages.config';

class LanguageService {
  constructor() {
    this.currentLanguage = DEFAULT_LANGUAGE;
    this.secondaryLanguage = null;
    this.translationCache = new Map();
    this.verifiedTranslations = new Set();
  }

  // Rýchle načítanie základných prekladov z localStorage
  async initialize() {
    // Načítaj predchádzajúci secondary language
    this.secondaryLanguage = localStorage.getItem('secondaryLanguage');
    
    // Načítaj cache z localStorage
    const cachedTranslations = localStorage.getItem('translationCache');
    if (cachedTranslations) {
      this.translationCache = new Map(JSON.parse(cachedTranslations));
    }

    // Načítaj verified translations z DB pri štarte
    await this.loadVerifiedTranslations();
  }

  // Rýchle prepnutie medzi primárnym a sekundárnym jazykom
  toggleLanguage() {
    if (!this.secondaryLanguage) return;
    
    const temp = this.currentLanguage;
    this.currentLanguage = this.secondaryLanguage;
    this.secondaryLanguage = temp;
    
    document.documentElement.lang = this.currentLanguage;
    this.notifyLanguageChange();
  }

  // Pomalšie nastavenie nového sekundárneho jazyka
  async setSecondaryLanguage(langCode) {
    if (langCode === this.currentLanguage) return;
    
    this.secondaryLanguage = langCode;
    localStorage.setItem('secondaryLanguage', langCode);

    // Načítaj preklady pre nový jazyk
    await this.loadTranslations(langCode);
  }

  // Načítanie prekladov z DB/API
  async loadTranslations(langCode) {
    if (this.translationCache.has(langCode)) return;

    try {
      const response = await fetch(`/api/translations/${langCode}`);
      const translations = await response.json();
      
      this.translationCache.set(langCode, translations);
      localStorage.setItem('translationCache', 
        JSON.stringify(Array.from(this.translationCache.entries()))
      );
    } catch (error) {
      console.error(`Failed to load translations for ${langCode}`, error);
    }
  }

  // Načítanie verifikovaných prekladov
  async loadVerifiedTranslations() {
    try {
      const response = await fetch('/api/translations/verified');
      const verified = await response.json();
      this.verifiedTranslations = new Set(verified);
    } catch (error) {
      console.error('Failed to load verified translations', error);
    }
  }

  // Získanie prekladu
  getTranslation(key, language = this.currentLanguage) {
    const translations = this.translationCache.get(language);
    return translations?.[key] || key;
  }

  // Kontrola či je preklad verifikovaný
  isVerifiedTranslation(key, language) {
    return this.verifiedTranslations.has(`${language}:${key}`);
  }
}

export const languageService = new LanguageService();

// ./front/src/components/language-switcher.component.js
import React, { useState, useEffect, useRef } from 'react';
import { languageService } from '../services/language.service';
import { BASE_LANGUAGES, SUPPORTED_LANGUAGES } from '../config/languages.config';

const LanguageSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(languageService.currentLanguage);
  const [secondaryLang, setSecondaryLang] = useState(languageService.secondaryLanguage);
  const dropdownRef = useRef(null);

  // Rýchle prepnutie medzi jazykmi
  const handleQuickToggle = () => {
    languageService.toggleLanguage();
    setCurrentLang(languageService.currentLanguage);
    setSecondaryLang(languageService.secondaryLanguage);
  };

  // Výber nového sekundárneho jazyka
  const handleLanguageSelect = async (langCode) => {
    await languageService.setSecondaryLanguage(langCode);
    setSecondaryLang(langCode);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Quick Toggle Button */}
      <button 
        onClick={handleQuickToggle}
        className="relative p-2 rounded-lg hover:bg-gray-700 transition-colors"
      >
        <img 
          src={`/images/flags/${currentLang}.svg`}
          alt={SUPPORTED_LANGUAGES[currentLang]?.name}
          className="w-6 h-6 grayscale hover:grayscale-0 transition-all"
        />
        {secondaryLang && (
          <div className="absolute -bottom-1 -right-1">
            <img 
              src={`/images/flags/${secondaryLang}.svg`}
              alt={SUPPORTED_LANGUAGES[secondaryLang]?.name}
              className="w-4 h-4 grayscale hover:grayscale-0 transition-all"
            />
          </div>
        )}
      </button>

      {/* Language Selector Dropdown */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-gray-700 transition-colors ml-2"
      >
        <span className="sr-only">Open language menu</span>
        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 py-2 w-56 bg-gray-800 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          {/* Anglický jazyk vždy prvý */}
          <button
            onClick={() => handleLanguageSelect('en')}
            className="flex items-center space-x-3 w-full px-4 py-2 hover:bg-gray-700 transition-colors"
          >
            <img 
              src="/images/flags/en.svg"
              alt="English"
              className="w-6 h-6"
            />
            <span className="flex-1">English</span>
            <span className="text-sm text-gray-400">EN</span>
          </button>

          <div className="border-t border-gray-700 my-2"></div>

          {/* Ostatné jazyky */}
          {Object.entries(SUPPORTED_LANGUAGES)
            .filter(([code]) => code !== 'en')
            .sort((a, b) => a[1].name.localeCompare(b[1].name))
            .map(([code, lang]) => (
              <button
                key={code}
                onClick={() => handleLanguageSelect(code)}
                className="flex items-center space-x-3 w-full px-4 py-2 hover:bg-gray-700 transition-colors"
              >
                <img 
                  src={`/images/flags/${code}.svg`}
                  alt={lang.name}
                  className="w-6 h-6"
                />
                <span className="flex-1">{lang.nativeName}</span>
                <span className="text-sm text-gray-400">{code.toUpperCase()}</span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;