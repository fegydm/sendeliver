import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { BaseDropdown } from "@/components/elements/BaseDropdown";
import { useLanguage } from "@/hooks/useLanguage";
import { useLanguagesPreload } from "@/hooks/useLanguagesPreload";
import type { Language } from "@/types/language.types";
import "./navbar.component.css";

const NavbarLanguage: React.FC = () => {
  const [codeSearch, setCodeSearch] = useState("");
  const [nameSearch, setNameSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const componentRef = useRef<HTMLDivElement>(null);
  const codeInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  
  const { 
    currentLanguageId,
    secondaryLanguageId,
    changeLanguage,
    setSecondaryLanguageCode,
    currentLanguageCode,
    secondaryLanguageCode
  } = useLanguage();
  
  const { 
    languages, 
    isLoading, 
    error,
    getFlagUrl,
    getLanguageById,
    loadAllLanguages
  } = useLanguagesPreload({
    enabled: true,
    priority: true
  });

  const getIpBasedLanguage = useCallback(() => 'sk', []);

  const dropdownItems = useMemo(() => {
    if (!languages.length && !isLoading) return [];

    const result: Array<Language & { isPrimary?: boolean; isSecondary?: boolean; isDefault?: boolean }> = [];
    const currentLang = getLanguageById(currentLanguageId) || getLanguageById(1); // Fallback na EN (id: 1)
    const secondaryLang = secondaryLanguageId ? getLanguageById(secondaryLanguageId) : null;
    const enLang = getLanguageById(1); // English (id: 1)

    if (currentLang) {
      result.push({ ...currentLang, isPrimary: true });
    }

    if (secondaryLang && secondaryLang.id !== currentLang?.id) {
      result.push({ ...secondaryLang, isSecondary: true });
    }

    if (enLang && enLang.id !== currentLang?.id && enLang.id !== secondaryLang?.id) {
      result.push({ ...enLang, isDefault: true });
    }

    const otherLanguages = languages
      .filter(lang => 
        lang.id !== currentLang?.id &&
        lang.id !== secondaryLang?.id &&
        lang.id !== enLang?.id
      )
      .sort((a, b) => (a.lc || '').localeCompare(b.lc || ''));

    result.push(...otherLanguages);
    return result;
  }, [languages, currentLanguageId, secondaryLanguageId, getLanguageById, isLoading]);

  const filteredLanguages = useMemo(() => {
    if (!codeSearch && !nameSearch) return dropdownItems;

    return dropdownItems.filter(lang => {
      const lowerCodeSearch = codeSearch.toLowerCase();
      const lowerNameSearch = nameSearch.toLowerCase();

      const matchesCode = !lowerCodeSearch || 
        (lang.cc?.toLowerCase() || '').startsWith(lowerCodeSearch) || 
        (lang.lc?.toLowerCase() || '').startsWith(lowerCodeSearch);

      const matchesName = !lowerNameSearch || 
        (lang.name_en?.toLowerCase() || '').includes(lowerNameSearch) || 
        (lang.native_name?.toLowerCase() || '').includes(lowerNameSearch);

      return matchesCode && matchesName;
    });
  }, [dropdownItems, codeSearch, nameSearch]);

  useEffect(() => {
    if (isDropdownOpen && languages.length === 0 && !isLoading) {
      loadAllLanguages();
    }
  }, [isDropdownOpen, languages.length, loadAllLanguages, isLoading]);

  const handleSelectLanguage = useCallback((language: Language) => {
    const newLanguageId = language.id;
    if (newLanguageId === currentLanguageId) return;

    console.log('[NavbarLanguage] Selecting language ID:', newLanguageId); // Debug
    changeLanguage(newLanguageId); // Používame ID namiesto cc
    
    if (newLanguageId === secondaryLanguageId) {
      setSecondaryLanguageCode(currentLanguageCode || null); // Swap s aktuálnym
    } else {
      setSecondaryLanguageCode(currentLanguageCode || null);
    }
    
    setIsDropdownOpen(false);
    setCodeSearch("");
    setNameSearch("");
  }, [currentLanguageId, secondaryLanguageId, currentLanguageCode, changeLanguage, setSecondaryLanguageCode]);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (componentRef.current && !componentRef.current.contains(event.target as Node)) {
      setIsDropdownOpen(false);
      setCodeSearch("");
      setNameSearch("");
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  const getCurrentFlag = useCallback(() => {
    const currentLang = getLanguageById(currentLanguageId);
    console.log('[NavbarLanguage] Current flag for ID:', currentLanguageId, 'Code:', currentLang?.cc); // Debug
    return getFlagUrl(currentLang?.cc || 'GB');
  }, [currentLanguageId, getFlagUrl, getLanguageById]);

  const getCurrentLc = useCallback(() => {
    const currentLang = getLanguageById(currentLanguageId);
    console.log('[NavbarLanguage] Current lc:', currentLang?.lc || 'en'); // Debug
    return currentLang?.lc || 'en';
  }, [currentLanguageId, getLanguageById]);

  const toggleDropdown = useCallback(() => {
    setIsDropdownOpen(prev => !prev);
    if (!isDropdownOpen) {
      setTimeout(() => codeInputRef.current?.focus(), 50);
    } else {
      setCodeSearch("");
      setNameSearch("");
    }
  }, [isDropdownOpen]);

  const handleCodeSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    if (value.length <= 2) setCodeSearch(value);
  }, []);

  const handleCodeSearchKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsDropdownOpen(false);
      setCodeSearch("");
      setNameSearch("");
    } else if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      nameInputRef.current?.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const firstItem = document.querySelector('.navbar-language-dropdown .dropdown__item') as HTMLElement;
      firstItem?.focus();
    }
  }, []);

  const handleNameSearchKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsDropdownOpen(false);
      setCodeSearch("");
      setNameSearch("");
    } else if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault();
      codeInputRef.current?.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const firstItem = document.querySelector('.navbar-language-dropdown .dropdown__item') as HTMLElement;
      firstItem?.focus();
    }
  }, []);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  const renderLanguageItem = useCallback((
    language: Language & { isPrimary?: boolean; isSecondary?: boolean; isDefault?: boolean },
    meta: { isHighlighted: boolean }
  ) => {
    const { isHighlighted } = meta;
    const { cc = 'UNKNOWN', name_en = 'Unknown', native_name = 'Unknown', lc = 'unknown', isPrimary, isSecondary, isDefault } = language;
    const isCurrent = language.id === currentLanguageId;

    return (
      <div 
        className={`navbar-language-item ${isHighlighted ? 'navbar-language-item--highlighted' : ''} ${isPrimary ? 'navbar-language-item--primary' : ''} ${isSecondary ? 'navbar-language-item--secondary' : ''} ${isDefault ? 'navbar-language-item--default' : ''}`}
      >
        <img 
          src={getFlagUrl(cc)}
          alt={`${cc} flag`}
          className={`navbar-language-item-flag ${isCurrent ? 'navbar-language-item-flag--grayscale' : ''}`}
          onError={(e) => { e.currentTarget.src = getFlagUrl('gb'); }}
        />
        <span className="navbar-language-item-code">{cc}</span>
        <span className="navbar-language-item-lc">{lc}</span>
        <span className="navbar-language-item-name">{name_en}</span>
        <span className="navbar-language-item-native">{native_name}</span>
      </div>
    );
  }, [getFlagUrl, currentLanguageId]);

  const handleDropdownKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      setIsDropdownOpen(false);
      setCodeSearch("");
      setNameSearch("");
    }
  }, []);

  const getItemKey = useCallback((item: Language) => {
    return String(item.id ?? `${item.cc || 'UNKNOWN'}-${item.name_en || 'unnamed'}`);
  }, []);

  const shouldRenderDivider = useCallback((index: number) => {
    const priorityGroup1Length = (secondaryLanguageId ? 2 : 1) + (dropdownItems.some(lang => lang.isDefault) ? 1 : 0);
    return index === priorityGroup1Length - 1;
  }, [secondaryLanguageId, dropdownItems]);

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
        <img 
          src={getCurrentFlag()} 
          alt={`${currentLanguageCode || 'en'} flag`} 
          className="navbar-language-flag navbar-language-flag--grayscale"
          onError={(e) => { e.currentTarget.src = getFlagUrl('gb'); }}
        />
        <span className="navbar-language-lc">{getCurrentLc()}</span>
      </button>
      
      {isDropdownOpen && (
        <div className="navbar-language-dropdown-container">
          <div className="navbar-language-search-row">
            <div className="navbar-language-code-search-container">
              <input
                ref={codeInputRef}
                type="text"
                placeholder="CC"
                className="navbar-language-code-search"
                value={codeSearch}
                onChange={handleCodeSearchChange}
                onKeyDown={handleCodeSearchKeyDown}
                maxLength={2}
                autoFocus
              />
            </div>
            <div className="navbar-language-name-search-container">
              <input
                ref={nameInputRef}
                type="text"
                placeholder="Search language..."
                className="navbar-language-name-search"
                value={nameSearch}
                onChange={(e) => setNameSearch(e.target.value)}
                onKeyDown={handleNameSearchKeyDown}
              />
            </div>
          </div>
          
          {isLoading ? (
            <div className="navbar-language-loading">Loading languages...</div>
          ) : error ? (
            <div className="navbar-language-empty">Error: {error.message}</div>
          ) : filteredLanguages.length === 0 ? (
            <div className="navbar-language-empty">No languages match your search</div>
          ) : (
            <BaseDropdown
              items={filteredLanguages}
              isOpen={true}
              onSelect={handleSelectLanguage}
              renderItem={renderLanguageItem}
              className="navbar-language-dropdown"
              position="right"
              onKeyDown={handleDropdownKeyDown}
              getItemKey={getItemKey}
              ariaLabel="Select language"
              shouldRenderDivider={shouldRenderDivider}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default NavbarLanguage;