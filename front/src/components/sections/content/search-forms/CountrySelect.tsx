// File: src/components/sections/content/search-forms/CountrySelect.tsx
// Last change: Updated types to use cc instead of code_2 and fixed focus handling

import React, { useRef, useState, useMemo, useCallback } from "react";
import { BaseDropdown } from "./BaseDropdown";
import type { Country } from "@/types/location.types";
import { useCountries } from "@/hooks/useCountries";

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
  locationType
}: CountrySelectProps) {
  const [inputValue, setInputValue] = useState(initialValue);
  const [isOpen, setIsOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(20);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { items: allCountries, isLoading } = useCountries();

  // Compute valid first characters from country codes
  const validFirstChars = useMemo(() => {
    return new Set(
      allCountries.map(c => c.cc?.[0]).filter(Boolean)
    );
  }, [allCountries]);

  // Compute valid second characters based on the first character
  const validSecondChars = useMemo(() => {
    if (!inputValue) return new Set();
    return new Set(
      allCountries
        .filter(c => c.cc?.startsWith(inputValue[0]))
        .map(c => c.cc?.[1])
        .filter(Boolean)
    );
  }, [inputValue, allCountries]);

  // Filter countries list based on input value
  const filteredItems = useMemo(() => {
    if (!inputValue) return allCountries;
    return allCountries.filter(c =>
      c.cc?.startsWith(inputValue.toUpperCase())
    );
  }, [inputValue, allCountries]);

  // Get visible items based on pagination
  const visibleItems = useMemo(() => {
    return filteredItems.slice(0, visibleCount);
  }, [filteredItems, visibleCount]);

  // Handle input changes and validate country code
  const handleInputChange = useCallback((value: string) => {
    const upperValue = value.toUpperCase();
    setInputValue(upperValue);
    setVisibleCount(20);
    
    // Open dropdown if less than 2 characters are entered
    if (upperValue.length < 2) {
      setIsOpen(true);
      // Do nothing else for 0 or 1 character
      onCountrySelect("", "");
      return;
    }

    // When exactly 2 characters are entered, attempt to match the country code
    if (upperValue.length === 2) {
      const exactMatch = allCountries.find(c => c.cc === upperValue);
      if (exactMatch) {
        const flagUrl = `/flags/4x3/optimized/${exactMatch.cc.toLowerCase()}.svg`;
        setIsOpen(false);
        onCountrySelect(exactMatch.cc, flagUrl);
        // Move focus only when a valid 2-character code is entered
        onNextFieldFocus();
      }
    }
  }, [allCountries, onCountrySelect, onNextFieldFocus]);

  // Handle country selection from dropdown
  const handleSelect = useCallback((selected: Country) => {
    if (!selected.cc) return;
    
    const flagUrl = `/flags/4x3/optimized/${selected.cc.toLowerCase()}.svg`;
    
    setInputValue(selected.cc);
    setIsOpen(false);
    onCountrySelect(selected.cc, flagUrl);
    onNextFieldFocus();
  }, [onCountrySelect, onNextFieldFocus]);

  // Validate keystrokes and handle navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (isOpen && dropdownRef.current) {
        const firstItem = dropdownRef.current.querySelector('.item-content');
        if (firstItem instanceof HTMLElement) {
          firstItem.focus();
        }
      }
      return;
    }
    
    if (e.key.length === 1) {
      const upperKey = e.key.toUpperCase();
  
      if (!inputValue && validFirstChars.size > 0) {
        if (!validFirstChars.has(upperKey)) {
          e.preventDefault();
        }
      } 
      else if (inputValue.length === 1 && validSecondChars.size > 0) {
        if (!validSecondChars.has(upperKey)) {
          e.preventDefault();
        }
      } 
      else if (inputValue.length >= 2) {
        e.preventDefault();
      }
    }
  }, [inputValue, isOpen, validFirstChars, validSecondChars]);

  // Handle dropdown close
  const handleDropdownClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="country-select" ref={dropdownRef}>
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        placeholder="CC"
        maxLength={2}
        onChange={(e) => handleInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsOpen(true)}
        className={`${locationType}-cc`}
        aria-autocomplete="list"
        aria-controls="country-dropdown"
        aria-expanded={isOpen}
      />
      <BaseDropdown<Country>
        items={visibleItems}
        isOpen={isOpen}
        onSelect={handleSelect}
        onClose={handleDropdownClose}
        onLoadMore={() => setVisibleCount(prev => prev + 20)}
        inputRef={inputRef}
        variant="country"
        locationType={locationType}
        totalItems={filteredItems.length}
        pageSize={20}
        renderItem={(country, { isHighlighted }) => (
          <div
            className={`item-content ${isHighlighted ? 'highlighted' : ''}`}
            tabIndex={0}
          >
            <img
              src={`/flags/4x3/optimized/${country.cc.toLowerCase()}.svg`}
              alt={`${country.cc} flag`}
              className={`${locationType}-flag`}
            />
            <span className={`${locationType}-cc`}>{country.cc}</span>
            <span className="country-name">{country.name_en}</span>
            <span className="country-local">({country.name_local})</span>
          </div>
        )}
        getItemKey={(item) => item.cc || ''}
        selectedItem={null}
        ariaLabel="Country options"
        loadMoreText="Load more countries..."
      />
    </div>
  );
}

export default CountrySelect;