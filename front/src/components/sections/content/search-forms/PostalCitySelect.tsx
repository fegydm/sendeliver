// File: src/components/sections/content/search-forms/PostalCitySelect.tsx
// Last change: Fixed flag rendering and improved input handling

import React, { useRef, useState, useCallback } from "react";
import { useLocation } from "./LocationContext";
import { BaseDropdown } from "./BaseDropdown";
import type { LocationSuggestion } from '@/types/location.types';
import { usePagination } from '@/hooks/usePagination';

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
  const { postalCode, city, suggestions } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);

  const pagination = usePagination({
    dataPageSize: 20,
    uiPageSize: 8
  });

  const defaultPostalRef = useRef<HTMLInputElement>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const activePostalRef = postalCodeRef || defaultPostalRef;

  const handlePostalCodeChange = useCallback(async (value: string) => {
    await postalCode.handleChange(value);
    setIsOpen(true);
    setHighlightedIndex(null);
    pagination.reset();
  }, [postalCode, pagination]);

  const handleCityChange = useCallback(async (value: string) => {
    await city.handleChange(value);
    setIsOpen(true);
    setHighlightedIndex(null);
    pagination.reset();
  }, [city, pagination]);

  const handleSelect = useCallback((suggestion: LocationSuggestion, index: number) => {
    postalCode.handleChange(suggestion.postalCode);
    city.handleChange(suggestion.city);
    setIsOpen(false);
    setHighlightedIndex(null);

    if (dateInputRef?.current) {
      dateInputRef.current.focus();
      onValidSelection();
    }
  }, [postalCode, city, dateInputRef, onValidSelection]);

  const handleDropdownClose = useCallback(() => {
    setIsOpen(false);
    setHighlightedIndex(null);
  }, []);

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
            onFocus={() => {
              setIsOpen(true);
              setIsInputFocused(true);
            }}
            onBlur={() => setIsInputFocused(false)}
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
        onClose={handleDropdownClose}
        inputRef={activePostalRef}
        hasMore={pagination.hasMore}
        onLoadMore={pagination.loadMore}
        highlightedIndex={highlightedIndex}
        isInputFocused={isInputFocused}
        renderItem={(suggestion, isHighlighted) => (
          <div className={`suggestion-item ${isHighlighted ? 'highlighted' : ''}`}>
            {suggestion.countryCode && (
              <img
                src={`/flags/4x3/${suggestion.countryCode.toLowerCase()}.svg`}
                alt={`${suggestion.countryCode} flag`}
                className="country-flag-small"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            )}
            <span className="postal-code">{suggestion.postalCode}</span>
            <span className="city-name">{suggestion.city}</span>
          </div>
        )}
      />
    </div>
  );
}

export default PostalCitySelect;