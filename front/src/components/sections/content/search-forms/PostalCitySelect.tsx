// File: src/components/sections/content/search-forms/PostalCitySelect.tsx
// Last change: Complete rewrite with unified naming and search logic

import React, { useState, useCallback, useEffect, useRef } from "react";
import PostalCodeInput from "@/components/PostalCodeInput";
import { BaseDropdown } from "./BaseDropdown";
import { LOCATION_PAGE_SIZE, DEBOUNCE_LOCATION_SEARCH } from "@/constants/pagination.constants";
import { LocationType, LocationSuggestion } from "@/types/location.types";

interface PostalCitySelectProps {
  pscRef?: React.RefObject<HTMLInputElement>;
  dateInputRef?: React.RefObject<HTMLInputElement>;
  onValidSelection: () => void;
  onSelectionChange?: (location: Omit<LocationSuggestion, 'priority'>) => void;
  locationType: LocationType;
  cc?: string;
  postalCodeRegex?: string;
  dbPostalCodeMask: string;
}

export function PostalCitySelect({
  pscRef,
  dateInputRef,
  onValidSelection,
  onSelectionChange,
  locationType,
  cc,
  dbPostalCodeMask,
}: PostalCitySelectProps) {
  // State
  const [psc, setPsc] = useState("");
  const [city, setCity] = useState("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeField, setActiveField] = useState<"psc" | "city" | null>(null);

  // Refs
  const cityInputRef = useRef<HTMLInputElement>(null);
  const searchTimer = useRef<NodeJS.Timeout>();
  const activePscRef = pscRef || useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load location suggestions from the API
  const loadSuggestions = useCallback(
    async (pscValue: string, cityValue: string, pagination?: { lastPsc?: string; lastCity?: string }) => {
      // Skip if both fields are empty or contain only whitespace
      if (!pscValue.trim() && !cityValue.trim()) {
        setSuggestions([]);
        return false;
      }

      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (pscValue.trim()) params.append("psc", pscValue.trim());
        if (cityValue.trim()) params.append("city", cityValue.trim());
        if (pagination?.lastPsc) params.append("lastPsc", pagination.lastPsc);
        if (pagination?.lastCity) params.append("lastCity", pagination.lastCity);
        params.append("limit", LOCATION_PAGE_SIZE.toString());

        // Choose endpoint based on country code length
        let endpoint = '/api/geo/location';
        
        if (cc?.trim()) {
          if (cc.length === 2) {
            endpoint = '/api/geo/location/by-country';
            params.append("cc", cc);
          } else if (cc.length === 1) {
            params.append("cc", cc);
          }
        }

        const response = await fetch(`${endpoint}?${params.toString()}`);
        if (!response.ok) {
          throw new Error(`Failed to load locations: ${response.status}`);
        }
        const data = await response.json();
        setSuggestions(prev => (pagination ? [...prev, ...data.results] : data.results));
        return data.hasMore;
      } catch (error) {
        console.error("Failed to load suggestions:", error);
        setSuggestions([]);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [cc]
  );

  // Debounced search
  const debouncedSearch = useCallback(
    (pscValue: string, cityValue: string) => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
      
      // Only search if at least one field has non-whitespace characters
      if (!pscValue.trim() && !cityValue.trim()) {
        setSuggestions([]);
        return;
      }

      searchTimer.current = setTimeout(() => {
        loadSuggestions(pscValue, cityValue);
      }, DEBOUNCE_LOCATION_SEARCH);
    },
    [loadSuggestions]
  );

  // Handle postal code input change
  const handlePscInputChange = useCallback(
    (newValue: string) => {
      setPsc(newValue);
      setActiveField("psc");
      setIsOpen(true);
      
      if (newValue.trim() || city.trim()) {
        debouncedSearch(newValue, city);
      } else {
        setSuggestions([]);
      }
    },
    [city, debouncedSearch]
  );

  // Handle city input change
  const handleCityInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setCity(newValue);
      setActiveField("city");
      setIsOpen(true);
      
      if (psc.trim() || newValue.trim()) {
        debouncedSearch(psc, newValue);
      } else {
        setSuggestions([]);
      }
    },
    [psc, debouncedSearch]
  );

  // Effect for initial search if we have values
  useEffect(() => {
    if (psc.trim() || city.trim()) {
      debouncedSearch(psc, city);
    }
  }, [cc]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, []);

  // Auto-select effect
  useEffect(() => {
    if (isOpen && activeField === "psc" && suggestions.length === 1) {
      handleSelect(suggestions[0]);
    }
  }, [suggestions, isOpen, activeField]);

  // Handle selection of a location item from the dropdown
  const handleSelect = useCallback(
    (item: LocationSuggestion) => {
      setPsc(item.psc);
      setCity(item.city);
      setIsOpen(false);
      
      if (onSelectionChange) {
        const { priority, ...location } = item;
        onSelectionChange(location);
      }
      
      if (dateInputRef?.current) {
        dateInputRef.current.focus();
        onValidSelection();
      }
    },
    [dateInputRef, onValidSelection, onSelectionChange]
  );

  // Render a location item in the dropdown
  const renderLocationItem = useCallback(
    (item: LocationSuggestion, { isHighlighted }: { isHighlighted: boolean }) => (
      <div className={`item-suggestion ${isHighlighted ? "highlighted" : ""}`}>
        <img
          src={item.flag}
          alt={`${item.cc} flag`}
          className={`${locationType}-flag`}
        />
        <div className="location-details">
          <span className={`${locationType}-cc`}>{item.cc}</span>
          <span className={`${locationType}-psc`}>{item.psc}</span>
          <span className={`${locationType}-city`}>{item.city}</span>
        </div>
      </div>
    ),
    [locationType]
  );

  const renderNoResults = useCallback(() => {
    if (isLoading) return <div className="no-results">Loading...</div>;
    if (!psc.trim() && !city.trim()) return <div className="no-results">Enter a value in any field</div>;
    return <div className="no-results">No results found</div>;
  }, [psc, city, isLoading]);

  const handleLoadMore = useCallback(
    (lastItem: LocationSuggestion | null) => {
      if (lastItem) {
        loadSuggestions(psc, city, { 
          lastPsc: lastItem.psc, 
          lastCity: lastItem.city 
        });
      }
    },
    [psc, city, loadSuggestions]
  );

  const getItemKey = useCallback(
    (item: LocationSuggestion) => 
      `${item.cc}-${item.psc}-${item.city}`,
    []
  );

  const handleDropdownClose = useCallback(() => {
    setIsOpen(false);
    setActiveField(null);
  }, []);

  return (
    <div className="dd-wrapper" ref={dropdownRef}>
      <div className="dd-inputs">
        <PostalCodeInput
          dbMask={dbPostalCodeMask}
          initialValue={psc}
          onChange={handlePscInputChange}
          placeholder="PSC"
          className={`${locationType}-psc`}
        />
        <input
          ref={cityInputRef}
          type="text"
          value={city}
          onChange={handleCityInput}
          placeholder="Place/City"
          className={`${locationType}-city`}
          aria-autocomplete="list"
          aria-controls="location-dropdown"
          aria-expanded={isOpen}
        />
      </div>
      <BaseDropdown<LocationSuggestion>
        items={suggestions}
        isOpen={isOpen}
        onSelect={handleSelect}
        onClose={handleDropdownClose}
        onLoadMore={handleLoadMore}
        inputRef={activeField === "psc" ? activePscRef : cityInputRef}
        renderItem={renderLocationItem}
        variant="location"
        locationType={locationType}
        getItemKey={getItemKey}
        selectedItem={null}
        totalItems={suggestions.length}
        pageSize={LOCATION_PAGE_SIZE}
        onNoResults={renderNoResults}
        ariaLabel="Location suggestions"
        loadMoreText="Load more locations..."
      />
    </div>
  );
}

export default PostalCitySelect;