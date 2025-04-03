// File: src/components/sections/navbars/NavbarLanguage.tsx
// Last change: Fixed flag display for all selected languages

import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { useLanguagesPreload } from "@/hooks/useLanguagesPreload";
import type { Language } from "@/types/language.types";
import "./navbar.component.css";

const NavbarLanguage: React.FC = () => {
  // States for the component
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [codeSearch, setCodeSearch] = useState("");
  const [nameSearch, setNameSearch] = useState("");
  
  const componentRef = useRef<HTMLDivElement>(null);
  const codeInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Get language data from hooks
  const { 
    currentLc,
    secondaryLc,
    changeLanguage
  } = useLanguage();
  
  // Calculate tertiary language (English if neither primary nor secondary is English)
  const tertiaryLc = useMemo(() => {
    if (currentLc === 'en' || secondaryLc === 'en') return null;
    return 'en';
  }, [currentLc, secondaryLc]);
  
  const {
    languages,
    isLoading,
    getFlagUrl
  } = useLanguagesPreload();

  // Current language object from the list
  const currentLanguage = useMemo(() => {
    // Try to find the exact language object for current language code
    const exactMatch = languages.find(lang => lang.lc === currentLc);
    if (exactMatch) return exactMatch;
    
    // If not found, find English as fallback
    return languages.find(lang => lang.lc === 'en') || 
           { lc: 'en', cc: 'GB', name_en: 'English', native_name: 'English', is_rtl: false, id: 1 };
  }, [languages, currentLc]);

  // Group languages by priority
  const groupedLanguages = useMemo(() => {
    // Create two groups - priority and other
    const priorityLangs: Language[] = [];
    const otherLangs: Language[] = [];
    
    // Filter languages
    languages.forEach(lang => {
      if (lang.lc === currentLc || lang.lc === secondaryLc || (tertiaryLc && lang.lc === tertiaryLc)) {
        priorityLangs.push(lang);
      } else {
        otherLangs.push(lang);
      }
    });
    
    // Sort priority languages
    priorityLangs.sort((a, b) => {
      if (a.lc === currentLc) return -1;
      if (b.lc === currentLc) return 1;
      if (a.lc === secondaryLc) return -1;
      if (b.lc === secondaryLc) return 1;
      if (tertiaryLc && a.lc === tertiaryLc) return -1;
      if (tertiaryLc && b.lc === tertiaryLc) return 1;
      return 0;
    });
    
    // Sort other languages alphabetically
    otherLangs.sort((a, b) => a.name_en.localeCompare(b.name_en));
    
    return { priorityLangs, otherLangs };
  }, [languages, currentLc, secondaryLc, tertiaryLc]);

  // Filter languages based on both search terms
  const filteredLanguages = useMemo(() => {
    const filtered = languages.filter(lang => {
      // Code search (cc and lc)
      const codeMatch = !codeSearch || 
        lang.cc.toLowerCase().includes(codeSearch.toLowerCase()) || 
        lang.lc.toLowerCase().includes(codeSearch.toLowerCase());
      
      // Name search (name_en and native_name)
      const nameMatch = !nameSearch || 
        lang.name_en.toLowerCase().includes(nameSearch.toLowerCase()) || 
        lang.native_name.toLowerCase().includes(nameSearch.toLowerCase());
      
      return codeMatch && nameMatch;
    });
    
    // Sort into priority and other
    const priorityFiltered = filtered.filter(lang => 
      lang.lc === currentLc || 
      lang.lc === secondaryLc || 
      (tertiaryLc && lang.lc === tertiaryLc)
    ).sort((a, b) => {
      if (a.lc === currentLc) return -1;
      if (b.lc === currentLc) return 1;
      if (a.lc === secondaryLc) return -1;
      if (b.lc === secondaryLc) return 1;
      if (tertiaryLc && a.lc === tertiaryLc) return -1;
      if (tertiaryLc && b.lc === tertiaryLc) return 1;
      return 0;
    });
    
    const otherFiltered = filtered.filter(lang => 
      lang.lc !== currentLc && 
      lang.lc !== secondaryLc && 
      !(tertiaryLc && lang.lc === tertiaryLc)
    ).sort((a, b) => a.name_en.localeCompare(b.name_en));
    
    return { priorityFiltered, otherFiltered };
  }, [languages, codeSearch, nameSearch, currentLc, secondaryLc, tertiaryLc]);

  // Handle language selection
  const handleLanguageSelect = useCallback((lang: Language) => {
    // Use the language code from the selected language
    changeLanguage(lang.lc);
    setIsDropdownOpen(false);
    setCodeSearch("");
    setNameSearch("");
  }, [changeLanguage]);

  // Toggle dropdown
  const toggleDropdown = useCallback(() => {
    setIsDropdownOpen(prev => !prev);
    
    // Focus code input when opening
    if (!isDropdownOpen) {
      setTimeout(() => codeInputRef.current?.focus(), 10);
    } else {
      setCodeSearch("");
      setNameSearch("");
    }
  }, [isDropdownOpen]);

  // Handle click outside
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (componentRef.current && !componentRef.current.contains(event.target as Node)) {
      setIsDropdownOpen(false);
      setCodeSearch("");
      setNameSearch("");
    }
  }, []);

  // Setup event listeners
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  // Handle key press in code search
  const handleCodeSearchKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsDropdownOpen(false);
      setCodeSearch("");
      setNameSearch("");
    } else if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      nameInputRef.current?.focus();
    }
  }, []);

  // Handle key press in name search
  const handleNameSearchKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsDropdownOpen(false);
      setCodeSearch("");
      setNameSearch("");
    } else if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault();
      codeInputRef.current?.focus();
    }
  }, []);

  // Handle code search change (uppercase conversion)
  const handleCodeSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCodeSearch(e.target.value.toUpperCase());
  }, []);

  // Render the language items
  const renderLanguageItems = () => {
    const { priorityFiltered, otherFiltered } = filteredLanguages;
    const allEmpty = priorityFiltered.length === 0 && otherFiltered.length === 0;
    
    if (isLoading) {
      return <div className="navbar-language-loading">Loading...</div>;
    }
    
    if (allEmpty) {
      return <div className="navbar-language-empty">No languages found</div>;
    }
    
    return (
      <>
        {/* Priority languages section */}
        {priorityFiltered.map(lang => (
          <div 
            key={lang.id || lang.lc}
            className={`navbar-language-item ${lang.lc === currentLc ? 'navbar-language-item--primary' : ''} ${lang.lc === secondaryLc ? 'navbar-language-item--secondary' : ''} ${tertiaryLc && lang.lc === tertiaryLc ? 'navbar-language-item--tertiary' : ''}`}
            onClick={() => handleLanguageSelect(lang)}
            tabIndex={0}
            role="option"
            aria-selected={lang.lc === currentLc}
          >
            <img 
              src={getFlagUrl(lang.cc)} 
              alt={`${lang.cc} flag`}
              className={`navbar-language-item-flag ${lang.lc === currentLc ? 'navbar-language-item-flag--grayscale' : ''}`}
              onError={(e) => { e.currentTarget.src = getFlagUrl('GB'); }}
            />
            <span className="navbar-language-item-code">{lang.cc}</span>
            <span className="navbar-language-item-lc">{lang.lc}</span>
            <span className="navbar-language-item-name">{lang.name_en}</span>
            <span className="navbar-language-item-native">{lang.native_name}</span>
          </div>
        ))}
        
        {/* Divider if there are both priority and other languages */}
        {priorityFiltered.length > 0 && otherFiltered.length > 0 && (
          <div className="navbar-language-divider"></div>
        )}
        
        {/* Other languages section */}
        {otherFiltered.map(lang => (
          <div 
            key={lang.id || lang.lc}
            className="navbar-language-item"
            onClick={() => handleLanguageSelect(lang)}
            tabIndex={0}
            role="option"
            aria-selected={false}
          >
            <img 
              src={getFlagUrl(lang.cc)} 
              alt={`${lang.cc} flag`}
              className="navbar-language-item-flag"
              onError={(e) => { e.currentTarget.src = getFlagUrl('GB'); }}
            />
            <span className="navbar-language-item-code">{lang.cc}</span>
            <span className="navbar-language-item-lc">{lang.lc}</span>
            <span className="navbar-language-item-name">{lang.name_en}</span>
            <span className="navbar-language-item-native">{lang.native_name}</span>
          </div>
        ))}
      </>
    );
  };

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
          className="navbar-language-flag navbar-language-flag--grayscale"
          onError={(e) => { e.currentTarget.src = getFlagUrl('GB'); }}
        />
        <span className="navbar-language-lc">{currentLanguage.lc}</span>
      </button>
      
      {isDropdownOpen && (
        <div className="navbar-language-dropdown-container">
          <div className="navbar-language-search-row">
            <div className="navbar-language-code-search-container">
              <input
                ref={codeInputRef}
                type="text"
                placeholder="CC/LC"
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
                placeholder="Search name..."
                className="navbar-language-name-search"
                value={nameSearch}
                onChange={(e) => setNameSearch(e.target.value)}
                onKeyDown={handleNameSearchKeyDown}
              />
            </div>
          </div>
          
          <div className="navbar-language-dropdown">
            {renderLanguageItems()}
          </div>
        </div>
      )}
    </div>
  );
};

export default NavbarLanguage;