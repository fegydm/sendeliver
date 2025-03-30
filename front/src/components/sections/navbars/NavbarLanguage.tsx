// File: ./front/src/components/navbars/NavbarLanguage.tsx
// Last change: Updated to use optimizedUseLanguage hook with improved caching

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { BaseDropdown } from "@/components/elements/BaseDropdown";
import { useLanguage } from "@/hooks/optimizedUseLanguage"; // Changed import to optimized version
import { useLanguagesPreload } from "@/hooks/useLanguagesPreload";
import type { Language } from "@/types/language.types";
import "./navbar.component.css";

const NavbarLanguage: React.FC = () => {
  const [filterValue, setFilterValue] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const componentRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Updated to use new hook properties
  const { 
    currentLanguageCode: currentLanguage, 
    secondaryLanguageCode: secondaryLanguage,
    changeLanguage,
    setSecondaryLanguage,
    isLoading: translationsLoading
  } = useLanguage();
  
  const { languages, isLoading, getFlagUrl } = useLanguagesPreload();

  const primaryLang = currentLanguage || 'en';
  const secondaryLang = secondaryLanguage || 'sk';

  const filteredLanguages = useMemo(() => {
    if (!languages || !Array.isArray(languages)) return [];
    if (!filterValue) return languages;
    return languages.filter(lang => 
      lang.cc.toLowerCase().includes(filterValue.toLowerCase()) || 
      lang.name_en.toLowerCase().includes(filterValue.toLowerCase()) || 
      lang.native_name.toLowerCase().includes(filterValue.toLowerCase())
    );
  }, [languages, filterValue]);
  
  const dropdownItems = useMemo(() => {
    if (!languages || !Array.isArray(languages)) return [];
    const primaryLanguage = languages.find(lang => lang.cc === primaryLang);
    const secondaryLanguage = languages.find(lang => lang.cc === secondaryLang);
    const otherLanguages = filteredLanguages.filter(
      lang => lang.cc !== primaryLang && lang.cc !== secondaryLang
    );
    
    const result: Array<Language & { isPrimary?: boolean; isSecondary?: boolean }> = [];
    
    if (primaryLanguage) result.push({ ...primaryLanguage, isPrimary: true });
    if (secondaryLanguage && secondaryLanguage.cc !== primaryLang) {
      result.push({ ...secondaryLanguage, isSecondary: true });
    }
    result.push(...otherLanguages);
    return result;
  }, [languages, primaryLang, secondaryLang, filteredLanguages]);

  // Updated to use new language setter functions
  const handleSelectLanguage = useCallback((language: Language, index: number) => {
    const cc = language.cc;
    if (cc === primaryLang) return;
    
    if (cc === secondaryLang) {
      // Will swap primary and secondary
      changeLanguage(cc);
    } else {
      // Set new primary, keep existing secondary
      changeLanguage(cc);
    }
    
    setIsDropdownOpen(false);
    setFilterValue("");
  }, [primaryLang, secondaryLang, changeLanguage]);

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

  const getCurrentFlag = useCallback(() => {
    return getFlagUrl(primaryLang);
  }, [primaryLang, getFlagUrl]);

  const toggleDropdown = useCallback(() => {
    setIsDropdownOpen(prev => !prev);
    if (!isDropdownOpen) searchInputRef.current?.focus();
    else setFilterValue("");
  }, [isDropdownOpen]);

  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsDropdownOpen(false);
      setFilterValue("");
    }
  }, []);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  const renderLanguageItem = useCallback((
    language: Language & { isPrimary?: boolean; isSecondary?: boolean },
    meta: { isHighlighted: boolean }
  ) => {
    const { isHighlighted } = meta;
    const { cc, native_name, isPrimary, isSecondary } = language;
    
    return (
      <div 
        className={`navbar-language-item ${isHighlighted ? 'navbar-language-item--highlighted' : ''} ${isPrimary ? 'navbar-language-item--primary' : ''} ${isSecondary ? 'navbar-language-item--secondary' : ''}`}
      >
        <img 
          src={getFlagUrl(cc)}
          alt={cc} 
          className="navbar-language-item-flag"
          onError={(e) => { e.currentTarget.src = getFlagUrl('gb'); }}
        />
        <span className="navbar-language-item-code">{cc}</span>
        <span className="navbar-language-item-name">{native_name}</span>
      </div>
    );
  }, [getFlagUrl]);

  const handleDropdownKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      setIsDropdownOpen(false);
      setFilterValue("");
    }
  }, []);

  const getItemKey = useCallback((item: Language) => item.cc, []);

  // Combined loading state from both hooks
  const isDataLoading = isLoading || translationsLoading;

  return (
    <div className="navbar-language-container" ref={componentRef}>
      <button 
        onClick={toggleDropdown} 
        className="navbar-language-button" 
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
          onError={(e) => { e.currentTarget.src = getFlagUrl('gb'); }}
        />
      </button>
      
      {isDropdownOpen && (
        <div className="navbar-language-dropdown-container">
          <div className="navbar-language-search-row">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search language..."
              className="navbar-language-search"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              autoFocus
            />
          </div>
          
          {isDataLoading ? (
            <div className="navbar-language-loading">Loading languages...</div>
          ) : languages.length === 0 ? (
            <div className="navbar-language-empty">No languages loaded</div>
          ) : (
            <BaseDropdown
              items={dropdownItems}
              isOpen={true}
              onSelect={handleSelectLanguage}
              renderItem={renderLanguageItem}
              className="navbar-language-dropdown"
              classNamePrefix="navbar-language"
              onKeyDown={handleDropdownKeyDown}
              getItemKey={getItemKey}
              ariaLabel="Select language"
              noResultsText="No languages match your search"
              autoFocusOnOpen={true}
              focusOnHover={true}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default NavbarLanguage;