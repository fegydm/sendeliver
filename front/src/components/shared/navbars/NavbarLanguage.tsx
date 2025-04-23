// File: ./front/src/components/sections/navbars/NavbarLanguage.tsx
// Last change: Fixed dropdown interference with other components

import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useTranslationContext } from "@/contexts/TranslationContext";
import { useLanguagesContext } from "@/contexts/LanguagesContext";
import type { Language } from "@/types/language.types";
import "./navbar.component.css";

// Classes to ignore in click outside detection
const IGNORED_CLASSES = [
  "dropdown__item",
  "dropdown__item-city",
  "dropdown__item-postal",
  "dropdown__item-code",
  "dropdown__item-flag",
  "dropdown__item-details",
  "location-select__dropdown",
  "dropdown__no-results"
];

const NavbarLanguage: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [codeSearch, setCodeSearch] = useState("");
  const [nameSearch, setNameSearch] = useState("");

  const componentRef = useRef<HTMLDivElement>(null);
  const codeInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const { currentLanguage, secondaryLanguage, changeLanguage, unsupportedLanguages } = useTranslationContext();
  const currentLc = currentLanguage.lc;
  const secLc = secondaryLanguage;

  const tertiaryLc = useMemo(() => {
    if (currentLc === "en" || secLc === "en") return null;
    return "en";
  }, [currentLc, secLc]);

  const { languages, isLoading, getFlagUrl } = useLanguagesContext();

  const filteredLanguages = useMemo(() => {
    const filtered = languages.filter((lang) => {
      const codeMatch =
        !codeSearch ||
        (lang.cc?.toLowerCase().includes(codeSearch.toLowerCase()) ||
          lang.lc?.toLowerCase().includes(codeSearch.toLowerCase()));
      const nameMatch =
        !nameSearch ||
        (lang.name_en?.toLowerCase().includes(nameSearch.toLowerCase()) ||
          lang.native_name?.toLowerCase().includes(nameSearch.toLowerCase()));
      return codeMatch && nameMatch;
    });

    const priorityFiltered = filtered
      .filter(
        (lang) =>
          lang.lc === currentLc ||
          lang.lc === secLc ||
          (tertiaryLc && lang.lc === tertiaryLc)
      )
      .sort((a, b) => {
        if (a.lc === currentLc) return -1;
        if (b.lc === currentLc) return 1;
        if (a.lc === secLc) return -1;
        if (b.lc === secLc) return 1;
        if (tertiaryLc && a.lc === tertiaryLc) return -1;
        if (tertiaryLc && b.lc === tertiaryLc) return 1;
        return 0;
      });

    const otherFiltered = filtered
      .filter(
        (lang) =>
          lang.lc !== currentLc &&
          lang.lc !== secLc &&
          !(tertiaryLc && lang.lc === tertiaryLc)
      )
      .sort((a, b) => (a.name_en || "").localeCompare(b.name_en || ""));
    return { priorityFiltered, otherFiltered };
  }, [languages, codeSearch, nameSearch, currentLc, secLc, tertiaryLc]);

  const handleLanguageSelect = useCallback(
    (lang: Language) => {
      changeLanguage(lang);
      setIsDropdownOpen(false);
      setCodeSearch("");
      setNameSearch("");
    },
    [changeLanguage]
  );

  const toggleDropdown = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsDropdownOpen((prev) => {
      const newState = !prev;
      return newState;
    });
    if (!isDropdownOpen) {
      setTimeout(() => {
        codeInputRef.current?.focus();
      }, 10);
    } else {
      setCodeSearch("");
      setNameSearch("");
    }
  }, [isDropdownOpen]);

  // Helper function to check if an element or its parents have any of the ignored classes
  const hasIgnoredClass = useCallback((element: Node | null): boolean => {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) return false;
    
    const el = element as Element;
    
    // Check if the element has any of the ignored classes
    for (const className of IGNORED_CLASSES) {
      if (el.classList && el.classList.contains(className)) {
        return true;
      }
    }
    
    // Check data attributes that might indicate a dropdown component
    if (el.hasAttribute('aria-controls') && el.getAttribute('aria-controls')?.includes('dropdown')) {
      return true;
    }
    
    // Check if the element is inside a dropdown container
    if (el.closest('.location-select') || el.closest('.country-select') || el.closest('.dropdown')) {
      return true;
    }
    
    // Recursively check parent
    return hasIgnoredClass(el.parentNode);
  }, []);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    // If dropdown isn't open, do nothing
    if (!componentRef.current || !isDropdownOpen) return;
    
    const target = event.target as Node;
    
    // If click is inside our component, do nothing
    if (componentRef.current.contains(target)) {
      return;
    }
    
    // Check if the clicked element is in our ignore list
    if (hasIgnoredClass(target)) {
      // Skip handling for elements related to other dropdowns
      return;
    }
    
    // Otherwise close the dropdown
    setIsDropdownOpen(false);
    setCodeSearch("");
    setNameSearch("");
  }, [isDropdownOpen, hasIgnoredClass]);

  useEffect(() => {
    // Only add listener if dropdown is open
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [handleClickOutside, isDropdownOpen]);

  const handleCodeSearchKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsDropdownOpen(false);
      setCodeSearch("");
      setNameSearch("");
    } else if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      nameInputRef.current?.focus();
    }
  }, []);

  const handleNameSearchKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsDropdownOpen(false);
      setCodeSearch("");
      setNameSearch("");
    } else if (e.key === "Tab" && e.shiftKey) {
      e.preventDefault();
      codeInputRef.current?.focus();
    }
  }, []);

  const handleCodeSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCodeSearch(e.target.value.toUpperCase());
  }, []);

  const renderLanguageItems = () => {
    const { priorityFiltered, otherFiltered } = filteredLanguages;
    if (isLoading) {
      return <div className="navbar-language-loading">Loading...</div>;
    }
    if (priorityFiltered.length === 0 && otherFiltered.length === 0) {
      return <div className="navbar-language-empty">No languages found</div>;
    }
    return (
      <>
        {priorityFiltered.map((lang) => (
          <div
            key={lang.id || lang.lc}
            className={`navbar-language-item ${
              lang.lc === currentLc ? "navbar-language-item--primary" : ""
            } ${lang.lc === secLc ? "navbar-language-item--secondary" : ""} ${
              tertiaryLc && lang.lc === tertiaryLc ? "navbar-language-item--tertiary" : ""
            }`}
            onClick={() => handleLanguageSelect(lang)}
            tabIndex={0}
            role="option"
            aria-selected={lang.lc === currentLc}
          >
            <img
              src={getFlagUrl(lang.cc || "")}
              alt={`${lang.cc || ""} flag`}
              className={`navbar-language-item-flag ${
                lang.lc === currentLc ? "navbar-language-item-flag--grayscale" : ""
              }`}
              onError={(e) => {
                e.currentTarget.src = getFlagUrl("GB");
              }}
            />
            <span className="navbar-language-item-code">{lang.cc || ""}</span>
            <span className="navbar-language-item-lc">{lang.lc || ""}</span>
            <span className="navbar-language-item-name">
              {lang.name_en || ""}
              {unsupportedLanguages.includes(lang.lc) && (
                <span className="navbar-language-item-unsupported"> - unsupported</span>
              )}
            </span>
            <span className="navbar-language-item-native">{lang.native_name || ""}</span>
          </div>
        ))}
        {priorityFiltered.length > 0 && otherFiltered.length > 0 && (
          <div className="navbar-language-divider"></div>
        )}
        {otherFiltered.map((lang) => (
          <div
            key={lang.id || lang.lc}
            className="navbar-language-item"
            onClick={() => handleLanguageSelect(lang)}
            tabIndex={0}
            role="option"
            aria-selected={false}
          >
            <img
              src={getFlagUrl(lang.cc || "")}
              alt={`${lang.cc || ""} flag`}
              className="navbar-language-item-flag"
              onError={(e) => {
                e.currentTarget.src = getFlagUrl("GB");
              }}
            />
            <span className="navbar-language-item-code">{lang.cc || ""}</span>
            <span className="navbar-language-item-lc">{lang.lc || ""}</span>
            <span className="navbar-language-item-name">
              {lang.name_en || ""}
              {unsupportedLanguages.includes(lang.lc) && (
                <span className="navbar-language-item-unsupported"> - unsupported</span>
              )}
            </span>
            <span className="navbar-language-item-native">{lang.native_name || ""}</span>
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
          src={getFlagUrl(currentLanguage.cc || "")}
          alt={`${currentLc} flag`}
          className={`navbar-language-flag ${!isDropdownOpen ? "navbar-language-flag--grayscale" : ""}`}
          onError={(e) => {
            e.currentTarget.src = getFlagUrl("GB");
          }}
        />
        <span className="navbar-language-lc">
          {currentLc}
          {unsupportedLanguages.includes(currentLc) && (
            <span className="navbar-language-item-unsupported"> - unsupported</span>
          )}
        </span>
      </button>
      {isDropdownOpen && (
        <div
          className="navbar-language-dropdown-container"
          onClick={(e) => e.stopPropagation()}
        >
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
          <div className="navbar-language-dropdown">{renderLanguageItems()}</div>
        </div>
      )}
    </div>
  );
};

export default NavbarLanguage;