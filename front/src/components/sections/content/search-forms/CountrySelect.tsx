// File: src/components/sections/content/search-forms/CountrySelect.tsx
// Last change: Updated input handling logic for better country search

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

  const { items: allCountries, isLoading } = useCountries();

  // Compute valid first characters from all countries' code_2
  const validFirstChars = useMemo(() => {
    const chars = new Set(
      allCountries
        .map(c => c.code_2?.[0])
        .filter(Boolean)
    );
    return chars;
  }, [allCountries]);

  // Compute valid second characters based on the current input
  const validSecondChars = useMemo(() => {
    if (!inputValue) return new Set();
    return new Set(
      allCountries
        .filter(c => c.code_2?.startsWith(inputValue[0]))
        .map(c => c.code_2?.[1])
        .filter(Boolean)
    );
  }, [inputValue, allCountries]);

  // Filter countries whose code_2 starts with the input value
  const filteredItems = useMemo(() => {
    if (!inputValue) return allCountries;
    return allCountries.filter(c => 
      c.code_2?.startsWith(inputValue.toUpperCase())
    );
  }, [inputValue, allCountries]);

  // Get only the visible items (pagination)
  const visibleItems = useMemo(() => {
    return filteredItems.slice(0, visibleCount);
  }, [filteredItems, visibleCount]);

  // Determine if "Load more" should be shown
  const showLoadMore = useMemo(() => {
    return filteredItems.length > visibleCount;
  }, [filteredItems.length, visibleCount]);

  // Handle country selection
  const handleSelect = useCallback((selected: Country) => {
    if (!selected.code_2) return;
    
    const code = selected.code_2;
    const flagUrl = `/flags/4x3/optimized/${code.toLowerCase()}.svg`;
    
    setInputValue(code);
    setIsOpen(false);
    onCountrySelect(code, flagUrl);
    onNextFieldFocus?.();
  }, [onCountrySelect, onNextFieldFocus]);

  // Handle input change in the country field
  const handleInputChange = useCallback((value: string) => {
    const upperValue = value.toUpperCase();
    
    // Always update the input value
    setInputValue(upperValue);
    setVisibleCount(COUNTRY_PAGE_SIZE);
    setIsOpen(true);
    
    // If the input is empty, reset the selection
    if (!upperValue) {
      onCountrySelect("", "");
      return;
    }
    
    // If the input length is exactly 2, select the country with an exact match
    if (upperValue.length === 2) {
      const exactMatch = filteredItems.find(c => c.code_2 === upperValue);
      if (exactMatch) {
        handleSelect(exactMatch);
      } else {
        onCountrySelect("", "");
      }
    } else {
      // If only one character is entered, reset the selection
      onCountrySelect("", "");
    }
  }, [filteredItems, handleSelect, onCountrySelect]);

  // Handle "Load more" action to show additional countries
  const handleLoadMore = useCallback(() => {
    setVisibleCount(prev => prev + COUNTRY_PAGE_SIZE);
  }, []);

  // Handle key down events to restrict invalid characters
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key.length !== 1) return;
    const upperKey = e.key.toUpperCase();

    if (inputValue.length === 0) {
      if (!validFirstChars.has(upperKey)) {
        e.preventDefault();
      }
    } else if (inputValue.length === 1) {
      if (!validSecondChars.has(upperKey)) {
        e.preventDefault();
      }
    } else {
      e.preventDefault();
    }
  }, [inputValue, validFirstChars, validSecondChars]);

  // Render a single country item for the dropdown
  const renderCountryItem = useCallback((country: Country, { isHighlighted }: { isHighlighted: boolean }) => (
    <div 
      className={`item-suggestion ${isHighlighted ? "highlighted" : ""}`}
      id={`country-item-${country.code_2}`}
    >
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

  if (isLoading) {
    return <div>Loading countries...</div>;
  }

  return (
    <div className="country-select">
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
      />
      {isOpen && (
        <BaseDropdown<Country>
          items={visibleItems}
          isOpen={isOpen}
          onSelect={handleSelect}
          onClose={() => setIsOpen(false)}
          onLoadMore={showLoadMore ? handleLoadMore : undefined}
          inputRef={inputRef}
          dropdownType="country"
          locationType={locationType}
          totalItems={filteredItems.length}
          pageSize={UI_PAGE_SIZE}
          renderItem={renderCountryItem}
          getItemKey={(item) => item.code_2 || ""}
          ariaLabel="Country options"
          loadMoreText="Load more countries..."
        />
      )}
    </div>
  );
}

export default CountrySelect;
