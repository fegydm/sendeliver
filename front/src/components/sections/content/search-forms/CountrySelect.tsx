// File: src/components/sections/content/search-forms/CountrySelect.tsx
// Úprava: Synchronizácia inputValue s initialValue a dynamická aktualizácia flag

import React, { useRef, useState, useMemo, useCallback, useEffect } from "react";
import { BaseDropdown } from "../../../elements/BaseDropdown";
import type { Country } from "@/types/transport-forms.types";
import { useCountries } from "@/hooks/useCountries";
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

  const { items: allCountries } = useCountries();

  // Synchronizácia inputValue s initialValue
  useEffect(() => {
    console.log(`[CountrySelect] ${locationType} initialValue changed to:`, initialValue);
    if (initialValue !== inputValue) {
      setInputValue(initialValue); // Vždy aktualizuj inputValue na initialValue
      if (inputRef.current && initialValue !== inputRef.current.value) {
        inputRef.current.value = initialValue; // Aktualizuj DOM
      }
      // Ak je initialValue platný kód krajiny, aktualizuj flag
      if (initialValue.length === 2) {
        const flagUrl = `/flags/4x3/optimized/${initialValue.toLowerCase()}.svg`;
        onCountrySelect(initialValue, flagUrl); // Informuj rodiča
      }
    }
  }, [initialValue, locationType, onCountrySelect]);

  const filteredItems = useMemo(() => {
    if (!inputValue) return allCountries;
    return allCountries.filter(c => c.cc?.startsWith(inputValue.toUpperCase()));
  }, [inputValue, allCountries]);
  const visibleItems = useMemo(() => filteredItems.slice(0, visibleCount), [filteredItems, visibleCount]);

  const { highlightedIndex, setHighlightedIndex, handleKeyDown: handleUINavKeyDown } = useUINavigation({
    items: visibleItems,
    isOpen,
    onSelect: (country) => handleSelect(country),
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
    setIsOpen(true);

    if (!upperValue) {
      onCountrySelect("", "");
      setVisibleCount(20);
    } else if (upperValue.length === 2) {
      const exactMatch = allCountries.find(c => c.cc === upperValue);
      if (exactMatch) {
        const flagUrl = `/flags/4x3/optimized/${exactMatch.cc.toLowerCase()}.svg`;
        onCountrySelect(exactMatch.cc, flagUrl);
        setIsOpen(false);
        onNextFieldFocus();
      }
    }
  }, [allCountries, onCountrySelect, onNextFieldFocus]);

  const handleSelect = useCallback((selected: Country) => {
    if (!selected.cc) return;
    setInputValue(selected.cc);
    const flagUrl = `/flags/4x3/optimized/${selected.cc.toLowerCase()}.svg`;
    onCountrySelect(selected.cc, flagUrl);
    setIsOpen(false);
    onNextFieldFocus();
  }, [onCountrySelect, onNextFieldFocus]);

  const handleFocus = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleInputClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    setIsOpen(true);
  }, []);

  const handleInputKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      if (document.activeElement === inputRef.current) { // Check if input is focused
        event.preventDefault();
        if (!isOpen) setIsOpen(true);
        if (highlightedIndex === null) {
          setHighlightedIndex(0); // Go to first item if none selected
        }
        dropdownRef.current?.focus(); // Move focus to dropdown
      } else if (isInputHovered) {
        event.preventDefault();
        if (!isOpen) setIsOpen(true);
        if (highlightedIndex === null) {
          setHighlightedIndex(0);
        }
        dropdownRef.current?.focus();
      }
    } else if (event.key === "ArrowUp") {
      if (isInputHovered && isOpen) {
        event.preventDefault();
      }
    } else if (event.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.focus();
    } else if (event.key === "Backspace" || event.key === "Delete") {
      event.preventDefault();
      const newValue = event.key === "Backspace" ? inputValue.slice(0, -1) : inputValue.slice(1);
      setInputValue(newValue.toUpperCase());
      setIsOpen(true);
      inputRef.current?.focus();
    }
  }, [inputValue, isOpen, isInputHovered, highlightedIndex, setHighlightedIndex]);

  const handleDropdownNavigation = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      handleUINavKeyDown(event);
      if (dropdownRef.current && highlightedIndex !== null && itemsRef.current[highlightedIndex]) {
        requestAnimationFrame(() => {
          const dropdown = dropdownRef.current;
          const item = itemsRef.current[highlightedIndex];
          if (item && dropdown) {
            const dropdownRect = dropdown.getBoundingClientRect();
            const itemRect = item.getBoundingClientRect();
            const buffer = 20;
            const visibleTop = dropdownRect.top + buffer;
            const visibleBottom = dropdownRect.bottom - buffer;

            const isAboveView = itemRect.top < visibleTop;
            const isBelowView = itemRect.bottom > visibleBottom;

            if (isAboveView) {
              dropdown.scrollTop -= (visibleTop - itemRect.top);
            } else if (isBelowView) {
              dropdown.scrollTop += (itemRect.bottom - visibleBottom);
            }
          }
        });
      }
    } else if (event.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.focus();
    }
  }, [handleUINavKeyDown, highlightedIndex]);

  const handleInputMouseEnter = useCallback(() => {
    setIsInputHovered(true);
  }, []);

  const handleInputMouseLeave = useCallback(() => {
    setIsInputHovered(false);
  }, []);

  const handleDropdownMouseEnter = useCallback(() => {
    setIsDropdownHovered(true);
  }, []);

  const handleDropdownMouseLeave = useCallback(() => {
    setIsDropdownHovered(false);
  }, []);

  // Get the correct flag source based on inputValue
  const flagSrc = useMemo(() => {
    if (inputValue.length === 2) {
      return `/flags/4x3/optimized/${inputValue.toLowerCase()}.svg`;
    }
    return "/flags/4x3/optimized/gb.svg";
  }, [inputValue]);

  return (
    <div ref={componentRef} className={`country-select country-select--${locationType}`}>
      <img 
        src={flagSrc} 
        className={`country-select__flag ${inputValue.length !== 2 ? 'country-select__flag--inactive' : ''}`} 
        alt="Country flag" 
        onError={(e) => {
          console.error(`[CountrySelect] Error loading flag:`, flagSrc);
          e.currentTarget.src = "/flags/4x3/optimized/gb.svg";
        }}
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
        onMouseEnter={handleInputMouseEnter}
        onMouseLeave={handleInputMouseLeave}
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
        renderItem={(country: Country, { isHighlighted }: { isHighlighted: boolean }) => (
          <div
            className={`dropdown__item ${isHighlighted ? 'dropdown--highlighted' : ''}`}
            ref={(el) => (itemsRef.current[visibleItems.indexOf(country)] = el)}
          >
            <img src={`/flags/4x3/optimized/${country.cc.toLowerCase()}.svg`} alt={`${country.cc} flag`} className="dropdown__item-flag" />
            <span className="dropdown__item-code">{country.cc}</span>
            <span className="dropdown__item-name">{country.name_en}</span>
            <span className="dropdown__item-local-name">({country.name_local})</span>
          </div>
        )}
        getItemKey={(item: Country) => item.cc || ''}
        ariaLabel="Country options"
        loadMoreText="Load more countries..."
        className="country-select__dropdown"
        ref={dropdownRef}
        onKeyDown={isDropdownHovered ? handleDropdownNavigation : undefined}
        onMouseEnter={handleDropdownMouseEnter}
        onMouseLeave={handleDropdownMouseLeave}
      />
    </div>
  );
}

export default CountrySelect;