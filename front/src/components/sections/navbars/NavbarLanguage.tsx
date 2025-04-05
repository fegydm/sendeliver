// File: src/components/sections/navbars/NavbarLanguage.tsx
import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
// Use translation context for current language and changeLanguage function
import { useTranslationContext } from "@/contexts/TranslationContext";
// Use languages context for list of languages and flag URL function
import { useLanguagesContext } from "@/contexts/LanguagesContext";
import type { Language } from "@/types/language.types";
import "./navbar.component.css";

const NavbarLanguage: React.FC = () => {
  // State for dropdown open/close and search fields
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [codeSearch, setCodeSearch] = useState("");
  const [nameSearch, setNameSearch] = useState("");

  // Refs for DOM elements
  const componentRef = useRef<HTMLDivElement>(null);
  const codeInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Get current language settings from TranslationContext
  const { currentLanguage, secondaryLanguage, changeLanguage } = useTranslationContext();
  const currentLc = currentLanguage.lc;
  const secLc = secondaryLanguage; // alias

  // Determine tertiary language (set to 'en' only if neither current nor secondary is 'en')
  const tertiaryLc = useMemo(() => {
    if (currentLc === "en" || secLc === "en") return null;
    return "en";
  }, [currentLc, secLc]);

  // Get languages list and getFlagUrl from LanguagesContext
  const { languages, isLoading, getFlagUrl } = useLanguagesContext();

  // Group languages by priority (for potential future use)
  const groupedLanguages = useMemo(() => {
    const priorityLangs: Language[] = [];
    const otherLangs: Language[] = [];
    languages.forEach((lang) => {
      if (
        lang.lc === currentLc ||
        lang.lc === secLc ||
        (tertiaryLc && lang.lc === tertiaryLc)
      ) {
        priorityLangs.push(lang);
      } else {
        otherLangs.push(lang);
      }
    });
    // Sort priority languages
    priorityLangs.sort((a, b) => {
      if (a.lc === currentLc) return -1;
      if (b.lc === currentLc) return 1;
      if (a.lc === secLc) return -1;
      if (b.lc === secLc) return 1;
      if (tertiaryLc && a.lc === tertiaryLc) return -1;
      if (tertiaryLc && b.lc === tertiaryLc) return 1;
      return 0;
    });
    otherLangs.sort((a, b) => a.name_en.localeCompare(b.name_en));
    return { priorityLangs, otherLangs };
  }, [languages, currentLc, secLc, tertiaryLc]);

  // Filter languages based on search input
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

  // Handle language selection
  const handleLanguageSelect = useCallback(
    (lang: Language) => {
      console.log(`[NavbarLanguage] Changing language to: ${lang.lc} (${lang.name_en})`);
      changeLanguage(lang); // Pass full language object
      setIsDropdownOpen(false);
      setCodeSearch("");
      setNameSearch("");
    },
    [changeLanguage]
  );

  // Toggle dropdown open/close
  const toggleDropdown = useCallback(() => {
    setIsDropdownOpen((prev) => !prev);
    if (!isDropdownOpen) {
      // Focus on code input after opening dropdown
      setTimeout(() => codeInputRef.current?.focus(), 10);
    } else {
      setCodeSearch("");
      setNameSearch("");
    }
  }, [isDropdownOpen]);

  // Close dropdown when clicking outside
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (componentRef.current && !componentRef.current.contains(event.target as Node)) {
      setIsDropdownOpen(false);
      setCodeSearch("");
      setNameSearch("");
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  // Keydown handlers for search inputs
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

  // Render language items in dropdown
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
            <span className="navbar-language-item-name">{lang.name_en || ""}</span>
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
            <span className="navbar-language-item-name">{lang.name_en || ""}</span>
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
          className="navbar-language-flag navbar-language-flag--grayscale"
          onError={(e) => {
            e.currentTarget.src = getFlagUrl("GB");
          }}
        />
        <span className="navbar-language-lc">{currentLc}</span>
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
