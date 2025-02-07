// File: src/components/sections/content/search-forms/PostalCitySelect.tsx

import React, { useRef, useState, useCallback } from "react";
import { useLocation } from "./LocationContext";
import { BaseDropdown } from "./BaseDropdown";
import type { LocationSuggestion } from '@/types/location.types';

interface PostalCitySelectProps {
  postalCodeRef?: React.RefObject<HTMLInputElement>;
  dateInputRef?: React.RefObject<HTMLInputElement>;
  onValidSelection: () => void;
}

export function PostalCitySelect({
  postalCodeRef,
  dateInputRef,
  onValidSelection
}: PostalCitySelectProps) {
  // Get context values and functions
  const { postalCode, city, suggestions, loadMore, validateLocation, apiHasMore } = useLocation();

  // Compute total items as suggestions length plus one if API indicates more items are available
  const computedTotalItems = suggestions.length + (apiHasMore ? 1 : 0);

  console.log("[PostalCitySelect] Current suggestions:", suggestions);
  console.log("[PostalCitySelect] apiHasMore:", apiHasMore);
  console.log("[PostalCitySelect] Computed total items:", computedTotalItems);

  // UI state and refs
  const [isOpen, setIsOpen] = useState(false);
  const defaultPostalRef = useRef<HTMLInputElement>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const activePostalRef = postalCodeRef || defaultPostalRef;
  const timeoutRef = useRef<number | null>(null);

  // Local state for inputs
  const [localPostal, setLocalPostal] = useState(postalCode.value);
  const [localCity, setLocalCity] = useState(city.value);

  // Handle validation with debounce
  const handleValidation = useCallback((postalValue: string, cityValue: string) => {
    console.log("[PostalCitySelect] Debounced validation - postalValue:", postalValue, "cityValue:", cityValue);
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    setLocalPostal(postalValue);
    setLocalCity(cityValue);
    timeoutRef.current = window.setTimeout(() => {
      console.log("[PostalCitySelect] Updating context values - postalValue:", postalValue, "cityValue:", cityValue);
      postalCode.setValue(postalValue);
      city.setValue(cityValue);
      if (postalValue || cityValue) {
        console.log("[PostalCitySelect] Calling validateLocation with:", postalValue, cityValue);
        validateLocation(postalValue, cityValue);
      }
    }, 300);
  }, [postalCode, city, validateLocation]);

  // Handle postal code input
  const handlePostalCodeInput = useCallback((value: string) => {
    console.log("[PostalCitySelect] Postal code input changed:", value);
    handleValidation(value, localCity);
    setIsOpen(true);
  }, [handleValidation, localCity]);

  // Handle city input
  const handleCityInput = useCallback((value: string) => {
    console.log("[PostalCitySelect] City input changed:", value);
    handleValidation(localPostal, value);
    setIsOpen(true);
  }, [handleValidation, localPostal]);

  // Handle suggestion selection
  const handleSelect = useCallback((suggestion: LocationSuggestion) => {
    console.log("[PostalCitySelect] Suggestion selected:", suggestion);
    const newPostal = suggestion.postal_code;
    const newCity = suggestion.place_name;
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    setLocalPostal(newPostal);
    setLocalCity(newCity);
    postalCode.setValue(newPostal);
    city.setValue(newCity);
    validateLocation(newPostal, newCity);
    setIsOpen(false);
    if (dateInputRef?.current) {
      dateInputRef.current.focus();
      onValidSelection();
    }
  }, [dateInputRef, onValidSelection, postalCode, city, validateLocation]);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Handle dropdown close
  const handleDropdownClose = useCallback(() => {
    console.log("[PostalCitySelect] Dropdown closed");
    setIsOpen(false);
  }, []);

  // Prepare suggestions for display; if there are 21 suggestions, display only the first 20.
  const displayedSuggestions = suggestions.length === 21
    ? suggestions.slice(0, 20)
    : suggestions;

  console.log("[PostalCitySelect] Dropdown isOpen:", isOpen, "Displayed suggestions:", displayedSuggestions);

  return (
    <div className="location-search">
      <div className="location-inputs">
        <div className="postal-code-wrapper">
          <input
            ref={activePostalRef}
            type="text"
            value={localPostal}
            onChange={e => handlePostalCodeInput(e.target.value)}
            onFocus={() => {
              console.log("[PostalCitySelect] Postal input focused");
              setIsOpen(true);
            }}
            placeholder="Postal code"
            className="postal-input"
          />
        </div>
        <input
          ref={cityInputRef}
          type="text"
          value={localCity}
          onChange={e => handleCityInput(e.target.value)}
          placeholder="City"
          className="city-input"
        />
      </div>
      <BaseDropdown
        items={displayedSuggestions}
        isOpen={isOpen && displayedSuggestions.length > 0}
        onSelect={handleSelect}
        onClose={handleDropdownClose}
        inputRef={activePostalRef}
        totalItems={computedTotalItems}
        onLoadMore={loadMore}
        renderItem={(suggestion, { isHighlighted }) => (
          <div className={`suggestion-item ${isHighlighted ? 'highlighted' : ''}`}>
            <img
              src={`/flags/4x3/optimized/${suggestion.country_code.toLowerCase()}.svg`}
              alt={`${suggestion.country_code} flag`}
              className="country-flag-small"
            />
            <span className="country-code">{suggestion.country_code}</span>
            <span className="postal-code">{suggestion.postal_code}</span>
            <span className="city-name">{suggestion.place_name}</span>
          </div>
        )}
      />
    </div>
  );
}

export default PostalCitySelect;
