// File: src/components/sections/content/search-forms/CountrySelect.tsx
import React, { useRef, useState, useMemo, useCallback, useEffect } from "react";
import { BaseDropdown } from "@/components/elements/BaseDropdown";
import type { Country } from "@/types/transport-forms.types";
import { useCountriesContext } from "@/contexts/CountriesContext";
import { useUINavigation } from "@/hooks/useUINavigation";

interface CountrySelectProps {
  onCountrySelect: (cc: string, flag: string) => void;
  onNextFieldFocus: () => void;
  initialValue?: string;
  locationType: "pickup" | "delivery";
}

export function CountrySelect({
  onCountrySelect,
  onNextFieldFocus,
  initialValue = "",
  locationType,
}: CountrySelectProps) {
  const [inputValue, setInputValue] = useState(initialValue);
  const [isOpen, setIsOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(20);
  const [isDropdownHovered, setIsDropdownHovered] = useState(false);
  const [isInputHovered, setIsInputHovered] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const componentRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLElement | null)[]>([]);

  // Use CountriesContext instead of calling useCountriesPreload directly
  const { countries: allCountries, isLoading, getFlagUrl } = useCountriesContext();

  // Debug logging for countries data
  useEffect(() => {
    console.log(`[CountrySelect] allCountries:`, allCountries);
    console.log(`[CountrySelect] isLoading:`, isLoading);
  }, [allCountries, isLoading]);

  // Sync inputValue with initialValue
  useEffect(() => {
    if (initialValue !== inputValue) {
      setInputValue(initialValue);
      if (inputRef.current && initialValue !== inputRef.current.value) {
        inputRef.current.value = initialValue;
      }
      if (initialValue.length === 2) {
        const flagUrl = getFlagUrl(initialValue); // Use cached flag URL
        onCountrySelect(initialValue, flagUrl);
      }
    }
  }, [initialValue, onCountrySelect, inputValue, getFlagUrl]);

  const filteredItems = useMemo(() => {
    console.log(`[CountrySelect] Filtering with input: "${inputValue}"`, { 
      allCountries: allCountries?.length || 0, 
      isLoading 
    });

    if (isLoading) return [];
    
    if (!allCountries || !Array.isArray(allCountries) || allCountries.length === 0) {
      console.warn('[CountrySelect] No countries data available:', allCountries);
      return [];
    }
    
    if (!inputValue) {
      const validCountries = allCountries.filter(c => c && typeof c === 'object' && c.cc);
      return validCountries;
    }
    
    const upperValue = inputValue.toUpperCase();
    return allCountries.filter((c: Country) => c && c.cc && c.cc.toUpperCase().startsWith(upperValue));
  }, [inputValue, allCountries, isLoading]);

  const visibleItems = useMemo(() => filteredItems.slice(0, visibleCount), [filteredItems, visibleCount]);

  const { highlightedIndex, setHighlightedIndex, handleKeyDown: handleUINavKeyDown } = useUINavigation({
    items: visibleItems,
    isOpen,
    onSelect: (country) => handleSelect(country as Country),
    pageSize: 20,
    onLoadMore: () => setVisibleCount(prev => prev + 20),
    inputRef,
  });

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (componentRef.current && !componentRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const upperValue = event.target.value.toUpperCase();
    setInputValue(upperValue);
    if (!isOpen) setIsOpen(true);

    if (!upperValue) {
      onCountrySelect("", "");
      setVisibleCount(20);
      return;
    } 
    
    if (upperValue.length === 1) {
      if (allCountries && allCountries.some((c: Country) => c && c.cc && c.cc.startsWith(upperValue))) {
        onCountrySelect(upperValue, "");
      }
      return;
    } 
    
    if (upperValue.length === 2) {
      const exactMatch = allCountries && allCountries.find((c: Country) => c && c.cc === upperValue);
      if (!exactMatch) {
        setInputValue(upperValue.charAt(0));
        return;
      }
      const flagUrl = getFlagUrl(exactMatch.cc);
      onCountrySelect(exactMatch.cc, flagUrl);
      setIsOpen(false);
      onNextFieldFocus();
    }
  }, [allCountries, onCountrySelect, onNextFieldFocus, isOpen, getFlagUrl]);

  const handleSelect = useCallback((selected: Country) => {
    if (!selected || !selected.cc) return;
    setInputValue(selected.cc);
    const flagUrl = selected.flag || getFlagUrl(selected.cc);
    onCountrySelect(selected.cc, flagUrl);
    setIsOpen(false);
    onNextFieldFocus();
  }, [onCountrySelect, onNextFieldFocus, getFlagUrl]);

  const handleFocus = useCallback(() => {
    if (!isLoading) setIsOpen(true);
  }, [isLoading]);

  const handleInputClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    if (!isLoading) setIsOpen(true);
  }, [isLoading]);

  const handleInputKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      if (document.activeElement === inputRef.current) {
        event.preventDefault();
        if (!isOpen && !isLoading) setIsOpen(true);
        if (highlightedIndex === null) setHighlightedIndex(0);
        dropdownRef.current?.focus();
      }
    } else if (event.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.focus();
    }
  }, [highlightedIndex, isOpen, setHighlightedIndex, isLoading]);

  const handleDropdownNavigation = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      handleUINavKeyDown(event);
    } else if (event.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.focus();
    }
  }, [handleUINavKeyDown]);

  const flagSrc = useMemo(() => {
    return inputValue.length === 2 ? getFlagUrl(inputValue) : "/flags/4x3/optimized/gb.svg";
  }, [inputValue, getFlagUrl]);

  if (isLoading) return <div>Loading countries...</div>;

  return (
    <div ref={componentRef} className={`country-select country-select--${locationType}`}>
      <img 
        src={flagSrc} 
        className={`country-select__flag ${inputValue.length !== 2 ? 'country-select__flag--inactive' : ''}`} 
        alt="Country flag" 
        onError={(e) => (e.currentTarget.src = "/flags/4x3/optimized/gb.svg")}
      />
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        placeholder="CC"
        maxLength={2}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        onFocus={handleFocus}
        onClick={handleInputClick}
        className="country-select__input"
        aria-autocomplete="list"
        aria-controls="country-select-dropdown"
        aria-expanded={isOpen}
      />
      <BaseDropdown
        items={visibleItems}
        isOpen={isOpen}
        onSelect={handleSelect}
        variant="country"
        position="left"
        totalItems={filteredItems.length}
        pageSize={20}
        onLoadMore={() => setVisibleCount(prev => prev + 20)}
        renderItem={(country, { isHighlighted }) => {
          if (!country || !country.cc) {
            return (
              <div className={`dropdown__item ${isHighlighted ? 'dropdown--highlighted' : ''}`}>
                <span className="dropdown__item-code">?</span>
                <span className="dropdown__item-name">Unknown country</span>
              </div>
            );
          }
          return (
            <div
              className={`dropdown__item ${isHighlighted ? 'dropdown--highlighted' : ''}`}
              ref={(el) => (itemsRef.current[visibleItems.indexOf(country)] = el)}
            >
              <img 
                src={country.flag || getFlagUrl(country.cc)}
                alt={`${country.cc} flag`} 
                className="dropdown__item-flag"
                onError={(e) => (e.currentTarget.src = "/flags/4x3/optimized/gb.svg")}
              />
              <span className="dropdown__item-code">{country.cc}</span>
              <span className="dropdown__item-name">{country.name_en || 'Unknown'}</span>
              <span className="dropdown__item-local-name">({country.name_local || 'N/A'})</span>
            </div>
          );
        }}
        getItemKey={(item: Country) => item?.cc || ''}
        ariaLabel="Country options"
        loadMoreText="Load more countries..."
        className="country-select__dropdown"
        ref={dropdownRef}
        onKeyDown={isDropdownHovered ? handleDropdownNavigation : undefined}
        onMouseEnter={() => setIsDropdownHovered(true)}
        onMouseLeave={() => setIsDropdownHovered(false)}
        noResultsText="Loading countries data..."
        onNoResults={() => (
          <div className="dropdown__no-results">
            {allCountries && allCountries.length > 0 
              ? `No matching countries for "${inputValue}"`
              : "Loading countries data..."}
          </div>
        )}
      />
    </div>
  );
}

export default CountrySelect;
