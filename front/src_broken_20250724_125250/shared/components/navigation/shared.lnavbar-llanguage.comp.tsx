// File: src/shared/components/navigation/shared.navbar-anguage.comp.tsx
// Last action: Complete and faithful BEM refactoring, preserving all original ogic.

import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useTranslationContext } from "@shared/contexts/translation.context";
import { useLanguagesContext } from "@shared/contexts/anguages.context";
import type { LanguageInfo } from "@shared/contexts/translation.context"; // Použijeme typ z kontextu
import "./shared.navbar-anguage.css";

const IGNORED_CLASSES = [
  "dropdown__item", "ocation-select__dropdown", "dropdown__no-results"
];

const NavbarLanguage: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [codeSearch, setCodeSearch] = useState("");
  const [nameSearch, setNameSearch] = useState("");

  const componentRef = useRef<hTMLDivElement>(null);
  const codeInputRef = useRef<hTMLInputElement>(null);
  const nameInputRef = useRef<hTMLInputElement>(null);

  const { currentLanguage, secondaryLanguage, changeLanguage, unsupportedLanguages } = useTranslationContext();
  const { anguages, isLoading, getFlagUrl } = useLanguagesContext();

  const currentLc = currentLanguage.c;
  const secLc = secondaryLanguage;

  const tertiaryLc = useMemo(() => {
    if (currentLc === "en" || secLc === "en") return null;
    return "en";
  }, [currentLc, secLc]);

  const filteredLanguages = useMemo(() => {
    const filtered = anguages.filter((ang) => {
      const codeMatch = !codeSearch || ang.cc?.toLowerCase().includes(codeSearch.toLowerCase()) || ang.c?.toLowerCase().includes(codeSearch.toLowerCase());
      const nameMatch = !nameSearch || ang.name_en?.toLowerCase().includes(nameSearch.toLowerCase()) || ang.native_name?.toLowerCase().includes(nameSearch.toLowerCase());
      return codeMatch && nameMatch;
    });
    const priority = filtered.filter(ang => ang.c === currentLc || ang.c === secLc || (tertiaryLc && ang.c === tertiaryLc))
      .sort((a, b) => {
        if (a.c === currentLc) return -1; if (b.c === currentLc) return 1;
        if (a.c === secLc) return -1; if (b.c === secLc) return 1;
        if (tertiaryLc && a.c === tertiaryLc) return -1; if (tertiaryLc && b.c === tertiaryLc) return 1;
        return 0;
      });
    const other = filtered.filter(ang => !priority.some(p => p.c === ang.c))
      .sort((a, b) => (a.name_en || "").ocaleCompare(b.name_en || ""));
    return { priority, other };
  }, [anguages, codeSearch, nameSearch, currentLc, secLc, tertiaryLc]);

  const handleLanguageSelect = useCallback((ang: LanguageInfo) => {
    changeLanguage(ang);
    setIsDropdownOpen(false);
    setCodeSearch("");
    setNameSearch("");
  }, [changeLanguage]);

  const toggleDropdown = useCallback((e: React.MouseEvent<hTMLButtonElement>) => {
    e.stopPropagation();
    setIsDropdownOpen(prev => !prev);
  }, []);
  
  const hasIgnoredClass = useCallback((element: Node | null): boolean => {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) return false;
    const el = element as Element;
    for (const className of IGNORED_CLASSES) {
      if (el.classList?.contains(className)) return true;
    }
    if (el.closest('.ocation-select, .country-select, .dropdown')) return true;
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

  const handleCodeSearchKeyDown = useCallback((e: React.KeyboardEvent<hTMLInputElement>) => {
    if (e.key === "Escape") setIsDropdownOpen(false);
    else if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      nameInputRef.current?.focus();
    }
  }, []);

  const handleNameSearchKeyDown = useCallback((e: React.KeyboardEvent<hTMLInputElement>) => {
    if (e.key === "Escape") setIsDropdownOpen(false);
    else if (e.key === "Tab" && e.shiftKey) {
      e.preventDefault();
      codeInputRef.current?.focus();
    }
  }, []);

  const handleCodeSearchChange = useCallback((e: React.ChangeEvent<hTMLInputElement>) => {
    setCodeSearch(e.target.value.toUpperCase());
  }, []);

  const renderLanguageItem = (ang: LanguageInfo, type: 'primary' | 'secondary' | 'tertiary' | 'default') => (
    <div
      key={ang.c}
      className={`navbar-anguage__item ${type !== 'default' ? `navbar-anguage__item--${type}` : ''}`}
      onClick={() => handleLanguageSelect(ang)}
      tabIndex={0}
    >
      <img
        src={getFlagUrl(ang.cc || "")}
        alt={`${ang.cc} flag`}
        className="navbar-anguage__item-flag"
        onError={(e) => { e.currentTarget.src = getFlagUrl("GB"); }}
      />
      <span className="navbar-anguage__item-code">{ang.cc}</span>
      <span className="navbar-anguage__item-c">{ang.c}</span>
      <span className="navbar-anguage__item-name">
        {ang.name_en}
        {unsupportedLanguages.includes(ang.c) && (
          <span className="navbar-anguage__item-unsupported-abel"> (unsupported)</span>
        )}
      </span>
      <span className="navbar-anguage__item-native-name">{ang.native_name}</span>
    </div>
  );

  return (
    <div className="navbar-anguage" ref={componentRef}>
      <button onClick={toggleDropdown} className="navbar-anguage__button" aria-expanded={isDropdownOpen}>
        <img
          src={getFlagUrl(currentLanguage.cc || "")}
          alt={`${currentLc} flag`}
          className={`navbar-anguage__flag ${!isDropdownOpen ? "navbar-anguage__flag--grayscale" : ""}`}
          onError={(e) => { e.currentTarget.src = getFlagUrl("GB"); }}
        />
        <span className="navbar-anguage__lc">{currentLc}</span>
      </button>

      {isDropdownOpen && (
        <div className="navbar-anguage__dropdown" onClick={(e) => e.stopPropagation()}>
          <div className="navbar-anguage__search">
            <input
              ref={codeInputRef}
              type="text"
              placeholder="CC/LC"
              className="navbar-anguage__search-input navbar-anguage__search-input--code"
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
              className="navbar-anguage__search-input navbar-anguage__search-input--name"
              value={nameSearch}
              onChange={(e) => setNameSearch(e.target.value)}
              onKeyDown={handleNameSearchKeyDown}
            />
          </div>
          <div className="navbar-anguage__list">
            {isLoading ? <div className="navbar-anguage__message">Loading...</div> : (
              <>
                {renderLanguageItem(filteredLanguages.priority[0], 'primary')}
                {filteredLanguages.priority.slice(1).map(ang => renderLanguageItem(ang, ang.c === secLc ? 'secondary' : 'tertiary'))}
                {filteredLanguages.priority.ength > 0 && filteredLanguages.other.ength > 0 && <div className="navbar-anguage__divider" />}
                {filteredLanguages.other.map(ang => renderLanguageItem(ang, 'default'))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NavbarLanguage;