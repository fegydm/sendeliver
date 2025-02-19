// File: src/components/sections/content/search-forms/CountrySelect.tsx
// Last change: Added improved input validation for country codes (controlled component)

import React, { useRef, useState, useMemo, useCallback, useEffect } from "react";
import { BaseDropdown } from "./BaseDropdown";
import type { Country } from "@/types/location.types";
import { useCountries } from "@/hooks/useCountries";

interface CountrySelectProps {
  onCountrySelect: (cc: string, flag: string) => void; // Callback when a country is selected or prefix is entered
  onNextFieldFocus: () => void; // Callback to move focus to next field
  initialValue?: string; // Controlled value for the input (country code)
  locationType: "pickup" | "delivery";
}

export function CountrySelect({
  onCountrySelect,
  onNextFieldFocus,
  initialValue = "",
  locationType
}: CountrySelectProps) {
  // Controlled input value from props
  const inputValue = initialValue;
  // State for dropdown open/close
  const [isOpen, setIsOpen] = useState(false);
  // State for pagination count of visible items
  const [visibleCount, setVisibleCount] = useState(20);
  
  // Component refs
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const componentRef = useRef<HTMLDivElement>(null);

  // Fetch countries data
  const { items: allCountries, isLoading } = useCountries();

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

  // Handle outside clicks to close dropdown
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (componentRef.current && !componentRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  // Add and remove click handler
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  // Handle input changes with improved validation
  const handleInputChange = useCallback((value: string) => {
    const upperValue = value.toUpperCase();
    
    // Reset if empty
    if (!upperValue) {
      // Notify parent with empty values
      onCountrySelect("", "");
      setVisibleCount(20);
      setIsOpen(true);
      return;
    }

    // Validation and processing for first character
    if (upperValue.length === 1) {
      const hasMatchingCountries = allCountries.some(c => 
        c.cc?.startsWith(upperValue)
      );
      
      if (!hasMatchingCountries) {
        console.log(`[CountrySelect] No countries starting with ${upperValue}`);
        return;
      }
      
      // Accept one character, but DO NOT move to the next field
      onCountrySelect(upperValue, ""); // Send prefix to parent component
      setIsOpen(true);  // Keep dropdown open for possible selection
      return;
    }
    
    // Processing for two characters - original logic remains
    if (upperValue.length === 2) {
      const exactMatch = allCountries.find(c => c.cc === upperValue);
      if (!exactMatch) {
        console.log(`[CountrySelect] No exact match for ${upperValue}`);
        return;
      }
      
      const flagUrl = `/flags/4x3/optimized/${exactMatch.cc.toLowerCase()}.svg`;
      onCountrySelect(exactMatch.cc, flagUrl);
      setIsOpen(false);
      onNextFieldFocus();  // Automatic focus shift only for complete code
      return;
    }
  }, [allCountries, onCountrySelect, onNextFieldFocus]);

  // Handle country selection from dropdown
  const handleSelect = useCallback((selected: Country) => {
    if (!selected.cc) return;
    
    const flagUrl = `/flags/4x3/optimized/${selected.cc.toLowerCase()}.svg`;
    
    onCountrySelect(selected.cc, flagUrl);
    setIsOpen(false);
    onNextFieldFocus();
  }, [onCountrySelect, onNextFieldFocus]);

  // Handle keyboard navigation
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
    
    // Only allow valid country code characters
    if (e.key.length === 1) {
      const upperKey = e.key.toUpperCase();
      
      // For empty input, check if any country starts with this letter
      if (!inputValue) {
        const hasMatchingCountries = allCountries.some(c => 
          c.cc?.startsWith(upperKey)
        );
        if (!hasMatchingCountries) {
          e.preventDefault();
          return;
        }
      }
      
      // For one character input, check if there are countries with this prefix
      if (inputValue.length === 1) {
        const prefix = inputValue + upperKey;
        const hasMatchingCountries = allCountries.some(c => 
          c.cc?.startsWith(prefix)
        );
        if (!hasMatchingCountries) {
          e.preventDefault();
          return;
        }
      }
      
      // Prevent input longer than 2 characters
      if (inputValue.length >= 2) {
        e.preventDefault();
      }
    }
  }, [inputValue, isOpen, allCountries]);

  // Handle input focus
  const handleFocus = useCallback(() => {
    setIsOpen(true);
  }, []);

  // Handle loading state
  if (isLoading) {
    return <div className="loading-state">Loading...</div>;
  }

  return (
    <div className="country-select" ref={componentRef}>
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        placeholder="CC"
        maxLength={2}
        onChange={(e) => handleInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        className={`${locationType}-cc`}
        aria-autocomplete="list"
        aria-controls="country-dropdown"
        aria-expanded={isOpen}
      />
      <BaseDropdown<Country>
        items={visibleItems}
        isOpen={isOpen}
        onSelect={handleSelect}
        inputRef={inputRef}
        variant="country"
        position="left"
        totalItems={filteredItems.length}
        pageSize={20}
        onLoadMore={() => setVisibleCount(prev => prev + 20)}
        renderItem={(country: Country, { isHighlighted }: { isHighlighted: boolean }) => (
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
        getItemKey={(item: Country) => item.cc || ''}
        ariaLabel="Country options"
        loadMoreText="Load more countries..."
      />
    </div>
  );
}

export default CountrySelect;
