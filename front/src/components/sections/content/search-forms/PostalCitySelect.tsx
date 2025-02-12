// File: src/components/sections/content/search-forms/PostalCitySelect.tsx
// Last change: Added debounced search and improved field interactions

import React, { useRef, useState, useCallback, useMemo, useEffect } from "react";
import { BaseDropdown, type LocationType } from "./BaseDropdown";
import { LOCATION_PAGE_SIZE, UI_PAGE_SIZE, DEBOUNCE_LOCATION_SEARCH } from "@/constants/pagination.constants";
import type { LocationSuggestion } from "@/types/location.types";

interface PostalCitySelectProps {
  postalCodeRef?: React.RefObject<HTMLInputElement>;
  dateInputRef?: React.RefObject<HTMLInputElement>;
  onValidSelection: () => void;
  locationType: LocationType;
  countryCode?: string;
}

export function PostalCitySelect({
  postalCodeRef,
  dateInputRef,
  onValidSelection,
  locationType,
  countryCode,
}: PostalCitySelectProps) {
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeField, setActiveField] = useState<"postal" | "city" | null>(null);
  const [visibleCount, setVisibleCount] = useState(LOCATION_PAGE_SIZE);

  const defaultPostalRef = useRef<HTMLInputElement>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const searchTimer = useRef<NodeJS.Timeout>();
  const activePostalRef = postalCodeRef || defaultPostalRef;

  // Get visible suggestions based on current visibleCount
  const visibleSuggestions = useMemo(() => {
    const visible = suggestions.slice(0, visibleCount);
    console.log('📑 Visible suggestions:', {
      total: suggestions.length,
      visible: visible.length,
      visibleCount,
      showLoadMore: suggestions.length > visibleCount
    });
    return visible;
  }, [suggestions, visibleCount]);

  // Show load more button if we have more suggestions than visible
  const showLoadMore = useMemo(() => {
    const show = suggestions.length > visibleCount;
    console.log('🔄 Load more state:', {
      total: suggestions.length,
      visible: visibleCount,
      show
    });
    return show;
  }, [suggestions.length, visibleCount]);

  // Load suggestions from backend
  const loadSuggestions = useCallback(async (postalValue: string, cityValue: string) => {
    console.log('🔍 Loading suggestions:', { postalValue, cityValue, countryCode });
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (countryCode) {
        params.append('countryCode', countryCode);
      }
      if (postalValue) {
        params.append('postalCode', postalValue);
      }
      if (cityValue) {
        params.append('city', cityValue);
      }

      const response = await fetch(`/api/geo/location?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Failed to validate location: ${response.status}`);
      }

      const data = await response.json();
      console.log('📥 Received suggestions:', {
        count: data.results.length,
        hasMore: data.hasMore
      });
      
      setSuggestions(data.results);
      setVisibleCount(LOCATION_PAGE_SIZE);
    } catch (error) {
      console.error('❌ Failed to load suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [countryCode]);

  // Debounced search function
  const debouncedSearch = useCallback((postalValue: string, cityValue: string) => {
    if (searchTimer.current) {
      clearTimeout(searchTimer.current);
    }

    // If no search criteria, clear suggestions
    if (!postalValue && !cityValue && !countryCode) {
      setSuggestions([]);
      return;
    }

    searchTimer.current = setTimeout(() => {
      loadSuggestions(postalValue, cityValue);
    }, DEBOUNCE_LOCATION_SEARCH);
  }, [loadSuggestions, countryCode]);

  // Handle loading more results
  const handleLoadMore = useCallback(() => {
    console.log('👆 Loading more:', {
      currentVisible: visibleCount,
      newVisible: visibleCount + LOCATION_PAGE_SIZE,
      total: suggestions.length
    });
    setVisibleCount(prev => prev + LOCATION_PAGE_SIZE);
  }, [visibleCount, suggestions.length]);

  // Handle postal code input
  const handlePostalCodeInput = useCallback((value: string) => {
    setPostalCode(value);
    setActiveField("postal");
    setIsOpen(true);
    debouncedSearch(value, city);
  }, [city, debouncedSearch]);

  // Handle city input
  const handleCityInput = useCallback((value: string) => {
    setCity(value);
    setActiveField("city");
    setIsOpen(true);
    debouncedSearch(postalCode, value);
  }, [postalCode, debouncedSearch]);

  // Effect for countryCode changes
  useEffect(() => {
    if (countryCode && (postalCode || city)) {
      debouncedSearch(postalCode, city);
    }
  }, [countryCode, postalCode, city, debouncedSearch]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (searchTimer.current) {
        clearTimeout(searchTimer.current);
      }
    };
  }, []);

  // Handle selection
  const handleSelect = useCallback((suggestion: LocationSuggestion) => {
    setPostalCode(suggestion.postal_code);
    setCity(suggestion.place_name);
    setIsOpen(false);

    if (dateInputRef?.current) {
      dateInputRef.current.focus();
      onValidSelection();
    }
  }, [dateInputRef, onValidSelection]);

  // Render no results
  const renderNoResults = useCallback(() => {
    if (isLoading) return <span>Loading...</span>;
    if (!postalCode && !city && !countryCode) return <span>Enter value in any field</span>;
    return <span>No results found</span>;
  }, [postalCode, city, countryCode, isLoading]);

  return (
    <div className="dd-wrapper">
      <div className="dd-inputs">
        <input
          ref={activePostalRef}
          type="text"
          value={postalCode}
          onChange={(e) => handlePostalCodeInput(e.target.value)}
          onFocus={() => {
            setActiveField("postal");
            setIsOpen(true);
          }}
          placeholder="Postal code"
          className={`inp-postal inp-postal-${locationType}`}
          aria-autocomplete="list"
          aria-controls="location-dropdown"
        />
        <input
          ref={cityInputRef}
          type="text"
          value={city}
          onChange={(e) => handleCityInput(e.target.value)}
          onFocus={() => {
            setActiveField("city");
            setIsOpen(true);
          }}
          placeholder="City"
          className={`inp-city inp-city-${locationType}`}
          aria-autocomplete="list"
          aria-controls="location-dropdown"
        />
      </div>
      {isOpen && (
        <BaseDropdown<LocationSuggestion>
          items={visibleSuggestions}
          isOpen={isOpen}
          onSelect={handleSelect}
          onClose={() => setIsOpen(false)}
          onLoadMore={showLoadMore ? handleLoadMore : undefined}
          inputRef={activeField === "postal" ? activePostalRef : cityInputRef}
          totalItems={suggestions.length}
          pageSize={UI_PAGE_SIZE}
          onNoResults={renderNoResults}
          dropdownType="location"
          locationType={locationType}
          renderItem={(suggestion, { isHighlighted }) => (
            <div className={`item-suggestion ${isHighlighted ? "highlighted" : ""}`}>
              <img
                src={`/flags/4x3/optimized/${suggestion.country_code.toLowerCase()}.svg`}
                alt={`${suggestion.country_code} flag`}
                className="country-flag"
                aria-hidden={true}
              />
              <span className="country-code">{suggestion.country_code}</span>
              <span className="postal-code">{suggestion.postal_code}</span>
              <span className="city-name">{suggestion.place_name}</span>
            </div>
          )}
          ariaLabel="Location suggestions"
          loadMoreText="Load more locations..."
        />
      )}
    </div>
  );
}

export default PostalCitySelect;