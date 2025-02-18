// File: src/components/sections/content/search-forms/PostalCitySelect.tsx
// Last change: Fixed ordering of handleSelect to avoid "used before declaration" error

import React, { useState, useCallback, useEffect, useRef } from "react";
import PostalCodeInput from "@/components/PostalCodeInput";
import { BaseDropdown } from "./BaseDropdown";
import { LOCATION_PAGE_SIZE, DEBOUNCE_LOCATION_SEARCH } from "@/constants/pagination.constants";

export interface LocationSuggestion {
  code: string; // standardized (was previously 'cc')
  psc: string;
  city: string;
  postal_code_format?: string;
}

export interface PostalCitySelectProps {
  pscRef?: React.RefObject<HTMLInputElement>;
  dateInputRef?: React.RefObject<HTMLInputElement>;
  onValidSelection: () => void;
  // onSelectionChange passes standardized data (psc, city, and a record with code and flag)
  onSelectionChange?: (psc: string, city: string, record?: { code: string; flag: string }) => void;
  locationType: "pickup" | "delivery";
  code?: string; // standardized (was previously 'cc')
  postalCodeRegex?: string;
  // Mask loaded from DB, e.g. "### ##" for CZ or "#####" for DE
  dbPostalCodeMask: string;
  // Controlled values from parent
  value?: string; // controlled raw PSC value (digits only)
  initialCity?: string;
}

export function PostalCitySelect({
  pscRef,
  dateInputRef,
  onValidSelection,
  onSelectionChange,
  locationType,
  code,
  postalCodeRegex,
  dbPostalCodeMask,
  value,
  initialCity = "",
}: PostalCitySelectProps) {
  console.log("PostalCitySelect render:", { locationType, code, postalCodeRegex, dbPostalCodeMask });

  // For PSC, if controlled value is provided, use it; else use internal state.
  const [internalPsc, setInternalPsc] = useState("");
  const pscValue = value !== undefined ? value : internalPsc;
  
  // Local state for city (assumed uncontrolled here)
  const [city, setCity] = useState(initialCity);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeField, setActiveField] = useState<"psc" | "city" | null>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const searchTimer = useRef<NodeJS.Timeout>();
  const activePscRef = pscRef || useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load location suggestions from the API and map 'cc' to standardized 'code'
  const loadSuggestions = useCallback(
    async (pscVal: string, cityVal: string, pagination?: { lastPsc?: string; lastCity?: string }) => {
      try {
        const params = new URLSearchParams();
        // API parameter still expects 'cc'
        if (code?.trim()) params.append("cc", code);
        if (pscVal.trim()) params.append("psc", pscVal.trim());
        if (cityVal.trim()) params.append("city", cityVal.trim());
        if (pagination?.lastPsc) params.append("lastPsc", pagination.lastPsc);
        if (pagination?.lastCity) params.append("lastCity", pagination.lastCity);
        params.append("limit", LOCATION_PAGE_SIZE.toString());

        console.log("Requesting suggestions with params:", Object.fromEntries(params.entries()));
        const response = await fetch(`/api/geo/location?${params.toString()}`);
        if (!response.ok) throw new Error(`Failed to load locations: ${response.status}`);
        const data = await response.json();

        const results: LocationSuggestion[] = data.results.map((item: any) => ({
          code: item.cc || item.code,
          psc: item.psc,
          city: item.city,
          postal_code_format: item.postal_code_format,
        }));

        setSuggestions(prev => (pagination ? [...prev, ...results] : results));
        return data.hasMore;
      } catch (error) {
        console.error("Failed to load suggestions:", error);
        setSuggestions([]);
        return false;
      }
    },
    [code]
  );

  // Debounce search to limit API calls
  const debouncedSearch = useCallback(
    (pscVal: string, cityVal: string) => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
      if (!pscVal.trim() && !cityVal.trim()) {
        setSuggestions([]);
        return;
      }
      searchTimer.current = setTimeout(() => {
        loadSuggestions(pscVal, cityVal);
      }, DEBOUNCE_LOCATION_SEARCH);
    },
    [loadSuggestions]
  );

  // Handle change from PostalCodeInput component
  const handlePscInputChange = useCallback(
    (newVal: string) => {
      if (value === undefined) {
        setInternalPsc(newVal);
      }
      // Trigger parent callback if exists (only updating PSC)
      if (onSelectionChange) {
        onSelectionChange(newVal, city, undefined);
      }
      setActiveField("psc");
      setIsOpen(true);
      debouncedSearch(newVal, city);
    },
    [value, city, debouncedSearch, onSelectionChange]
  );

  // Handle change in the city input field
  const handleCityInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCity(e.target.value);
      setActiveField("city");
      setIsOpen(true);
      debouncedSearch(pscValue, e.target.value);
    },
    [pscValue, debouncedSearch]
  );

  useEffect(() => {
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, []);

  // Re-run search only if code is defined and non-empty, and PSC or city have value.
  useEffect(() => {
    if (code && (pscValue.trim() || city.trim())) {
      debouncedSearch(pscValue, city);
    } else {
      setSuggestions([]);
    }
  }, [code, pscValue, city, debouncedSearch]);

  // Declare handleSelect before using in useEffect
  const handleSelect = useCallback(
    (item: LocationSuggestion) => {
      console.log("handleSelect called with item:", item);
      if (value === undefined) {
        setInternalPsc(item.psc);
      }
      setCity(item.city);
      setIsOpen(false);
      if (onSelectionChange) {
        console.log("Calling onSelectionChange with:", {
          psc: item.psc,
          city: item.city,
          record: { code: item.code, flag: `/flags/4x3/optimized/${item.code.toLowerCase()}.svg` }
        });
        onSelectionChange(item.psc, item.city, {
          code: item.code,
          flag: `/flags/4x3/optimized/${item.code.toLowerCase()}.svg`,
        });
      }
      if (dateInputRef?.current) {
        dateInputRef.current.focus();
      }
      onValidSelection();
    },
    [dateInputRef, onValidSelection, onSelectionChange, value]
  );

  // Auto-select the only suggestion if applicable when PSC or city field is focused
  useEffect(() => {
    if (isOpen && (activeField === "psc" || activeField === "city") && suggestions.length === 1) {
      handleSelect(suggestions[0]);
    }
  }, [suggestions, isOpen, activeField, handleSelect]);

  // Render a location item in the dropdown
  const renderLocationItem = useCallback(
    (item: LocationSuggestion, { isHighlighted }: { isHighlighted: boolean }) => (
      <div className={`item-suggestion ${isHighlighted ? "highlighted" : ""}`}>
        {item.code && (
          <img
            src={`/flags/4x3/optimized/${item.code.toLowerCase()}.svg`}
            alt={`${item.code} flag`}
            className="country-flag"
          />
        )}
        <div className="location-details">
          <span className="country-code">{item.code}</span>
          <span className="psc">{item.psc}</span>
          <span className="city-name">{item.city}</span>
        </div>
      </div>
    ),
    []
  );

  const renderNoResults = useCallback(() => {
    if (!pscValue.trim() && !city.trim())
      return <div className="no-results">Enter a value in any field</div>;
    return <div className="no-results">No results found</div>;
  }, [pscValue, city]);

  // Handle loading more results for pagination
  const handleLoadMore = useCallback(
    (lastItem: LocationSuggestion | null) => {
      if (lastItem) {
        loadSuggestions(pscValue, city, { lastPsc: lastItem.psc, lastCity: lastItem.city });
      }
    },
    [pscValue, city, loadSuggestions]
  );

  const getItemKey = useCallback((item: LocationSuggestion) => `${item.code}-${item.psc}-${item.city}`, []);
  const handleInputFocus = useCallback((fieldType: "psc" | "city") => {
    setActiveField(fieldType);
    setIsOpen(true);
  }, []);
  const handleDropdownClose = useCallback(() => {
    setIsOpen(false);
    setActiveField(null);
  }, []);

  return (
    <div className="dd-wrapper" ref={dropdownRef}>
      <div className="dd-inputs">
        <PostalCodeInput
          dbMask={dbPostalCodeMask || "#####"}
          value={pscValue}
          onChange={handlePscInputChange}
          placeholder="PSC"
          className={`inp-psc inp-psc-${locationType}`}
        />
        <input
          ref={cityInputRef}
          type="text"
          value={city}
          onChange={handleCityInput}
          onFocus={() => handleInputFocus("city")}
          placeholder="Place/City"
          className={`inp-city inp-city-${locationType}`}
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
