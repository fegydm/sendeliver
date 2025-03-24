// File: ./front/src/components/navbars/NavbarLanguage.tsx

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { BaseDropdown } from "@/components/elements/BaseDropdown";
import { useLanguage } from "@/hooks/useLanguage";

interface Language {
  code: string;
  name_en: string;
  native_name: string;
  is_rtl: boolean;
  flag_url?: string;
  group?: "primary" | "secondary" | "recent" | "other";
}

// Component for rendering missing translations
const MissingTranslation: React.FC<{ text: string }> = ({ text }) => (
  <span style={{ color: 'red' }}>{text}</span>
);

// Default fallback languages in case API fails
const DEFAULT_LANGUAGES: Language[] = [
  { code: "en", name_en: "English", native_name: "English", is_rtl: false, flag_url: "/flags/4x3/optimized/gb.svg" },
  { code: "sk", name_en: "Slovak", native_name: "Slovenčina", is_rtl: false, flag_url: "/flags/4x3/optimized/sk.svg" }
];

const NavbarLanguage: React.FC = () => {
  // State management
  const [search, setSearch] = useState("");
  const [languages, setLanguageList] = useState<Language[]>(DEFAULT_LANGUAGES);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [recentLanguages, setRecentLanguages] = useState<string[]>([]);
  const [ipBasedLanguage, setIpBasedLanguage] = useState<string>("en");
  const [isOpen, setIsOpen] = useState(false);
  
  // Refs
  const componentRef = useRef<HTMLDivElement>(null);
  
  // Get language context
  const { currentLanguage, secondaryLanguage, setLanguages } = useLanguage();

  // Use fallbacks if currentLanguage or secondaryLanguage are undefined
  const primaryLang = currentLanguage || 'en';
  const secondaryLang = secondaryLanguage || ipBasedLanguage || 'sk';

  // Load country-based language from IP
  useEffect(() => {
    const fetchCountryLanguage = async () => {
      try {
        // This would typically use geolocation or IP-based API
        // For now, we're using a simpler approach - detect based on browser locale
        const browserLocale = navigator.language.split('-')[1]?.toLowerCase() || 'us';
        
        console.log("Fetching language for country:", browserLocale);
        // Updated direct endpoint /api/languages/:countryCode
        const response = await fetch(`/api/languages/${browserLocale}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log("Country language data:", data);
          setIpBasedLanguage(data.language || 'en');
        } else {
          console.error("Error fetching country language, status:", response.status);
          setIpBasedLanguage('en');
        }
      } catch (error) {
        console.error('Error fetching country language:', error);
        // Fallback to English if there's an error
        setIpBasedLanguage('en');
      }
    };

    fetchCountryLanguage();
  }, []);

  // Load languages from API
  useEffect(() => {
    const fetchLanguages = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        console.log("Fetching languages from API");
        // Main endpoint /api/languages
        const response = await fetch('/api/languages');
        console.log("API response status:", response.status);
        
        if (!response.ok) {
          throw new Error(`Failed to load languages: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Languages data received:", data);
        
        // Check if data is in the expected format and not empty
        if (Array.isArray(data) && data.length > 0) {
          console.log(`Successfully loaded ${data.length} languages`);
          setLanguageList(data);
          setLoadError(null);
        } else {
          console.error('API returned empty or invalid data', data);
          setLoadError("No languages returned from API");
          // Keep using default languages
        }
      } catch (error) {
        console.error('Error loading languages:', error);
        setLoadError(error instanceof Error ? error.message : "Unknown error loading languages");
        // Keep using default languages
      } finally {
        setIsLoading(false);
      }
    };

    fetchLanguages();
  }, []);

  // Load recent languages from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('recentLanguages');
      const parsed = stored ? JSON.parse(stored) : [];
      console.log("Loaded recent languages from localStorage:", parsed);
      setRecentLanguages(parsed);
    } catch (error) {
      console.error('Error parsing recentLanguages from localStorage:', error);
      setRecentLanguages([]);
    }
  }, []);

  // Group and filter languages based on search term
  const groupedLanguages = useMemo(() => {
    // First assign groups to all languages
    const grouped = languages.map(lang => ({
      ...lang,
      group: 
        lang.code === primaryLang ? "primary" :
        lang.code === secondaryLang ? "secondary" :
        recentLanguages.includes(lang.code) ? "recent" : "other"
    }));

    // Then filter based on search term
    const filtered = grouped.filter(lang => 
      search === "" || 
      lang.code.toLowerCase().includes(search.toLowerCase()) ||
      lang.name_en.toLowerCase().includes(search.toLowerCase()) ||
      lang.native_name.toLowerCase().includes(search.toLowerCase())
    );

    // Group into categories
    return {
      primary: filtered.filter(l => l.group === "primary"),
      secondary: filtered.filter(l => l.group === "secondary"),
      recent: filtered.filter(l => l.group === "recent")
        .sort((a, b) => recentLanguages.indexOf(a.code) - recentLanguages.indexOf(b.code)),
      others: filtered.filter(l => l.group === "other")
        .sort((a, b) => a.native_name.localeCompare(b.native_name))
    };
  }, [languages, primaryLang, secondaryLang, recentLanguages, search]);

  const handleSelectLanguage = useCallback((code: string) => {
    if (code === primaryLang) return;
    
    if (code === secondaryLang) {
      // Swap primary and secondary
      setLanguages(secondaryLang, primaryLang);
    } else {
      // New primary, old primary becomes secondary
      setLanguages(code, primaryLang);
      
      // Update recent languages
      const newRecent = [code, ...recentLanguages.filter(c => c !== code && c !== primaryLang)].slice(0, 3);
      setRecentLanguages(newRecent);
      localStorage.setItem('recentLanguages', JSON.stringify(newRecent));
    }
    
    setIsOpen(false);
  }, [primaryLang, secondaryLang, setLanguages, recentLanguages]);

  // Handle clicking outside the component
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (componentRef.current && !componentRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  // Get current flag image from language data if available
  const getCurrentFlag = useCallback(() => {
    const currentLanguage = languages.find(lang => lang.code === primaryLang);
    if (currentLanguage?.flag_url) {
      return currentLanguage.flag_url;
    }
    return `/flags/4x3/optimized/${primaryLang.toLowerCase()}.svg`;
  }, [primaryLang, languages]);

  // Toggle dropdown open/closed
  const toggleDropdown = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  // Debug info
  console.log("NavbarLanguage render state:", {
    primaryLang,
    secondaryLang,
    isLoading,
    languagesCount: languages.length,
    hasError: !!loadError
  });

  // Prepare all items for the dropdown
  const { primary, secondary, recent, others } = groupedLanguages;
  const allFilteredLanguages = [...primary, ...secondary, ...recent, ...others];

  return (
    <div className="navbar-language-container" ref={componentRef}>
      <button 
        onClick={toggleDropdown} 
        className="navbar__language" 
        aria-label="Change language"
        aria-expanded={isOpen}
      >
        <span className="navbar-language-code">{primaryLang}</span>
        <img 
          src={getCurrentFlag()} 
          alt="Selected language" 
          className="navbar-language-icon"
          onError={(e) => { e.currentTarget.src = "/flags/4x3/optimized/gb.svg"; }}
        />
      </button>
      
      {isOpen && (
        <div className="language-dropdown">
          <input
            type="text"
            placeholder="Search language..."
            className="language-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          
          {isLoading ? (
            <div className="language-loading">Loading languages...</div>
          ) : loadError ? (
            <div className="language-error">
              <MissingTranslation text={`Error: ${loadError}`} />
            </div>
          ) : allFilteredLanguages.length === 0 ? (
            <div className="language-error">
              <MissingTranslation text="No languages found" />
            </div>
          ) : (
            <BaseDropdown
              items={allFilteredLanguages}
              isOpen={true}
              onSelect={(lang) => handleSelectLanguage(lang.code)}
              variant="language"
              position="right"
              renderItem={(lang, { isHighlighted }) => (
                <div className={`language-item ${isHighlighted ? 'language-item--highlighted' : ''} ${lang.group}`}>
                  <img 
                    src={lang.flag_url || `/flags/4x3/optimized/${lang.code.toLowerCase()}.svg`}
                    alt={`${lang.code} flag`} 
                    className="language-item-flag" 
                    onError={(e) => { e.currentTarget.src = "/flags/4x3/optimized/gb.svg"; }}
                  />
                  <span className="language-item-code">{lang.code}</span>
                  <span className="language-item-name">{lang.native_name}</span>
                  {lang.group === "primary" && (
                    <span className="language-current-indicator">✓</span>
                  )}
                  {lang.group === "secondary" && (
                    <span className="language-secondary-indicator">2</span>
                  )}
                </div>
              )}
              getItemKey={(lang) => lang.code}
              ariaLabel="Language options"
              className="language-selector-dropdown"
              noResultsText="No languages found"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default NavbarLanguage;