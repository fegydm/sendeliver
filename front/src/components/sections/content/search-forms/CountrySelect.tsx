// File: src/components/sections/content/search-forms/CountrySelect.tsx
// Last change: Updated query logic and translation for loading states

import React, { useRef, useState, useMemo, useCallback } from "react";
import { BaseDropdown } from "./BaseDropdown";
import { Country, LocationType } from "@/types/location.types";
import { COUNTRY_PAGE_SIZE, UI_PAGE_SIZE } from "@/constants/pagination.constants";
import { useCountries } from "@/hooks/useCountries";

interface CountrySelectProps {
  onCountrySelect: (cc: string, flag: string) => void;
  onNextFieldFocus?: () => void;
  value?: string;
  locationType: LocationType;
  psc?: string;
  city?: string;
}

export function CountrySelect({
  onCountrySelect,
  onNextFieldFocus,
  value = "",
  locationType,
  psc = "",
  city = "",
}: CountrySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(COUNTRY_PAGE_SIZE);
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
    if (!value) return new Set();
    return new Set(
      allCountries
        .filter(c => c.cc?.startsWith(value[0]))
        .map(c => c.cc?.[1])
        .filter(Boolean)
    );
  }, [value, allCountries]);

  // Filter countries list based on input value
  const filteredItems = useMemo(() => {
    if (!value) return allCountries;
    return allCountries.filter(c =>
      c.cc?.startsWith(value.toUpperCase())
    );
  }, [value, allCountries]);

  // Get visible items based on pagination
  const visibleItems = useMemo(() => {
    return filteredItems.slice(0, visibleCount);
  }, [filteredItems, visibleCount]);

  // Handle input changes and propagate them to parent
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const upperValue = e.target.value.toUpperCase();
    
    // Always propagate changes to parent
    onCountrySelect(upperValue, "");
    
    setVisibleCount(COUNTRY_PAGE_SIZE);
    setIsOpen(true);

    // If we have exactly 2 characters, try to find and select country
    if (upperValue.length === 2) {
      const exactMatch = allCountries.find(c => c.cc === upperValue);
      if (exactMatch?.cc) {
        // If PSC or city are not empty, select country and trigger query
        if (psc.trim() !== "" || city.trim() !== "") {
          onCountrySelect(exactMatch.cc, exactMatch.flag);
          setIsOpen(false);
          onNextFieldFocus?.();
        }
      }
    }
  }, [allCountries, onCountrySelect, onNextFieldFocus, psc, city]);

  // Handle country selection from dropdown
  const handleSelect = useCallback((selected: Country) => {
    if (!selected.cc) return;
    
    // If PSC or city are not empty, select country and trigger query
    if (psc.trim() !== "" || city.trim() !== "") {
      onCountrySelect(selected.cc, selected.flag);
      setIsOpen(false);
      onNextFieldFocus?.();
    }
  }, [onCountrySelect, onNextFieldFocus, psc, city]);

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
  
      if (!value && validFirstChars.size > 0) {
        if (!validFirstChars.has(upperKey)) {
          e.preventDefault();
        }
      } 
      else if (value.length === 1 && validSecondChars.size > 0) {
        if (!validSecondChars.has(upperKey)) {
          e.preventDefault();
        }
      } 
      else if (value.length >= 2) {
        e.preventDefault();
      }
    }
  }, [value, isOpen, validFirstChars, validSecondChars]);

  // Handle pagination for loading more items
  const handleLoadMore = useCallback(() => {
    setVisibleCount(prev => prev + COUNTRY_PAGE_SIZE);
  }, []);

  // Render individual country item in dropdown
  const renderCountryItem = useCallback((
    country: Country,
    { isHighlighted }: { isHighlighted: boolean }
  ) => (
    <div
      className={`item-content ${isHighlighted ? 'highlighted' : ''}`}
      tabIndex={0}
    >
      <img
        src={`/flags/4x3/optimized/${country.cc.toLowerCase()}.svg`}
        alt={`${country.cc} flag`}
        className={`${locationType}-flag`}
        aria-hidden={true}
      />
      <span className={`${locationType}-cc`}>{country.cc}</span>
      <span className="country-name">{country.name_en}</span>
      <span className="country-local">({country.name_local})</span>
    </div>
  ), [locationType]);

  // Generate unique key for list items
  const getItemKey = useCallback((item: Country) => {
    return item.cc || `country-${item.name_en}`;
  }, []);

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
        value={value}
        placeholder="CC"
        maxLength={2}
        onChange={handleInputChange}
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
        onLoadMore={handleLoadMore}
        inputRef={inputRef}
        variant="country"
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