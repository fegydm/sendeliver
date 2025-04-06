// File: src/components/sections/navbars/NavbarLanguage.tsx
// Last change: April 05, 2025 - Fixed DD flag, grid alignment, and searchbox layout
// Updated: Added logs for debugging inconsistent dropdown behavior

import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useTranslationContext } from "@/contexts/TranslationContext";
import { useLanguagesContext } from "@/contexts/LanguagesContext";
import type { Language } from "@/types/language.types";
import "./navbar.component.css";

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

  useEffect(() => {
    console.log(`[NavbarLanguage] Current: ${currentLc}, Unsupported: ${unsupportedLanguages.includes(currentLc) ? 'yes' : 'no'}`);
  }, [currentLc, unsupportedLanguages]);

  const tertiaryLc = useMemo(() => {
    if (currentLc === "en" || secLc === "en") return null;
    return "en";
  }, [currentLc, secLc]);

  const { languages, isLoading, getFlagUrl } = useLanguagesContext();

  const filteredLanguages = useMemo(() => {
    console.log("[NavbarLanguage] Filtering languages, codeSearch:", codeSearch, "nameSearch:", nameSearch);
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
      console.log(`[NavbarLanguage] Selecting: ${lang.lc} (${lang.name_en})`);
      changeLanguage(lang);
      setIsDropdownOpen(false);
      setCodeSearch("");
      setNameSearch("");
    },
    [changeLanguage]
  );

  const toggleDropdown = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    console.log("[NavbarLanguage] Toggle clicked, current state:", isDropdownOpen);
    setIsDropdownOpen((prev) => {
      const newState = !prev;
      console.log("[NavbarLanguage] Setting new dropdown state:", newState);
      return newState;
    });
    if (!isDropdownOpen) {
      setTimeout(() => {
        console.log("[NavbarLanguage] Focusing code input");
        codeInputRef.current?.focus();
      }, 10);
    } else {
      setCodeSearch("");
      setNameSearch("");
    }
  }, [isDropdownOpen]);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (componentRef.current && !componentRef.current.contains(event.target as Node)) {
      console.log("[NavbarLanguage] Clicked outside, closing dropdown, target:", event.target);
      setIsDropdownOpen(false);
      setCodeSearch("");
      setNameSearch("");
    } else {
      console.log("[NavbarLanguage] Clicked inside, target:", event.target);
    }
  }, []);

  useEffect(() => {
    console.log("[NavbarLanguage] Adding click outside listener");
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      console.log("[NavbarLanguage] Removing click outside listener");
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

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
    console.log("[NavbarLanguage] Rendering language items, priority:", priorityFiltered.length, "other:", otherFiltered.length);
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

  console.log("[NavbarLanguage] Render, isDropdownOpen:", isDropdownOpen);
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
        console.log("[NavbarLanguage] Rendering dropdown, isDropdownOpen:", isDropdownOpen),
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