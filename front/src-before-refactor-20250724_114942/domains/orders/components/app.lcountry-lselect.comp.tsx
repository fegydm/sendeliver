// File: src/domains/orders/components/app.lcountry-lselect.comp.tsx
// Last change: Prevented unnecessary onCountrySelect calls in useEffect to avoid resetting parent data

import React, { useRef, useState, useMemo, useCallback, useEffect } from "react";
import { BaseDropdown } from "@/components/shared/elements/BaseDropdown";
import type { Country } from "@/types/transport-forms.types";
import { useCountriesContext } from "@shared/contexts/CountriesContext";
import { useUINavigation } from "@/hooks/useUINavigation";
import Input from "@/components/shared/ui/input.ui";

interface CountrySelectProps {
  onCountrySelect: (cc: string, flag: string) => void;
  onNextFieldFocus: () => void;
  initialValue?: string;
  locationType: "pickup" | "delivery";
  role?: "sender" | "hauler";
}

export function CountrySelect({
  onCountrySelect,
  onNextFieldFocus,
  initialValue = "",
  locationType,
  role,
}: CountrySelectProps) {
  const [inputValue, setInputValue] = useState(initialValue);
  const [isOpen, setIsOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(20);
  const [isDropdownHovered, setIsDropdownHovered] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const componentRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLElement | null)[]>([]);

  // Use CountriesContext for countries data
  const { countries: allCountries, isLoading, getFlagUrl } = useCountriesContext();

  // Sync inputValue with initialValue without triggering onCountrySelect
  useEffect(() => {
    if (initialValue !== inputValue) {
      console.log(`[CountrySelect] Syncing inputValue to initialValue: ${initialValue}`);
      setInputValue(initialValue);
      if (inputRef.current && initialValue !== inputRef.current.value) {
        inputRef.current.value = initialValue;
      }
      // Do not call onCountrySelect here to avoid resetting parent data
    }
  }, [initialValue, inputValue]);

  const filteredItems = useMemo(() => {
    // Filter countries based on input value
    if (isLoading) return [];
    
    if (!allCountries || !Array.isArray(allCountries) || allCountries.length === 0) {
      console.warn("[CountrySelect] No countries data available:", allCountries);
      return [];
    }
    
    if (!inputValue) {
      const validCountries = allCountries.filter((c) => c && typeof c === "object" && c.cc);
      return validCountries;
    }
    
    const upperValue = inputValue.toUpperCase();
    return allCountries.filter((c: Country) => c && c.cc && c.cc.toUpperCase().startsWith(upperValue));
  }, [inputValue, allCountries, isLoading]);

  // Get visible items based on pagination
  const visibleItems = useMemo(() => filteredItems.slice(0, visibleCount), [filteredItems, visibleCount]);

  // Setup keyboard navigation
  const { highlightedIndex, setHighlightedIndex, handleKeyDown: handleUINavKeyDown } = useUINavigation({
    items: visibleItems,
    isOpen,
    onSelect: (country) => handleSelect(country as Country),
    pageSize: 20,
    onLoadMore: () => setVisibleCount((prev) => prev + 20),
    inputRef,
  });

  // Handle click outside to close dropdown
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (componentRef.current && !componentRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  // Handle input change and process country code
  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const upperValue = event.target.value.toUpperCase();
      console.log(`[CountrySelect] Input changed: ${upperValue}`);
      setInputValue(upperValue);
      if (!isOpen) setIsOpen(true);

      if (!upperValue) {
        onCountrySelect("", "");
        setVisibleCount(20);
        return;
      }

      if (upperValue.length === 1) {
        if (allCountries && allCountries.some((c: Country) => c && c.cc && c.cc.startsWith(upperValue))) {
          onCountrySelect(upperValue, "");
        }
        return;
      }

      if (upperValue.length === 2) {
        const exactMatch = allCountries && allCountries.find((c: Country) => c && c.cc === upperValue);
        if (!exactMatch) {
          setInputValue(upperValue.charAt(0));
          return;
        }
        const flagUrl = getFlagUrl(exactMatch.cc);
        console.log(`[CountrySelect] Emitting country select: ${exactMatch.cc}, ${flagUrl}`);
        onCountrySelect(exactMatch.cc, flagUrl);
        setIsOpen(false);
        onNextFieldFocus();
      }
    },
    [allCountries, onCountrySelect, onNextFieldFocus, isOpen, getFlagUrl]
  );

  // Handle country selection from dropdown
  const handleSelect = useCallback(
    (selected: Country) => {
      if (!selected || !selected.cc) return;
      console.log(`[CountrySelect] Dropdown item selected: ${selected.cc}`);
      setInputValue(selected.cc);
      const flagUrl = selected.flag || getFlagUrl(selected.cc);
      onCountrySelect(selected.cc, flagUrl);
      setIsOpen(false);
      onNextFieldFocus();
    },
    [onCountrySelect, onNextFieldFocus, getFlagUrl]
  );

  // Handle input focus - open dropdown
  const handleFocus = useCallback(() => {
    if (!isLoading) setIsOpen(true);
  }, [isLoading]);

  // Handle input click
  const handleInputClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      if (!isLoading) setIsOpen(true);
    },
    [isLoading]
  );

  // Handle keyboard navigation
  const handleInputKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "ArrowDown") {
        if (document.activeElement === inputRef.current) {
          event.preventDefault();
          if (!isOpen && !isLoading) setIsOpen(true);
          if (highlightedIndex === null) setHighlightedIndex(0);
          dropdownRef.current?.focus();
        }
      } else if (event.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.focus();
      }
    },
    [highlightedIndex, isOpen, setHighlightedIndex, isLoading]
  );

  // Handle dropdown keyboard navigation
  const handleDropdownNavigation = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        handleUINavKeyDown(event);
      } else if (event.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.focus();
      }
    },
    [handleUINavKeyDown]
  );

  // Get flag source URL based on input value
  const flagSrc = useMemo(() => {
    return inputValue.length === 2 ? getFlagUrl(inputValue) : "/flags/4x3/optimized/gb.svg";
  }, [inputValue, getFlagUrl]);

  if (isLoading) return <div>Loading countries...</div>;

  return (
    <div ref={componentRef} className={`country-select country-select--${locationType}`}>
      <img
        src={flagSrc}
        className={`country-select__flag ${inputValue.length !== 2 ? "country-select__flag--inactive" : ""}`}
        alt="Country flag"
        onError={(e) => (e.currentTarget.src = "/flags/4x3/optimized/gb.svg")}
      />
      <Input
        ref={inputRef}
        type="text"
        value={inputValue}
        placeholder="CC"
        maxLength={2}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        onFocus={handleFocus}
        onClick={handleInputClick}
        className="country-select__input"
        role={role}
        variant="default"
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
        onLoadMore={() => setVisibleCount((prev) => prev + 20)}
        renderItem={(country, { isHighlighted }) => {
          if (!country || !country.cc) {
            return (
              <div className={`dropdown__item ${isHighlighted ? "dropdown--highlighted" : ""}`}>
                <span className="dropdown__item-code">?</span>
                <span className="dropdown__item-name">Unknown country</span>
              </div>
            );
          }
          return (
            <div
              className={`dropdown__item ${isHighlighted ? "dropdown--highlighted" : ""}`}
              ref={(el) => (itemsRef.current[visibleItems.indexOf(country)] = el)}
            >
              <img
                src={country.flag || getFlagUrl(country.cc)}
                alt={`${country.cc} flag`}
                className="dropdown__item-flag"
                onError={(e) => (e.currentTarget.src = "/flags/4x3/optimized/gb.svg")}
              />
              <span className="dropdown__item-code">{country.cc}</span>
              <span className="dropdown__item-name">{country.name_en || "Unknown"}</span>
              <span className="dropdown__item-local-name">({country.name_local || "N/A"})</span>
            </div>
          );
        }}
        getItemKey={(item: Country) => item?.cc || ""}
        ariaLabel="Country options"
        loadMoreText="Load more countries..."
        className="country-select__dropdown"
        ref={dropdownRef}
        onKeyDown={isDropdownHovered ? handleDropdownNavigation : undefined}
        onMouseEnter={() => setIsDropdownHovered(true)}
        onMouseLeave={() => setIsDropdownHovered(false)}
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