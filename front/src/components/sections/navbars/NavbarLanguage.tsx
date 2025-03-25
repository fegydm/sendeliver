// File: ./front/src/components/navbars/NavbarLanguage.tsx

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { BaseDropdown } from "@/components/elements/BaseDropdown";
import { useLanguage } from "@/hooks/useLanguage";
import { useLanguagesPreload } from "@/hooks/useLanguagesPreload";
import type { Language } from "@/types/language.types";
import "./navbar.component.css";

const NavbarLanguage: React.FC = () => {
  // State management
  const [filterValue, setFilterValue] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Refs
  const componentRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Get language context
  const { currentLanguage, secondaryLanguage, setLanguages } = useLanguage();
  
  // Get languages with the simplified hook
  const { 
    languages, 
    isLoading, 
    loadLanguages
  } = useLanguagesPreload();

  // Use fallbacks if currentLanguage or secondaryLanguage are undefined
  const primaryLang = currentLanguage || 'en';
  const secondaryLang = secondaryLanguage || 'sk';

  // Filter languages based on search term
  const filteredLanguages = useMemo(() => {
    if (!filterValue) return languages;
    
    // Manual filtering
    return languages.filter(lang => 
      lang.code.toLowerCase().includes(filterValue.toLowerCase()) || 
      lang.name_en.toLowerCase().includes(filterValue.toLowerCase()) || 
      lang.native_name.toLowerCase().includes(filterValue.toLowerCase())
    );
  }, [languages, filterValue]);
  
  // Create final dropdown items with proper ordering
  const dropdownItems = useMemo(() => {
    // Find primary and secondary language objects
    const primaryLanguage = languages.find(lang => lang.code === primaryLang);
    const secondaryLanguage = languages.find(lang => lang.code === secondaryLang);
    
    // Filter out primary and secondary from other languages
    const otherLanguages = filteredLanguages.filter(
      lang => lang.code !== primaryLang && lang.code !== secondaryLang
    );
    
    // Combine languages in the specified order:
    // 1. Special divider item for search row
    // 2. Primary language
    // 3. Secondary language
    // 4. Other languages
    const result: Array<Language & { isSearchRow?: boolean; isPrimary?: boolean; isSecondary?: boolean }> = [];
    
    // Search row is not a real language, it's a special item for rendering
    if (filterValue) {
      result.push({
        code: '__search__',
        name_en: 'Search Results',
        native_name: 'Search Results',
        is_rtl: false,
        isSearchRow: true
      } as Language & { isSearchRow: boolean });
    }
    
    // Add primary language if it exists and passes the filter
    if (primaryLanguage && (
      !filterValue || 
      primaryLanguage.code.toLowerCase().includes(filterValue.toLowerCase()) ||
      primaryLanguage.name_en.toLowerCase().includes(filterValue.toLowerCase()) ||
      primaryLanguage.native_name.toLowerCase().includes(filterValue.toLowerCase())
    )) {
      result.push({
        ...primaryLanguage,
        isPrimary: true
      });
    }
    
    // Add secondary language if it exists and passes the filter
    if (secondaryLanguage && secondaryLanguage.code !== primaryLang && (
      !filterValue || 
      secondaryLanguage.code.toLowerCase().includes(filterValue.toLowerCase()) ||
      secondaryLanguage.name_en.toLowerCase().includes(filterValue.toLowerCase()) ||
      secondaryLanguage.native_name.toLowerCase().includes(filterValue.toLowerCase())
    )) {
      result.push({
        ...secondaryLanguage,
        isSecondary: true
      });
    }
    
    // Add all other languages
    result.push(...otherLanguages);
    
    return result;
  }, [languages, primaryLang, secondaryLang, filteredLanguages, filterValue]);

  const handleSelectLanguage = useCallback((code: string) => {
    // Don't do anything for search row or if we're selecting the current primary language
    if (code === '__search__' || code === primaryLang) return;
    
    if (code === secondaryLang) {
      // Swap primary and secondary
      setLanguages(secondaryLang, primaryLang);
    } else {
      // New primary, old primary becomes secondary
      setLanguages(code, primaryLang);
    }
    
    setIsDropdownOpen(false);
    setFilterValue("");
  }, [primaryLang, secondaryLang, setLanguages]);

  // Handle clicking outside the component
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (componentRef.current && !componentRef.current.contains(event.target as Node)) {
      setIsDropdownOpen(false);
      setFilterValue("");
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
    const newState = !isDropdownOpen;
    setIsDropdownOpen(newState);
    
    // Load languages and focus search input when opening
    if (newState) {
      console.log('Opening dropdown, loading languages...');
      // Load languages data if dropdown is opened
      loadLanguages().then(data => {
        console.log(`Loaded ${data.length} languages`);
      });
      
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
    } else {
      setFilterValue("");
    }
  }, [isDropdownOpen, loadLanguages]);

  // Handle search input keydown events
  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsDropdownOpen(false);
      setFilterValue("");
    }
  }, []);

  // Handle hover states
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  // Auto-focus search input when dropdown opens
  useEffect(() => {
    if (isDropdownOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isDropdownOpen]);

  return (
    <div 
      className="navbar-language-container" 
      ref={componentRef}
    >
      <button 
        onClick={toggleDropdown} 
        className="navbar__language" 
        aria-label="Change language"
        aria-expanded={isDropdownOpen}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <span className="navbar-language-code">{primaryLang}</span>
        <img 
          src={getCurrentFlag()} 
          alt="Selected language" 
          className={`navbar-language-icon ${isHovered ? 'navbar-language-icon--colored' : 'navbar-language-icon--gray'}`}
          onError={(e) => { e.currentTarget.src = "/flags/4x3/optimized/gb.svg"; }}
        />
      </button>
      
      {isDropdownOpen && (
        <div className="language-dropdown">
          {/* First row: Search input */}
          <div className="language-search-row">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search language..."
              className="language-search"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
          </div>
          
          {/* Debug output */}
          <div style={{padding: '8px', backgroundColor: '#f0f0f0', color: '#333', fontSize: '12px'}}>
            Found {languages.length} languages | Displaying {dropdownItems.length} items
          </div>
          
          {isLoading ? (
            <div className="language-loading">Loading languages...</div>
          ) : languages.length === 0 ? (
            <div className="language-empty">No languages loaded</div>
          ) : (
            <div style={{maxHeight: '300px', overflow: 'auto'}}>
              {/* Show first 10 languages for debugging */}
              {languages.slice(0, 10).map(lang => (
                <div 
                  key={lang.code} 
                  style={{
                    padding: '8px', 
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleSelectLanguage(lang.code)}
                >
                  <img 
                    src={lang.flag_url || `/flags/4x3/optimized/${lang.code.toLowerCase()}.svg`}
                    alt={lang.code} 
                    style={{width: '20px', height: '20px', marginRight: '8px'}}
                  />
                  <span style={{fontWeight: lang.code === primaryLang ? 'bold' : 'normal'}}>
                    {lang.code}: {lang.native_name}
                  </span>
                </div>
              ))}
              
              {/* Show a message if there are more languages */}
              {languages.length > 10 && (
                <div style={{padding: '8px', textAlign: 'center', color: '#666'}}>
                  ...and {languages.length - 10} more languages
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NavbarLanguage;