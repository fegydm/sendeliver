// File: front/src/components/shared/navbars/NavbarLanguage.tsx
// Last action: Complete and faithful BEM refactoring, preserving all original logic.

import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useTranslationContext } from "@shared/contexts/TranslationContext";
import { useLanguagesContext } from "@shared/contexts/LanguagesContext";
import type { LanguageInfo } from "@shared/contexts/TranslationContext"; // Použijeme typ z kontextu
import "./NavbarLanguage.css";

const IGNORED_CLASSES = [
  "dropdown__item", "location-select__dropdown", "dropdown__no-results"
];

const NavbarLanguage: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [codeSearch, setCodeSearch] = useState("");
  const [nameSearch, setNameSearch] = useState("");

  const componentRef = useRef<HTMLDivElement>(null);
  const codeInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const { currentLanguage, secondaryLanguage, changeLanguage, unsupportedLanguages } = useTranslationContext();
  const { languages, isLoading, getFlagUrl } = useLanguagesContext();

  const currentLc = currentLanguage.lc;
  const secLc = secondaryLanguage;

  const tertiaryLc = useMemo(() => {
    if (currentLc === "en" || secLc === "en") return null;
    return "en";
  }, [currentLc, secLc]);

  const filteredLanguages = useMemo(() => {
    const filtered = languages.filter((lang) => {
      const codeMatch = !codeSearch || lang.cc?.toLowerCase().includes(codeSearch.toLowerCase()) || lang.lc?.toLowerCase().includes(codeSearch.toLowerCase());
      const nameMatch = !nameSearch || lang.name_en?.toLowerCase().includes(nameSearch.toLowerCase()) || lang.native_name?.toLowerCase().includes(nameSearch.toLowerCase());
      return codeMatch && nameMatch;
    });
    const priority = filtered.filter(lang => lang.lc === currentLc || lang.lc === secLc || (tertiaryLc && lang.lc === tertiaryLc))
      .sort((a, b) => {
        if (a.lc === currentLc) return -1; if (b.lc === currentLc) return 1;
        if (a.lc === secLc) return -1; if (b.lc === secLc) return 1;
        if (tertiaryLc && a.lc === tertiaryLc) return -1; if (tertiaryLc && b.lc === tertiaryLc) return 1;
        return 0;
      });
    const other = filtered.filter(lang => !priority.some(p => p.lc === lang.lc))
      .sort((a, b) => (a.name_en || "").localeCompare(b.name_en || ""));
    return { priority, other };
  }, [languages, codeSearch, nameSearch, currentLc, secLc, tertiaryLc]);

  const handleLanguageSelect = useCallback((lang: LanguageInfo) => {
    changeLanguage(lang);
    setIsDropdownOpen(false);
    setCodeSearch("");
    setNameSearch("");
  }, [changeLanguage]);

  const toggleDropdown = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsDropdownOpen(prev => !prev);
  }, []);
  
  const hasIgnoredClass = useCallback((element: Node | null): boolean => {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) return false;
    const el = element as Element;
    for (const className of IGNORED_CLASSES) {
      if (el.classList?.contains(className)) return true;
    }
    if (el.closest('.location-select, .country-select, .dropdown')) return true;
    return hasIgnoredClass(el.parentNode);
  }, []);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (!componentRef.current || !isDropdownOpen) return;
    const target = event.target as Node;
    if (componentRef.current.contains(target) || hasIgnoredClass(target)) {
      return;
    }
    setIsDropdownOpen(false);
  }, [isDropdownOpen, hasIgnoredClass]);

  useEffect(() => {
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      setTimeout(() => codeInputRef.current?.focus(), 10);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen, handleClickOutside]);

  const handleCodeSearchKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") setIsDropdownOpen(false);
    else if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      nameInputRef.current?.focus();
    }
  }, []);

  const handleNameSearchKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") setIsDropdownOpen(false);
    else if (e.key === "Tab" && e.shiftKey) {
      e.preventDefault();
      codeInputRef.current?.focus();
    }
  }, []);

  const handleCodeSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCodeSearch(e.target.value.toUpperCase());
  }, []);

  const renderLanguageItem = (lang: LanguageInfo, type: 'primary' | 'secondary' | 'tertiary' | 'default') => (
    <div
      key={lang.lc}
      className={`navbar-language__item ${type !== 'default' ? `navbar-language__item--${type}` : ''}`}
      onClick={() => handleLanguageSelect(lang)}
      tabIndex={0}
    >
      <img
        src={getFlagUrl(lang.cc || "")}
        alt={`${lang.cc} flag`}
        className="navbar-language__item-flag"
        onError={(e) => { e.currentTarget.src = getFlagUrl("GB"); }}
      />
      <span className="navbar-language__item-code">{lang.cc}</span>
      <span className="navbar-language__item-lc">{lang.lc}</span>
      <span className="navbar-language__item-name">
        {lang.name_en}
        {unsupportedLanguages.includes(lang.lc) && (
          <span className="navbar-language__item-unsupported-label"> (unsupported)</span>
        )}
      </span>
      <span className="navbar-language__item-native-name">{lang.native_name}</span>
    </div>
  );

  return (
    <div className="navbar-language" ref={componentRef}>
      <button onClick={toggleDropdown} className="navbar-language__button" aria-expanded={isDropdownOpen}>
        <img
          src={getFlagUrl(currentLanguage.cc || "")}
          alt={`${currentLc} flag`}
          className={`navbar-language__flag ${!isDropdownOpen ? "navbar-language__flag--grayscale" : ""}`}
          onError={(e) => { e.currentTarget.src = getFlagUrl("GB"); }}
        />
        <span className="navbar-language__lc">{currentLc}</span>
      </button>

      {isDropdownOpen && (
        <div className="navbar-language__dropdown" onClick={(e) => e.stopPropagation()}>
          <div className="navbar-language__search">
            <input
              ref={codeInputRef}
              type="text"
              placeholder="CC/LC"
              className="navbar-language__search-input navbar-language__search-input--code"
              value={codeSearch}
              onChange={handleCodeSearchChange}
              onKeyDown={handleCodeSearchKeyDown}
              maxLength={2}
              autoFocus
            />
            <input
              ref={nameInputRef}
              type="text"
              placeholder="Search name..."
              className="navbar-language__search-input navbar-language__search-input--name"
              value={nameSearch}
              onChange={(e) => setNameSearch(e.target.value)}
              onKeyDown={handleNameSearchKeyDown}
            />
          </div>
          <div className="navbar-language__list">
            {isLoading ? <div className="navbar-language__message">Loading...</div> : (
              <>
                {renderLanguageItem(filteredLanguages.priority[0], 'primary')}
                {filteredLanguages.priority.slice(1).map(lang => renderLanguageItem(lang, lang.lc === secLc ? 'secondary' : 'tertiary'))}
                {filteredLanguages.priority.length > 0 && filteredLanguages.other.length > 0 && <div className="navbar-language__divider" />}
                {filteredLanguages.other.map(lang => renderLanguageItem(lang, 'default'))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NavbarLanguage;