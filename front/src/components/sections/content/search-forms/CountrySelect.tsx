// File: src/components/sections/content/search-forms/CountrySelect.tsx
// Last change: Focus (onNextFieldFocus) and onCountrySelect are triggered only on exactly 2 valid characters

import { useRef, useState, useMemo, useCallback } from "react";
import { BaseDropdown, type LocationType } from "./BaseDropdown";
import type { Country } from "@/types/location.types";
import { COUNTRY_PAGE_SIZE, UI_PAGE_SIZE } from "@/constants/pagination.constants";
import { useCountries } from "@/hooks/useCountries";

interface CountrySelectProps {
  onCountrySelect: (code: string, flag: string) => void;
  onNextFieldFocus?: () => void;
  initialValue?: string;
  locationType: LocationType;
}

export function CountrySelect({
  onCountrySelect,
  onNextFieldFocus,
  initialValue = "",
  locationType,
}: CountrySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(initialValue);
  const [visibleCount, setVisibleCount] = useState(COUNTRY_PAGE_SIZE);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { items: allCountries, isLoading } = useCountries();

  // Compute valid first characters from country codes
  const validFirstChars = useMemo(() => {
    return new Set(
      allCountries.map(c => c.code_2?.[0]).filter(Boolean)
    );
  }, [allCountries]);

  // Compute valid second characters based on the first character
  const validSecondChars = useMemo(() => {
    if (!inputValue) return new Set();
    return new Set(
      allCountries
        .filter(c => c.code_2?.startsWith(inputValue[0]))
        .map(c => c.code_2?.[1])
        .filter(Boolean)
    );
  }, [inputValue, allCountries]);

  // Filter countries list based on input value
  const filteredItems = useMemo(() => {
    if (!inputValue) return allCountries;
    return allCountries.filter(c =>
      c.code_2?.startsWith(inputValue.toUpperCase())
    );
  }, [inputValue, allCountries]);

  // Get visible items based on pagination
  const visibleItems = useMemo(() => {
    return filteredItems.slice(0, visibleCount);
  }, [filteredItems, visibleCount]);

  // Handle country selection from dropdown
  const handleSelect = useCallback((selected: Country) => {
    if (!selected.code_2) return;
    
    const code = selected.code_2;
    const flagUrl = `/flags/4x3/optimized/${code.toLowerCase()}.svg`;
    
    setInputValue(code);
    setIsOpen(false);
    onCountrySelect(code, flagUrl);
  }, [onCountrySelect]);

  // Handle input changes and validate country code
  const handleInputChange = useCallback((value: string) => {
    const upperValue = value.toUpperCase();
    setInputValue(upperValue);
    setVisibleCount(COUNTRY_PAGE_SIZE);

    // Open dropdown if less than 2 characters are entered
    if (upperValue.length < 2) {
      setIsOpen(true);
      // Do nothing else for 0 or 1 character
      return;
    }

    // When exactly 2 characters are entered, attempt to match the country code
    if (upperValue.length === 2) {
      const exactMatch = allCountries.find(c => c.code_2 === upperValue);
      if (exactMatch) {
        const code = exactMatch.code_2;
        const flagUrl = `/flags/4x3/optimized/${code.toLowerCase()}.svg`;
        
        setIsOpen(false);
        onCountrySelect(code, flagUrl);
        // Move focus only when a valid 2-character code is entered
        onNextFieldFocus?.();
      }
    }
  }, [allCountries, onCountrySelect, onNextFieldFocus]);

  // Validate keystrokes for country code input
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key.length === 1) {
      const upperKey = e.key.toUpperCase();

      // Validate first character
      if (inputValue.length === 0) {
        if (!validFirstChars.has(upperKey)) {
          e.preventDefault();
        }
      } 
      // Validate second character
      else if (inputValue.length === 1) {
        if (!validSecondChars.has(upperKey)) {
          e.preventDefault();
        }
      } 
      // Prevent more than 2 characters from being entered
      else {
        e.preventDefault();
      }
    }
  }, [inputValue, validFirstChars, validSecondChars]);

  // Handle pagination (load more items)
  const handleLoadMore = useCallback(() => {
    setVisibleCount(prev => prev + COUNTRY_PAGE_SIZE);
  }, []);

  // Render country item in the dropdown
  const renderCountryItem = useCallback((
    country: Country,
    { isHighlighted }: { isHighlighted: boolean }
  ) => (
    <div className={`item-content ${isHighlighted ? 'highlighted' : ''}`}>
      <img
        src={`/flags/4x3/optimized/${country.code_2?.toLowerCase()}.svg`}
        alt={`${country.code_2 ?? "Unknown"} flag`}
        className="country-flag"
        aria-hidden={true}
      />
      <span className="country-code">{country.code_2 ?? "--"}</span>
      <span className="country-name">{country.name_en}</span>
      <span className="country-local">({country.name_local})</span>
    </div>
  ), []);

  // Generate unique key for list items
  const getItemKey = useCallback((item: Country, index: number) => {
    return item.code_2 || index.toString();
  }, []);

  if (isLoading) {
    return <div>Loading countries...</div>;
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
        onClick={() => setIsOpen(true)}
        className={`inp-country inp-country-${locationType}`}
        aria-autocomplete="list"
        aria-controls="country-dropdown"
        aria-expanded={isOpen}
      />
      <BaseDropdown<Country>
        items={visibleItems}
        isOpen={isOpen}
        onSelect={handleSelect}
        onClose={() => setIsOpen(false)}
        onLoadMore={handleLoadMore}
        inputRef={inputRef}
        dropdownType="country"
        locationType={locationType}
        totalItems={filteredItems.length}
        pageSize={UI_PAGE_SIZE}
        renderItem={renderCountryItem}
        getItemKey={getItemKey}
        selectedItem={null}
        ariaLabel="Country options"
        loadMoreText="Load more countries..."
      />
    </div>
  );
}

export default CountrySelect;
