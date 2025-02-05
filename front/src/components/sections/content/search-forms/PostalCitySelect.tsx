// File: src/components/sections/content/search-forms/PostalCitySelect.tsx
// Last change: Refactored to use new components and hooks

import React, { useRef, useState } from "react";
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
  const { postalCode, city, suggestions, pagination } = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Input refs
  const defaultPostalRef = useRef<HTMLInputElement>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const activePostalRef = postalCodeRef || defaultPostalRef;

  // Handle postal code changes
  const handlePostalCodeChange = async (value: string) => {
    await postalCode.handleChange(value);
    setIsOpen(value.trim() !== "");
    pagination.reset();
  };

  // Handle city changes
  const handleCityChange = async (value: string) => {
    await city.handleChange(value);
    setIsOpen(true);
    pagination.reset();
  };

  // Handle suggestion selection
  const handleSelect = (suggestion: LocationSuggestion) => {
    postalCode.handleChange(suggestion.postalCode);
    city.handleChange(suggestion.city);
    setIsOpen(false);

    if (dateInputRef?.current) {
      dateInputRef.current.focus();
      onValidSelection();
    }
  };

  // Get visible suggestions based on pagination
  const visibleSuggestions = suggestions.slice(0, pagination.getVisibleCount());

  return (
    <div className="location-search">
      <div className="location-inputs">
        <div className="postal-code-wrapper">
          <input
            ref={activePostalRef}
            type="text"
            value={postalCode.value}
            onChange={e => handlePostalCodeChange(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder="Postal code"
            className="postal-input"
          />
        </div>

        <input
          ref={cityInputRef}
          type="text"
          value={city.value}
          onChange={e => handleCityChange(e.target.value)}
          placeholder="City"
          className="city-input"
        />
      </div>

      <BaseDropdown
        items={visibleSuggestions}
        isOpen={isOpen && visibleSuggestions.length > 0}
        onSelect={handleSelect}
        inputRef={activePostalRef}
        hasMore={pagination.hasMore}
        onLoadMore={pagination.loadMore}
        renderItem={(suggestion, isHighlighted) => (
          <div className={`suggestion-item ${isHighlighted ? 'highlighted' : ''}`}>
            <img
              src={suggestion.flagUrl}
              alt={`${suggestion.countryCode} flag`}
              className="country-flag-small"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <span className="postal-code">{suggestion.postalCode}</span>
            <span className="city-name">{suggestion.city}</span>
          </div>
        )}
      />
    </div>
  );
}
export default PostalCitySelect;