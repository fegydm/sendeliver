// File: src/components/sections/content/search-forms/PostalCitySelect.tsx
// Last change: Fixed coordinate handling to support both API and front-end formats

import React, { useState, useCallback, useEffect, useRef } from "react";
import PostalCodeInput from "@/components/elements/PostalCodeInput";
import { BaseDropdown } from "../../../elements/BaseDropdown";
import { LOCATION_PAGE_SIZE, DEBOUNCE_LOCATION_SEARCH } from "@/constants/pagination.constants";
import { LocationType, LocationSuggestion } from "@/types/transport-forms.types";

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
  const [psc, setPsc] = useState("");
  const [city, setCity] = useState("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeField, setActiveField] = useState<"psc" | "city" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualOverride, setManualOverride] = useState(false);

  const cityInputRef = useRef<HTMLInputElement>(null);
  const searchTimer = useRef<NodeJS.Timeout>();
  const activePscRef = pscRef || useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);


  const validateSearchInput = useCallback((pscValue: string, cityValue: string): boolean => {
    return pscValue.trim().length > 0 || cityValue.trim().length > 0;
  }, []);

  const loadSuggestions = useCallback(
    async (pscValue: string, cityValue: string, pagination?: { lastPsc?: string; lastCity?: string }) => {
      setError(null);

      if (!validateSearchInput(pscValue, cityValue)) {
        console.log(`[PostalCitySelect] ${locationType} No search input provided`);
        setSuggestions([]);
        return false;
      }

      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (pscValue.trim()) params.append("psc", pscValue.trim());
        if (cityValue.trim()) params.append("city", cityValue.trim());
        if (cc?.trim()) params.append("cc", cc.trim());
        if (pagination?.lastPsc) params.append("lastPsc", pagination.lastPsc);
        if (pagination?.lastCity) params.append("lastCity", pagination.lastCity);
        params.append("limit", LOCATION_PAGE_SIZE.toString());

        const endpoint = '/api/geo/location';
        const requestUrl = `${endpoint}?${params.toString()}`;

        console.log(`[PostalCitySelect] ${locationType} Loading suggestions:`, { psc: pscValue, city: cityValue, cc });

        const response = await fetch(requestUrl);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Server error ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        
        // Debug API response to check data structure
        if (data.results && data.results.length > 0) {
          console.log(`[PostalCitySelect] ${locationType} API response sample:`, data.results[0]);
        }
        
        // Normalize the results to ensure all items have lat/lng properties
        const normalizedResults = data.results.map((item: LocationSuggestion) => ({
          ...item,
          // Set coordinates with proper fallbacks
          lat: item.lat !== undefined ? item.lat : 
               item.latitude !== undefined ? item.latitude : 0,
          lng: item.lng !== undefined ? item.lng : 
               item.longitude !== undefined ? item.longitude : 0,
          // Ensure we have a flag property
          flag: item.flag || item.flag_url
        }));

        if (!pagination && normalizedResults.length === 1 && !manualOverride) {
          handleSelect(normalizedResults[0]);
          return false;
        }

        setSuggestions(prev => (pagination ? [...prev, ...normalizedResults] : normalizedResults));
        return data.hasMore;
      } catch (error) {
        console.error(`[PostalCitySelect] ${locationType} Load error:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load suggestions';
        setError(errorMessage);
        setSuggestions([]);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [cc, locationType, validateSearchInput, manualOverride]
  );

  // Enhanced to always provide complete location data to parent
  const handleSelect = useCallback((item: LocationSuggestion) => {
    console.log(`[PostalCitySelect] ${locationType} Selected:`, item);
    
    // Update local state
    setPsc(item.psc);
    setCity(item.city);
    setIsOpen(false);
    
    // Always notify parent component with complete location data
    if (onSelectionChange) {
      // Create a complete location object with consistent properties
      const locationData: Omit<LocationSuggestion, 'priority'> = {
        cc: item.cc || '',
        flag: item.flag || item.flag_url || 
              (item.cc ? `/flags/4x3/optimized/${item.cc.toLowerCase()}.svg` : ''),
        psc: item.psc,
        city: item.city,
        // Ensure we always provide coordinates with fallbacks to prevent null/undefined
        lat: item.lat ?? item.latitude ?? 0,
        lng: item.lng ?? item.longitude ?? 0,
      };
      
      console.log(`[PostalCitySelect] ${locationType} Sending to parent:`, locationData);
      onSelectionChange(locationData);
    }
    
    onValidSelection();
    
    // Focus the next field if provided
    if (dateInputRef?.current) {
      dateInputRef.current.focus();
    }
    
    setManualOverride(false);
  }, [onSelectionChange, onValidSelection, dateInputRef, locationType]);

  const debouncedSearch = useCallback(
    (pscValue: string, cityValue: string) => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
      searchTimer.current = setTimeout(() => {
        loadSuggestions(pscValue, cityValue);
      }, DEBOUNCE_LOCATION_SEARCH);
    },
    [loadSuggestions]
  );

  const handleInputFocus = useCallback((field: "psc" | "city") => {
    setActiveField(field);
    setIsOpen(true);
    if (validateSearchInput(psc, city)) debouncedSearch(psc, city);
  }, [psc, city, debouncedSearch, validateSearchInput]);

  const handlePscChange = useCallback(
    (newValue: string) => {
      setPsc(newValue);
      setActiveField("psc");
      setIsOpen(true);
      setError(null);
      setCity("");
      setManualOverride(true);
      debouncedSearch(newValue, "");
    },
    [debouncedSearch]
  );

  const handleCityChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setCity(newValue);
      setActiveField("city");
      setIsOpen(true);
      setError(null);
      setPsc("");
      setManualOverride(true);
      debouncedSearch("", newValue);
    },
    [debouncedSearch]
  );

  const handleClickOutside = useCallback((event: MouseEvent) => {
    const target = event.target as Node;
    const dropdown = dropdownRef.current;
    const isPscInput = activePscRef.current?.contains(target);
    const isCityInput = cityInputRef.current?.contains(target);
    const isDropdown = dropdown?.contains(target);
    if (!isPscInput && !isCityInput && !isDropdown) {
      setIsOpen(false);
      setActiveField(null);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  useEffect(() => {
    setSuggestions([]);
    if (validateSearchInput(psc, city)) debouncedSearch(psc, city);
  }, [cc, psc, city, debouncedSearch, validateSearchInput]);

  useEffect(() => {
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, []);

  const renderLocationItem = useCallback((
    item: LocationSuggestion, 
    { isHighlighted }: { isHighlighted: boolean }
  ) => (
    <div className={`dropdown__item ${isHighlighted ? "dropdown--highlighted" : ""} ${
      activeField === 'psc' ? 'location-item--focus-psc' : 
      activeField === 'city' ? 'location-item--focus-city' : ''
    }`}>
      {item.cc && (
        <img
          src={`/flags/4x3/optimized/${item.cc.toLowerCase()}.svg`}
          alt={`${item.cc} flag`}
          className="dropdown__item-flag"
        />
      )}
      <div className="dropdown__item-details">
        <span className="dropdown__item-code">{item.cc}</span>
        <span className="dropdown__item-postal">{item.psc}</span>
        <span className="dropdown__item-city">{item.city}</span>
      </div>
    </div>
  ), [activeField]);

  const renderNoResults = useCallback(() => {
    if (isLoading) return <div className="dropdown__no-results">Loading...</div>;
    if (error) return <div className="dropdown__no-results dropdown__no-results--error">{error}</div>;
    if (!validateSearchInput(psc, city)) return <div className="dropdown__no-results">Enter a value in any field</div>;
    return <div className="dropdown__no-results">No results found</div>;
  }, [psc, city, isLoading, error, validateSearchInput]);

  const handleLoadMore = useCallback(() => {
    if (suggestions.length > 0) {
      const lastItem = suggestions[suggestions.length - 1];
      loadSuggestions(psc, city, {
        lastPsc: lastItem.psc,
        lastCity: lastItem.city
      });
    }
  }, [psc, city, loadSuggestions, suggestions]);

  return (
    <div className={`location-select location-select--${locationType}`} ref={dropdownRef}>
      <PostalCodeInput
        value={psc}
        onChange={handlePscChange}
        mask={dbPostalCodeMask}
        placeholder="Postal code"
        className="location-select__psc"
        ref={activePscRef}
        onFocus={() => { 
          setCity(""); 
          setManualOverride(true);
          handleInputFocus("psc"); 
        }}
      />
      <input
        ref={cityInputRef}
        type="text"
        value={city}
        onChange={handleCityChange}
        onFocus={() => { 
          setPsc(""); 
          setManualOverride(true);
          handleInputFocus("city"); 
        }}
        placeholder="Place/City"
        className="location-select__city"
        aria-autocomplete="list"
        aria-controls="location-select-dropdown"
        aria-expanded={isOpen}
      />
      <BaseDropdown
        items={suggestions}
        isOpen={isOpen && !error}
        onSelect={(item) => handleSelect(item)}
        renderItem={renderLocationItem}
        variant="location"
        position="left"
        className="location-select__dropdown"
        onLoadMore={handleLoadMore}
        totalItems={suggestions.length}
        pageSize={LOCATION_PAGE_SIZE}
        loadMoreText="Load more locations..."
        onNoResults={renderNoResults}
        ariaLabel="Location suggestions"
      />
    </div>
  );
}

export default PostalCitySelect;