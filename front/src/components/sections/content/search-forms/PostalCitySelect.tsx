// File: src/components/sections/content/search-forms/PostalCitySelect.tsx
// Last change: Fixed isHighlighted usage in renderItem

import React, { useState, useCallback, useEffect, useRef } from "react";
import PostalCodeInput from "@/components/PostalCodeInput";
import { BaseDropdown } from "./BaseDropdown";
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

  const placeholderSuggestion: LocationSuggestion = {
    psc: '',
    city: '',
    cc: '',
    priority: 0,
    flag: '',
    lat: 0,
    lng: 0
  };

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
        if (!pagination && data.results.length === 1 && !manualOverride) {
          handleSelect(data.results[0]);
          return false;
        }

        setSuggestions(prev => (pagination ? [...prev, ...data.results] : data.results));
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

  const handleSelect = useCallback((item: LocationSuggestion) => {
    console.log(`[PostalCitySelect] ${locationType} Selected row:`, item);
    setPsc(item.psc);
    setCity(item.city);
    setIsOpen(false);
    if (onSelectionChange) {
      const locationData = {
        cc: item.cc || '',
        flag: item.cc ? `/flags/4x3/optimized/${item.cc.toLowerCase()}.svg` : '',
        psc: item.psc,
        city: item.city,
        lat: item.lat,
        lng: item.lng
      };
      onSelectionChange(locationData);
    }
    onValidSelection();
    if (dateInputRef?.current) {
      dateInputRef.current.focus();
    }
    setManualOverride(false);
  }, [locationType, onSelectionChange, onValidSelection, dateInputRef]);

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
    <div className={`dropdown__item ${isHighlighted ? "dropdown--highlighted" : ""}`}>
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
  ), []);

  const renderNoResults = useCallback(() => {
    if (isLoading) return <div className="dropdown__no-results">Loading...</div>;
    if (error) return <div className="dropdown__no-results dropdown__no-results--error">{error}</div>;
    if (!validateSearchInput(psc, city)) return <div className="dropdown__no-results">Enter a value in any field</div>;
    return <div className="dropdown__no-results">No results found</div>;
  }, [psc, city, isLoading, error, validateSearchInput]);

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

  return (
    <div className={`location-select location-select--${locationType}`} ref={dropdownRef}>
      <PostalCodeInput
        value={psc}
        onChange={handlePscChange}
        dbMask={dbPostalCodeMask}
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
      <BaseDropdown<LocationSuggestion>
        items={suggestions.length > 0 ? suggestions : [placeholderSuggestion]}
        isOpen={isOpen && !error}
        onSelect={handleSelect}
        renderItem={renderLocationItem}
        inputRef={activeField === "psc" ? activePscRef : cityInputRef}
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