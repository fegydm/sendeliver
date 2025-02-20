// File: src/components/sections/content/search-forms/CountrySelect.tsx
// Last change: For both pickup and delivery, default flag is /flags/4x3/optimized/en.svg with 50% opacity and grayscale

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
  const inputValue = initialValue;
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

  const handleInputChange = useCallback((value: string) => {
    const upperValue = value.toUpperCase();

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

  const handleSelect = useCallback((selected: Country) => {
    if (!selected.cc) return;
    const flagUrl = `/flags/4x3/optimized/${selected.cc.toLowerCase()}.svg`;
    onCountrySelect(selected.cc, flagUrl);
    setIsOpen(false);
    onNextFieldFocus();
  }, [onCountrySelect, onNextFieldFocus]);

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

  // Pre default flag pre obe sekcie, ak nie je zvolený iný kód (inputValue nie je dĺžky 2)
  const flagSrc = inputValue.length === 2
    ? `/flags/4x3/optimized/${inputValue.toLowerCase()}.svg`
    : "/flags/4x3/optimized/gb.svg";
  const flagStyle = inputValue.length === 2 ? {} : { filter: "grayscale(100%)", opacity: 0.3 };

  return (
    <div className="dd-inputs" ref={componentRef}>
      <img
        src={flagSrc}
        className={`flag-${locationType}`}
        style={flagStyle}
      />
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
