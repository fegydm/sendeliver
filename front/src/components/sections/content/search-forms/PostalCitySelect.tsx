// File: src/components/sections/content/search-forms/PostalCitySelect.tsx
// Last change: Added debug logs

import React, { useState, useCallback, useEffect, useRef } from "react";
import PostalCodeInput from "@/components/PostalCodeInput";
import { BaseDropdown, type LocationType } from "./BaseDropdown";
import { LOCATION_PAGE_SIZE, DEBOUNCE_LOCATION_SEARCH } from "@/constants/pagination.constants";

export interface LocationSuggestion {
  cc: string;
  psc: string;
  city: string;
  postal_code_format?: string;
}

interface PostalCitySelectProps {
  pscRef?: React.RefObject<HTMLInputElement>;
  dateInputRef?: React.RefObject<HTMLInputElement>;
  onValidSelection: () => void;
  locationType: LocationType;
  cc?: string;
  postalCodeRegex?: string;
  // Mask from the database, e.g. "### ##" for CZ or "#####"" for DE
  dbPostalCodeMask: string;
}

export function PostalCitySelect({
  pscRef,
  dateInputRef,
  onValidSelection,
  locationType,
  cc,
  postalCodeRegex,
  dbPostalCodeMask,
}: PostalCitySelectProps) {
  console.log('PostalCitySelect render:', { 
    locationType, 
    cc, 
    postalCodeRegex, 
    dbPostalCodeMask 
  });

  // Local state for city and postal code (psc)
  const [psc, setPsc] = useState("");
  const [city, setCity] = useState("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeField, setActiveField] = useState<"psc" | "city" | null>(null);
  const [error, setError] = useState<string>("");

  const cityInputRef = useRef<HTMLInputElement>(null);
  const searchTimer = useRef<NodeJS.Timeout>();
  const activePscRef = pscRef || useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Validate postal code using provided regex (if any)
  const validatePostalCode = useCallback(
    (input: string) => {
      console.log('Validating postal code:', { input, regex: postalCodeRegex });
      if (!postalCodeRegex) return true;
      const regex = new RegExp(postalCodeRegex);
      const isValid = regex.test(input);
      console.log('Validation result:', isValid);
      return isValid;
    },
    [postalCodeRegex]
  );

  // Load location suggestions from API
  const loadSuggestions = useCallback(
    async (pscValue: string, cityValue: string, pagination?: { lastPsc?: string; lastCity?: string }) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (cc && cc.trim()) params.append("cc", cc);
        if (pscValue.trim()) params.append("psc", pscValue.trim());
        if (cityValue.trim()) params.append("city", cityValue.trim());
        if (pagination?.lastPsc) params.append("lastPsc", pagination.lastPsc);
        if (pagination?.lastCity) params.append("lastCity", pagination.lastCity);
        params.append("limit", LOCATION_PAGE_SIZE.toString());

        console.log("Making request with params:", Object.fromEntries(params.entries()));
        const response = await fetch(`/api/geo/location?${params.toString()}`);
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

  // Debounced search to limit API calls
  const debouncedSearch = useCallback(
    (pscValue: string, cityValue: string) => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
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

  // Handle postal code input change from PostalCodeInput component
  const handlePscInputChange = useCallback(
    (newValue: string) => {
      console.log('PSC input change:', { 
        newValue, 
        currentPsc: psc,
        isValid: !postalCodeRegex || validatePostalCode(newValue)
      });

      setPsc(newValue);
      if (newValue && postalCodeRegex && !validatePostalCode(newValue)) {
        setError("Invalid postal code format");
      } else {
        setError("");
      }
      setActiveField("psc");
      setIsOpen(true);
      debouncedSearch(newValue, city);
    },
    [city, debouncedSearch, postalCodeRegex, validatePostalCode]
  );

  // Handle city input change
  const handleCityInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCity(e.target.value);
      setActiveField("city");
      setIsOpen(true);
      debouncedSearch(psc, e.target.value);
    },
    [psc, debouncedSearch]
  );

  useEffect(() => {
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, []);

  useEffect(() => {
    const ccLength = (cc || "").trim().length;
    const hasSearchValue = psc.trim() || city.trim();
    console.log("Effect - Search criteria:", { 
      ccLength, 
      hasSearchValue, 
      psc: psc.trim(), 
      city: city.trim() 
    });
    
    if ((ccLength === 0 || ccLength === 1 || ccLength === 2) && hasSearchValue) {
      debouncedSearch(psc, city);
    } else {
      setSuggestions([]);
    }
  }, [cc, psc, city, debouncedSearch]);

  // Render a location item in the dropdown
  const renderLocationItem = useCallback(
    (item: LocationSuggestion, { isHighlighted }: { isHighlighted: boolean }) => (
      <div className={`item-suggestion ${isHighlighted ? "highlighted" : ""}`}>
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
    ),
    []
  );

  const renderNoResults = useCallback(() => {
    if (isLoading) return <div className="no-results">Loading...</div>;
    if (!psc.trim() && !city.trim()) return <div className="no-results">Enter value in PSC or City</div>;
    return <div className="no-results">No results found</div>;
  }, [psc, city, isLoading]);

  // Handle selection of a location
  const handleSelect = useCallback(
    (item: LocationSuggestion) => {
      setPsc(item.psc);
      setCity(item.city);
      setIsOpen(false);
      if (dateInputRef?.current) {
        dateInputRef.current.focus();
        onValidSelection();
      }
    },
    [dateInputRef, onValidSelection]
  );

  // Handle loading more items for pagination
  const handleLoadMore = useCallback(
    (lastItem: LocationSuggestion | null) => {
      if (lastItem) {
        loadSuggestions(psc, city, { lastPsc: lastItem.psc, lastCity: lastItem.city });
      }
    },
    [psc, city, loadSuggestions]
  );

  const getItemKey = useCallback((item: LocationSuggestion) => `${item.cc}-${item.psc}-${item.city}`, []);

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
          dbMask={dbPostalCodeMask}
          initialValue={psc}
          onChange={handlePscInputChange}
          placeholder="PSC"
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
      {error && <div className="error-message">{error}</div>}
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