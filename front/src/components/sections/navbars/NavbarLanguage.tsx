// File: ./front/src/components/navbars/NavbarLanguage.tsx
// Last change: Fixed TypeScript errors for setLanguages conflict and argument mismatch

import React, { useState, useEffect, useRef, useCallback } from "react";
import { BaseDropdown } from "@/components/elements/BaseDropdown";
import { useLanguage } from "@/hooks/useLanguage";

interface Language {
  code: string;
  name_en: string;
  native_name: string;
  is_rtl: boolean;
  group?: "primary" | "secondary" | "recent" | "other";
}

const NavbarLanguage: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [languages, setLanguageList] = useState<Language[]>([]); // Renamed to avoid conflict
  const [isLoading, setIsLoading] = useState(true);
  const [recentLanguages, setRecentLanguages] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { currentLanguage, secondaryLanguage, setLanguages } = useLanguage();

  useEffect(() => {
    const fetchLanguages = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/languages');
        if (!response.ok) throw new Error('Failed to load languages');
        const data = await response.json();
        setLanguageList(data);
      } catch (error) {
        console.error('Error loading languages:', error);
        setLanguageList([{ code: 'en', name_en: 'English', native_name: 'English', is_rtl: false }]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLanguages();
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('recentLanguages');
    setRecentLanguages(stored ? JSON.parse(stored) : ['sk']);
  }, []);

  const groupedLanguages = useCallback(() => {
    const grouped = languages.map(lang => ({
      ...lang,
      group: 
        lang.code === currentLanguage ? "primary" :
        lang.code === secondaryLanguage ? "secondary" :
        recentLanguages.includes(lang.code) ? "recent" : "other"
    }));

    const filtered = grouped.filter(lang => 
      search === "" || 
      lang.code.toLowerCase().includes(search.toLowerCase()) ||
      lang.name_en.toLowerCase().includes(search.toLowerCase()) ||
      lang.native_name.toLowerCase().includes(search.toLowerCase())
    );

    return {
      primary: filtered.filter(l => l.group === "primary"),
      secondary: filtered.filter(l => l.group === "secondary"),
      recent: filtered.filter(l => l.group === "recent")
        .sort((a, b) => recentLanguages.indexOf(a.code) - recentLanguages.indexOf(b.code)),
      others: filtered.filter(l => l.group === "other")
        .sort((a, b) => a.native_name.localeCompare(b.native_name))
    };
  }, [languages, currentLanguage, secondaryLanguage, recentLanguages, search]);

  const handleSelectLanguage = useCallback((code: string) => {
    if (code === currentLanguage) return;
    
    if (code === secondaryLanguage) {
      setLanguages(secondaryLanguage, currentLanguage); // Swap primary and secondary
    } else {
      setLanguages(code, currentLanguage); // New primary, old primary becomes secondary
      const newRecent = [code, ...recentLanguages.filter(c => c !== code && c !== currentLanguage)].slice(0, 3);
      setRecentLanguages(newRecent);
      localStorage.setItem('recentLanguages', JSON.stringify(newRecent));
    }
    
    setOpen(false);
  }, [currentLanguage, secondaryLanguage, setLanguages, recentLanguages]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getCurrentFlag = useCallback(() => {
    const lang = languages.find(l => l.code === currentLanguage);
    return lang ? `/flags/4x3/optimized/${lang.code.toLowerCase()}.svg` : `/flags/4x3/optimized/gb.svg`;
  }, [currentLanguage, languages]);

  const { primary, secondary, recent, others } = groupedLanguages();
  const allFilteredLanguages = [...primary, ...secondary, ...recent, ...others];

  return (
    <div className="navbar-language-container" ref={dropdownRef}>
      <button 
        onClick={() => setOpen(!open)} 
        className="navbar__language" 
        aria-label="Change language"
        aria-expanded={open}
      >
        <span className="navbar-language-code">{currentLanguage}</span>
        <img src={getCurrentFlag()} alt="Selected language" className="navbar-language-icon" />
      </button>
      
      {open && (
        <div className="language-dropdown">
          <input
            type="text"
            placeholder="Search language..."
            className="language-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          
          {isLoading ? (
            <div className="language-loading">Loading languages...</div>
          ) : (
            <BaseDropdown
              items={allFilteredLanguages}
              isOpen={true}
              onSelect={(lang) => handleSelectLanguage(lang.code)}
              variant="language"
              position="right"
              renderItem={(lang, { isHighlighted }) => (
                <div className={`language-item ${isHighlighted ? 'language-item--highlighted' : ''} ${lang.group}`}>
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
                </div>
              )}
              getItemKey={(lang) => lang.code}
              ariaLabel="Language options"
              className="language-selector-dropdown"
              noResultsText="No languages found"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default NavbarLanguage;