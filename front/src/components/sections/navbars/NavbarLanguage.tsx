// File: ./front/src/components/navbars/NavbarLanguage.tsx

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { BaseDropdown } from "@/components/elements/BaseDropdown";
import { useLanguage } from "@/hooks/useLanguage";
import { useUINavigation } from "@/hooks/useUINavigation";

interface Language {
  code: string;
  name_en: string;
  native_name: string;
  is_rtl: boolean;
  group?: "primary" | "secondary" | "recent" | "other";
}

// Component for rendering missing translations
const MissingTranslation: React.FC<{ text: string }> = ({ text }) => (
  <span style={{ color: 'red' }}>{text}</span>
);

const NavbarLanguage: React.FC = () => {
  // State management
  const [search, setSearch] = useState("");
  const [languages, setLanguageList] = useState<Language[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recentLanguages, setRecentLanguages] = useState<string[]>([]);
  const [ipBasedLanguage, setIpBasedLanguage] = useState<string>("en");
  const [isOpen, setIsOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(20);
  const [isDropdownHovered, setIsDropdownHovered] = useState(false);
  
  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const componentRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLElement | null)[]>([]);

  // Get language context
  const { currentLanguage, secondaryLanguage, setLanguages } = useLanguage();

  // Use fallbacks if currentLanguage or secondaryLanguage are undefined
  const primaryLang = currentLanguage || 'en';
  const secondaryLang = secondaryLanguage || ipBasedLanguage || 'en';

  // Load country-based language from IP
  useEffect(() => {
    const fetchCountryLanguage = async () => {
      try {
        // This would typically use geolocation or IP-based API
        // For now, we're using a simpler approach - detect based on browser locale
        const browserLocale = navigator.language.split('-')[1]?.toLowerCase() || 'us';
        
        const response = await fetch(`/api/country-language/${browserLocale}`);
        if (response.ok) {
          const data = await response.json();
          setIpBasedLanguage(data.language || 'en');
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
      try {
        const response = await fetch('/api/languages');
        if (!response.ok) throw new Error('Failed to load languages');
        const data = await response.json();
        
        // Check if data is in the expected format and not empty
        if (Array.isArray(data) && data.length > 0) {
          setLanguageList(data);
        } else {
          console.error('API returned empty or invalid data', data);
          // Set fallback to English only
          setLanguageList([
            { code: 'en', name_en: 'English', native_name: 'English', is_rtl: false },
          ]);
        }
      } catch (error) {
        console.error('Error loading languages:', error);
        // Set fallback to English only
        setLanguageList([
          { code: 'en', name_en: 'English', native_name: 'English', is_rtl: false },
        ]);
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
      setRecentLanguages(stored ? JSON.parse(stored) : []);
    } catch (error) {
      console.error('Error parsing recentLanguages from localStorage:', error);
      setRecentLanguages([]);
    }
  }, []);

  // Filter and group languages based on search term
  const filteredAndGroupedLanguages = useMemo(() => {
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
    const primary = filtered.filter(l => l.group === "primary");
    const secondary = filtered.filter(l => l.group === "secondary");
    const recent = filtered.filter(l => l.group === "recent")
      .sort((a, b) => recentLanguages.indexOf(a.code) - recentLanguages.indexOf(b.code));
    const others = filtered.filter(l => l.group === "other")
      .sort((a, b) => a.native_name.localeCompare(b.native_name));

    return {
      primary,
      secondary,
      recent,
      others,
      // Slice for virtual scrolling
      visible: [...primary, ...secondary, ...recent, ...others].slice(0, visibleCount),
      total: filtered.length
    };
  }, [languages, primaryLang, secondaryLang, recentLanguages, search, visibleCount]);

  // UI Navigation hook for keyboard navigation
  const { highlightedIndex, setHighlightedIndex, handleKeyDown: handleUINavKeyDown } = useUINavigation({
    items: filteredAndGroupedLanguages.visible,
    isOpen,
    onSelect: (lang) => handleSelectLanguage(lang.code),
    pageSize: 20,
    onLoadMore: () => setVisibleCount(prev => prev + 20),
    inputRef,
  });

  // Handle selecting a language
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

  // Search input handlers
  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setVisibleCount(20); // Reset visible count when search changes
  }, []);

  const handleSearchFocus = useCallback(() => {
    setIsOpen(true);
  }, []);

  // Keyboard navigation within dropdown
  const handleDropdownNavigation = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      handleUINavKeyDown(event);
      if (dropdownRef.current && highlightedIndex !== null && itemsRef.current[highlightedIndex]) {
        requestAnimationFrame(() => {
          const dropdown = dropdownRef.current;
          const item = itemsRef.current[highlightedIndex];
          if (item && dropdown) {
            const dropdownRect = dropdown.getBoundingClientRect();
            const itemRect = item.getBoundingClientRect();
            const buffer = 20;
            const visibleTop = dropdownRect.top + buffer;
            const visibleBottom = dropdownRect.bottom - buffer;

            const isAboveView = itemRect.top < visibleTop;
            const isBelowView = itemRect.bottom > visibleBottom;

            if (isAboveView) {
              dropdown.scrollTop -= (visibleTop - itemRect.top);
            } else if (isBelowView) {
              dropdown.scrollTop += (itemRect.bottom - visibleBottom);
            }
          }
        });
      }
    } else if (event.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.focus();
    }
  }, [handleUINavKeyDown, highlightedIndex]);

  // Dropdown hover event handlers
  const handleDropdownMouseEnter = useCallback(() => {
    setIsDropdownHovered(true);
  }, []);

  const handleDropdownMouseLeave = useCallback(() => {
    setIsDropdownHovered(false);
  }, []);

  // Get current flag image
  const getCurrentFlag = useCallback(() => {
    return `/flags/4x3/optimized/${primaryLang.toLowerCase()}.svg`;
  }, [primaryLang]);

  // Toggle dropdown open/closed
  const toggleDropdown = useCallback(() => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // When opening, focus the search input
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [isOpen]);

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
            ref={inputRef}
            type="text"
            placeholder="Search language..."
            className="language-search"
            value={search}
            onChange={handleSearchChange}
            onFocus={handleSearchFocus}
            autoFocus
          />
          
          {isLoading ? (
            <div className="language-loading">Loading languages...</div>
          ) : languages.length === 0 ? (
            <div className="language-error">
              <MissingTranslation text="missing data" />
            </div>
          ) : (
            <BaseDropdown
              items={filteredAndGroupedLanguages.visible}
              isOpen={true}
              onSelect={(lang) => handleSelectLanguage(lang.code)}
              variant="language"
              position="right"
              totalItems={filteredAndGroupedLanguages.total}
              pageSize={20}
              onLoadMore={() => setVisibleCount(prev => prev + 20)}
              renderItem={(lang, { isHighlighted }) => (
                <div 
                  className={`language-item ${isHighlighted ? 'language-item--highlighted' : ''} ${lang.group}`}
                  ref={(el) => (itemsRef.current[filteredAndGroupedLanguages.visible.indexOf(lang)] = el)}
                >
                  <img 
                    src={`/flags/4x3/optimized/${lang.code.toLowerCase()}.svg`}
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
              loadMoreText="Load more languages..."
              ref={dropdownRef}
              onKeyDown={isDropdownHovered ? handleDropdownNavigation : undefined}
              onMouseEnter={handleDropdownMouseEnter}
              onMouseLeave={handleDropdownMouseLeave}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default NavbarLanguage;