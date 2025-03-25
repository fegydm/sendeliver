// File: src/components/sections/content/search-forms/CountrySelect.tsx
// Last change: Added debugging and fixed filtering issue

import React, { useRef, useState, useMemo, useCallback, useEffect } from "react";
import { BaseDropdown } from "@/components/elements/BaseDropdown";
import type { Country } from "@/types/transport-forms.types";
import { useCountriesPreload } from "@/hooks/useCountriesPreload";
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

  const { countries: allCountries, isLoading } = useCountriesPreload();

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
        const flagUrl = `/flags/4x3/optimized/${initialValue.toLowerCase()}.svg`;
        onCountrySelect(initialValue, flagUrl);
      }
    }
  }, [initialValue, locationType, onCountrySelect, inputValue]);

  const filteredItems = useMemo(() => {
    // Important: Log what's coming in
    console.log(`[CountrySelect] Filtering with input: "${inputValue}"`, { 
      allCountries: allCountries?.length || 0, 
      isLoading 
    });

    if (isLoading) return [];
    
    // Handle case when allCountries might be empty or undefined
    if (!allCountries || !Array.isArray(allCountries) || allCountries.length === 0) {
      console.warn('[CountrySelect] No countries data available:', allCountries);
      return [];
    }
    
    // Log sample of data to verify structure
    if (allCountries.length > 0) {
      console.log('[CountrySelect] Sample country:', allCountries[0]);
    }
    
    // When no input, return all valid countries
    if (!inputValue) {
      const validCountries = allCountries.filter(c => c && typeof c === 'object' && c.cc);
      console.log(`[CountrySelect] All valid countries: ${validCountries.length}`);
      return validCountries;
    }
    
    // Filter by input value
    const upperValue = inputValue.toUpperCase();
    const filtered = allCountries.filter((c: Country) => {
      // Only include countries with a valid cc property that starts with our input
      return c && typeof c === 'object' && c.cc && 
             typeof c.cc === 'string' && 
             c.cc.toUpperCase().startsWith(upperValue);
    });
    
    console.log(`[CountrySelect] Filtered ${filtered.length} countries with "${upperValue}"`);
    return filtered;
  }, [inputValue, allCountries, isLoading]);

  // Debug for filtered results
  useEffect(() => {
    console.log(`[CountrySelect] filteredItems:`, filteredItems);
  }, [filteredItems]);

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
    setIsOpen(true);

    if (!upperValue) {
      onCountrySelect("", "");
      setVisibleCount(20);
    } else if (upperValue.length === 2) {
      const exactMatch = allCountries && allCountries.find((c: Country) => c && c.cc === upperValue);
      if (exactMatch) {
        const flagUrl = `/flags/4x3/optimized/${exactMatch.cc.toLowerCase()}.svg`;
        onCountrySelect(exactMatch.cc, flagUrl);
        setIsOpen(false);
        onNextFieldFocus();
      }
    }
  }, [allCountries, onCountrySelect, onNextFieldFocus]);

  const handleSelect = useCallback((selected: Country) => {
    if (!selected || !selected.cc) return;
    setInputValue(selected.cc);
    const flagUrl = `/flags/4x3/optimized/${selected.cc.toLowerCase()}.svg`;
    onCountrySelect(selected.cc, flagUrl);
    setIsOpen(false);
    onNextFieldFocus();
  }, [onCountrySelect, onNextFieldFocus]);

  const handleFocus = useCallback(() => {
    console.log('[CountrySelect] Focus', { isLoading, countriesCount: allCountries?.length || 0 });
    if (!isLoading) {
      setIsOpen(true);
    }
  }, [isLoading, allCountries]);

  const handleInputClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    console.log('[CountrySelect] Click', { isLoading, countriesCount: allCountries?.length || 0 });
    if (!isLoading) {
      setIsOpen(true);
    }
  }, [isLoading, allCountries]);

  const handleInputKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      if (document.activeElement === inputRef.current || isInputHovered) {
        event.preventDefault();
        if (!isOpen && !isLoading) setIsOpen(true);
        if (highlightedIndex === null) setHighlightedIndex(0);
        dropdownRef.current?.focus();
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
  }, [inputValue, isOpen, isInputHovered, highlightedIndex, setHighlightedIndex, isLoading]);

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

  const handleInputMouseEnter = useCallback(() => setIsInputHovered(true), []);
  const handleInputMouseLeave = useCallback(() => setIsInputHovered(false), []);
  const handleDropdownMouseEnter = useCallback(() => setIsDropdownHovered(true), []);
  const handleDropdownMouseLeave = useCallback(() => setIsDropdownHovered(false), []);

  const flagSrc = useMemo(() => {
    if (inputValue.length === 2) {
      return `/flags/4x3/optimized/${inputValue.toLowerCase()}.svg`;
    }
    return "/flags/4x3/optimized/gb.svg";
  }, [inputValue]);

  // Render a message while loading
  if (isLoading) {
    return <div>Loading countries...</div>;
  }

  // Create a function that generates unique keys
  const getItemKeyFn = (item: Country) => {
    if (!item || !item.cc) {
      // Generate a unique ID for items without a cc code
      return `unknown-${Math.random().toString(36).substr(2, 9)}`;
    }
    return item.cc;
  };

  // Add debug info for when we're showing the dropdown but have no items
  console.log('[CountrySelect] Render with', {
    isOpen,
    visibleItemsCount: visibleItems.length,
    filteredItemsCount: filteredItems.length,
    allCountriesCount: allCountries?.length || 0
  });

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
        renderItem={(country: Country, { isHighlighted }: { isHighlighted: boolean }) => {
          // Guard against undefined country.cc
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
                src={`/flags/4x3/optimized/${country.cc.toLowerCase()}.svg`} 
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
        getItemKey={getItemKeyFn}
        ariaLabel="Country options"
        loadMoreText="Load more countries..."
        className="country-select__dropdown"
        ref={dropdownRef}
        onKeyDown={isDropdownHovered ? handleDropdownNavigation : undefined}
        onMouseEnter={handleDropdownMouseEnter}
        onMouseLeave={handleDropdownMouseLeave}
        // Custom prop for no results message
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