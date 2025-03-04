/* File: src/components/sections/content/search-forms/CountrySelect.tsx */
import React, { useRef, useState, useMemo, useCallback, useEffect } from "react";
import { BaseDropdown } from "./BaseDropdown";
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

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const componentRef = useRef<HTMLDivElement>(null);

  const { items: allCountries } = useCountries();
  const filteredItems = useMemo(() => {
    if (!inputValue) return allCountries;
    return allCountries.filter(c => c.cc?.startsWith(inputValue.toUpperCase()));
  }, [inputValue, allCountries]);
  const visibleItems = useMemo(() => filteredItems.slice(0, visibleCount), [filteredItems, visibleCount]);

  const { handleKeyDown: handleDropdownKeyDown } = useUINavigation({
    items: visibleItems,
    isOpen,
    onSelect: (country) => handleSelect(country),
    inputRef,
  });

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (componentRef.current && !componentRef.current.contains(event.target as Node)) setIsOpen(false);
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const upperValue = event.target.value.toUpperCase();
    setInputValue(upperValue);
    if (!upperValue) {
      onCountrySelect("", "");
      setVisibleCount(20);
      setIsOpen(true);
    } else if (upperValue.length === 1) {
      if (!allCountries.some(c => c.cc?.startsWith(upperValue))) return;
      onCountrySelect(upperValue, "");
      setIsOpen(true);
    } else if (upperValue.length === 2) {
      const exactMatch = allCountries.find(c => c.cc === upperValue);
      if (!exactMatch) return;
      const flagUrl = `/flags/4x3/optimized/${exactMatch.cc.toLowerCase()}.svg`;
      onCountrySelect(exactMatch.cc, flagUrl);
      setIsOpen(false);
      onNextFieldFocus();
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

  const handleFocus = useCallback(() => setIsOpen(true), []);

  // Updated handleKeyDown to use the dropdown focus behavior
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" && isOpen && dropdownRef.current) {
      event.preventDefault();
      // Simply focus the dropdown, it will auto-select the first item
      dropdownRef.current.focus();
      return;
    }
    handleDropdownKeyDown(event);
  }, [isOpen, handleDropdownKeyDown]);

  const flagSrc = inputValue.length === 2 ? `/flags/4x3/optimized/${inputValue.toLowerCase()}.svg` : "/flags/4x3/optimized/gb.svg";

  return (
    <div ref={componentRef} className={`country-select country-select--${locationType}`}>
      <img src={flagSrc} className={`country-select__flag ${inputValue.length !== 2 ? 'country-select__flag--inactive' : ''}`} alt="Country flag" />
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        placeholder="CC"
        maxLength={2}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        className="country-select__input"
        aria-autocomplete="list"
        aria-controls="country-select-dropdown"
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
          <div className={`dropdown__item ${isHighlighted ? 'dropdown--highlighted' : ''}`}>
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
      />
    </div>
  );
}

export default CountrySelect;