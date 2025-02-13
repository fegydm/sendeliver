// File: src/components/sections/content/search-forms/PostalCitySelect.tsx
// Last change: Fixed dropdown rendering structure

import React, { useRef, useState, useCallback, useEffect } from "react";
import { BaseDropdown, type LocationType } from "./BaseDropdown";
import { LOCATION_PAGE_SIZE, DEBOUNCE_LOCATION_SEARCH } from "@/constants/pagination.constants";
import type { LocationSuggestion } from "@/types/location.types";

interface PostalCitySelectProps {
  pscRef?: React.RefObject<HTMLInputElement>;
  dateInputRef?: React.RefObject<HTMLInputElement>;
  onValidSelection: () => void;
  locationType: LocationType;
  cc?: string;
}

export function PostalCitySelect({
  pscRef,
  dateInputRef,
  onValidSelection,
  locationType,
  cc,
}: PostalCitySelectProps) {
  const [psc, setPsc] = useState("");
  const [city, setCity] = useState("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeField, setActiveField] = useState<"psc" | "city" | null>(null);

  const defaultPscRef = useRef<HTMLInputElement>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const searchTimer = useRef<NodeJS.Timeout>();
  const activePscRef = pscRef || defaultPscRef;
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadSuggestions = useCallback(async (
    pscValue: string,
    cityValue: string,
    pagination?: { lastPsc?: string; lastCity?: string; lastCc?: string }
  ) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (cc) params.append('cc', cc);
      if (pscValue) params.append('psc', pscValue);
      if (cityValue) params.append('city', cityValue);
      if (pagination?.lastPsc) params.append('lastPsc', pagination.lastPsc);
      if (pagination?.lastCity) params.append('lastCity', pagination.lastCity);
      if (pagination?.lastCc) params.append('lastCc', pagination.lastCc);
      params.append('limit', LOCATION_PAGE_SIZE.toString());

      const response = await fetch(`/api/geo/location?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Failed to load locations: ${response.status}`);
      }
      const data = await response.json();
      
      setSuggestions(prev => pagination ? [...prev, ...data.results] : data.results);
      return data.hasMore;
    } catch (error) {
      console.error('Failed to load suggestions:', error);
      setSuggestions([]);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [cc]);

  const debouncedSearch = useCallback((pscValue: string, cityValue: string) => {
    if (searchTimer.current) {
      clearTimeout(searchTimer.current);
    }
    if (!pscValue && !cityValue && !cc) {
      setSuggestions([]);
      return;
    }
    searchTimer.current = setTimeout(() => {
      loadSuggestions(pscValue, cityValue);
    }, DEBOUNCE_LOCATION_SEARCH);
  }, [loadSuggestions, cc]);

  const handlePscInput = useCallback((value: string) => {
    setPsc(value);
    setActiveField("psc");
    setIsOpen(true);
    debouncedSearch(value, city);
  }, [city, debouncedSearch]);

  const handleCityInput = useCallback((value: string) => {
    setCity(value);
    setActiveField("city");
    setIsOpen(true);
    debouncedSearch(psc, value);
  }, [psc, debouncedSearch]);

  useEffect(() => {
    if (cc && (psc || city)) {
      debouncedSearch(psc, city);
    }
  }, [cc, psc, city, debouncedSearch]);

  useEffect(() => {
    return () => {
      if (searchTimer.current) {
        clearTimeout(searchTimer.current);
      }
    };
  }, []);

  const renderLocationItem = useCallback((
    item: LocationSuggestion,
    { isHighlighted, isSelected }: { isHighlighted: boolean; isSelected: boolean }
  ) => (
    <div className={`item-suggestion ${isHighlighted ? 'highlighted' : ''}`}>
      {item.cc && (
        <img
          src={`/flags/4x3/optimized/${item.cc.toLowerCase()}.svg`}
          alt={`${item.cc} flag`}
          className="country-flag"
        />
      )}
      <div className="location-details">
        <span className="country-code">{item.cc}</span>
        <span className="psc">{item.psc}</span>
        <span className="city-name">{item.city}</span>
      </div>
    </div>
  ), []);

  const renderNoResults = useCallback(() => {
    if (isLoading) return <div className="no-results">Loading...</div>;
    if (!psc && !city && !cc) return <div className="no-results">Enter value in any field</div>;
    return <div className="no-results">No results found</div>;
  }, [psc, city, cc, isLoading]);

  const handleSelect = useCallback((item: LocationSuggestion) => {
    setPsc(item.psc);
    setCity(item.city);
    setIsOpen(false);
    if (dateInputRef?.current) {
      dateInputRef.current.focus();
      onValidSelection();
    }
  }, [dateInputRef, onValidSelection]);

  const handleLoadMore = useCallback((lastItem: LocationSuggestion | null) => {
    if (lastItem) {
      loadSuggestions(psc, city, {
        lastPsc: lastItem.psc,
        lastCity: lastItem.city,
        lastCc: lastItem.cc
      });
    }
  }, [psc, city, loadSuggestions]);

  const getItemKey = useCallback((item: LocationSuggestion) => {
    return `${item.cc}-${item.psc}-${item.city}`;
  }, []);

  return (
    <div className="dd-wrapper" ref={dropdownRef}>
      <div className="dd-inputs">
        <input
          ref={activePscRef}
          type="text"
          value={psc}
          onChange={(e) => handlePscInput(e.target.value)}
          onFocus={() => {
            setActiveField("psc");
            setIsOpen(true);
          }}
          placeholder="PSC"
          className={`inp-psc inp-postal-${locationType}`}
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
          placeholder="Place/City"
          className={`inp-city inp-city-${locationType}`}
          aria-autocomplete="list"
          aria-controls="location-dropdown"
        />
      </div>
      
      <BaseDropdown<LocationSuggestion>
        items={suggestions}
        isOpen={isOpen}
        onSelect={handleSelect}
        onClose={() => setIsOpen(false)}
        onLoadMore={handleLoadMore}
        inputRef={activeField === "psc" ? activePscRef : cityInputRef}
        renderItem={renderLocationItem}
        dropdownType="location"
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