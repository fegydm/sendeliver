// File: src/components/sections/content/search-forms/CountrySelect.tsx
// Last change: Moved all logic into flag-cc, flag-cc__dropdown is now its direct child

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
  const [inputValue, setInputValue] = useState(initialValue);
  const [isOpen, setIsOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(20);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const componentRef = useRef<HTMLDivElement>(null);

  const { items: allCountries } = useCountries();

  const filteredItems = useMemo(() => {
    if (!inputValue) return allCountries;
    return allCountries.filter(c =>
      c.cc?.startsWith(inputValue.toUpperCase())
    );
  }, [inputValue, allCountries]);

  const visibleItems = useMemo(() => {
    return filteredItems.slice(0, visibleCount);
  }, [filteredItems, visibleCount]);

  // Handle click outside to close dropdown
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (componentRef.current && !componentRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  // Handle input change
  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const upperValue = event.target.value.toUpperCase();
    setInputValue(upperValue);

    if (!upperValue) {
      onCountrySelect("", "");
      setVisibleCount(20);
      setIsOpen(true);
      return;
    }

    if (upperValue.length === 1) {
      const hasMatchingCountries = allCountries.some(c =>
        c.cc?.startsWith(upperValue)
      );
      if (!hasMatchingCountries) {
        console.log(`[CountrySelect] No countries starting with ${upperValue}`);
        return;
      }
      onCountrySelect(upperValue, "");
      setIsOpen(true);
      return;
    }

    if (upperValue.length === 2) {
      const exactMatch = allCountries.find(c => c.cc === upperValue);
      if (!exactMatch) {
        console.log(`[CountrySelect] No exact match for ${upperValue}`);
        return;
      }
      const flagUrl = `/flags/4x3/optimized/${exactMatch.cc.toLowerCase()}.svg`;
      onCountrySelect(exactMatch.cc, flagUrl);
      setIsOpen(false);
      onNextFieldFocus();
      return;
    }
  }, [allCountries, onCountrySelect, onNextFieldFocus]);

  // Handle country selection from dropdown
  const handleSelect = useCallback((selected: Country) => {
    if (!selected.cc) return;
    setInputValue(selected.cc);
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
        const firstItem = dropdownRef.current.querySelector('.country-dropdown__item');
        if (firstItem instanceof HTMLElement) {
          firstItem.focus();
        }
      }
      return;
    }
    if (e.key.length === 1) {
      const upperKey = e.key.toUpperCase();
      if (!inputValue) {
        const hasMatchingCountries = allCountries.some(c =>
          c.cc?.startsWith(upperKey)
        );
        if (!hasMatchingCountries) {
          e.preventDefault();
          return;
        }
      }
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
      if (inputValue.length >= 2) {
        e.preventDefault();
      }
    }
  }, [inputValue, isOpen, allCountries]);

  const handleFocus = useCallback(() => {
    setIsOpen(true);
  }, []);

  // Determine flag to display
  const flagSrc = inputValue.length === 2
    ? `/flags/4x3/optimized/${inputValue.toLowerCase()}.svg`
    : "/flags/4x3/optimized/gb.svg";
  
  const flagClasses = `flag-cc__flag ${inputValue.length !== 2 ? 'flag-cc__flag--inactive' : ''}`;
  const inputClasses = `flag-cc__input flag-cc__input--${locationType}`;

  return (
    <div ref={componentRef} className="flag-cc">
      <img
        src={flagSrc}
        className={flagClasses}
        alt="Country flag"
      />
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        placeholder="CC"
        maxLength={2}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        className={inputClasses}
        aria-autocomplete="list"
        aria-controls="country-dropdown"
        aria-expanded={isOpen}
      />
      <BaseDropdown
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
            className={`country-dropdown__item ${isHighlighted ? 'country-dropdown__item--highlighted' : ''}`}
            tabIndex={0}
          >
            <img
              src={`/flags/4x3/optimized/${country.cc.toLowerCase()}.svg`}
              alt={`${country.cc} flag`}
              className="country-dropdown__flag"
            />
            <span className="country-dropdown__code">{country.cc}</span>
            <span className="country-dropdown__name">{country.name_en}</span>
            <span className="country-dropdown__local-name">({country.name_local})</span>
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