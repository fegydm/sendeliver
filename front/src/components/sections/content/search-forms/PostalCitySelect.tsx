// File: src/components/sections/content/search-forms/PostalCitySelect.tsx
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
  // State management
  const [psc, setPsc] = useState("");
  const [city, setCity] = useState("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeField, setActiveField] = useState<"psc" | "city" | null>(null);
  const [error, setError] = useState<string | null>(null);
  // New state flag to indicate manual override (prevent auto-select)
  const [manualOverride, setManualOverride] = useState(false);

  // Refs
  const cityInputRef = useRef<HTMLInputElement>(null);
  const searchTimer = useRef<NodeJS.Timeout>();
  const activePscRef = pscRef || useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Default empty suggestion
  const placeholderSuggestion: LocationSuggestion = {
    psc: '',
    city: '',
    cc: '',
    priority: 0,
    flag: '',
    lat: 0,
    lng: 0
  };

  // Validation helper
  const validateSearchInput = useCallback((pscValue: string, cityValue: string): boolean => {
    return pscValue.trim().length > 0 || cityValue.trim().length > 0;
  }, []);

  // Load suggestions from API
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

        console.log(`[PostalCitySelect] ${locationType} Loading suggestions:`, {
          psc: pscValue,
          city: cityValue,
          cc
        });

        const response = await fetch(requestUrl);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Server error ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        
        // Auto-select only if there's exactly one result and manualOverride is false
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

  // Handle selection from dropdown
  const handleSelect = useCallback((item: LocationSuggestion) => {
    console.log(`[PostalCitySelect] ${locationType} Selected row:`, item);
    
    // 1. Update input values
    setPsc(item.psc);
    setCity(item.city);
    
    // 2. Close dropdown
    setIsOpen(false);
    
    // 3. Propagate data to parent
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
    
    // 4. Notify valid selection
    onValidSelection();
    
    // 5. Move focus to date input
    if (dateInputRef?.current) {
      dateInputRef.current.focus();
    }
    // Reset manual override after selection
    setManualOverride(false);
  }, [locationType, onSelectionChange, onValidSelection, dateInputRef]);

  // Debounce search
  const debouncedSearch = useCallback(
    (pscValue: string, cityValue: string) => {
      if (searchTimer.current) {
        clearTimeout(searchTimer.current);
      }

      searchTimer.current = setTimeout(() => {
        loadSuggestions(pscValue, cityValue);
      }, DEBOUNCE_LOCATION_SEARCH);
    },
    [loadSuggestions]
  );

  // Handle input focus
  const handleInputFocus = useCallback((field: "psc" | "city") => {
    setActiveField(field);
    setIsOpen(true);
    
    if (validateSearchInput(psc, city)) {
      debouncedSearch(psc, city);
    }
  }, [psc, city, debouncedSearch, validateSearchInput]);

  // Handle PSC changes
  const handlePscChange = useCallback(
    (newValue: string) => {
      setPsc(newValue);
      setActiveField("psc");
      setIsOpen(true);
      setError(null);
      // Reset city when PSC is changed
      setCity("");
      // Set manualOverride to true to prevent auto-select
      setManualOverride(true);
      debouncedSearch(newValue, "");
    },
    [debouncedSearch]
  );

  // Handle city changes
  const handleCityChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setCity(newValue);
      setActiveField("city");
      setIsOpen(true);
      setError(null);
      // Reset PSC when city is changed
      setPsc("");
      // Set manualOverride to true to prevent auto-select
      setManualOverride(true);
      debouncedSearch("", newValue);
    },
    [debouncedSearch]
  );

  // Handle outside clicks
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

  // Add/remove click handler
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  // Initial data load on country change
  useEffect(() => {
    setSuggestions([]);
    if (validateSearchInput(psc, city)) {
      debouncedSearch(psc, city);
    }
  }, [cc, psc, city, debouncedSearch, validateSearchInput]);

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (searchTimer.current) {
        clearTimeout(searchTimer.current);
      }
    };
  }, []);

  // Render location item
  const renderLocationItem = useCallback((
    item: LocationSuggestion, 
    { isHighlighted }: { isHighlighted: boolean }
  ) => (
    <div className={`item-suggestion ${isHighlighted ? "highlighted" : ""}`}>
      {item.cc && (
        <img
          src={`/flags/4x3/optimized/${item.cc.toLowerCase()}.svg`}
          alt={`${item.cc} flag`}
          className={`${locationType}-flag`}
        />
      )}
      <div className="location-details">
        <span className={`${locationType}-cc`}>{item.cc}</span>
        <span className={`${locationType}-psc`}>{item.psc}</span>
        <span className={`${locationType}-city`}>{item.city}</span>
      </div>
    </div>
  ), [locationType]);

  // Render messages
  const renderNoResults = useCallback(() => {
    if (isLoading) return <div className="no-results">Loading...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!validateSearchInput(psc, city)) return <div className="no-results">Enter a value in any field</div>;
    return <div className="no-results">No results found</div>;
  }, [psc, city, isLoading, error, validateSearchInput]);

  // Handle loading more
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
    <div className="dd-wrapper" ref={dropdownRef}>
      <div className="dd-inputs">
        <PostalCodeInput
          value={psc}
          onChange={handlePscChange}
          dbMask={dbPostalCodeMask}
          placeholder="PSC"
          className={`${locationType}-psc`}
          ref={activePscRef}
          // When focusing on PSC, reset city and open dropdown
          onFocus={() => { 
            setCity(""); 
            // Set manualOverride to true so that auto-select is prevented
            setManualOverride(true);
            handleInputFocus("psc"); 
          }}
        />
        <input
          ref={cityInputRef}
          type="text"
          value={city}
          onChange={handleCityChange}
          // When focusing on City, reset PSC and open dropdown
          onFocus={() => { 
            setPsc(""); 
            setManualOverride(true);
            handleInputFocus("city"); 
          }}
          placeholder="Place/City"
          className={`${locationType}-city`}
          aria-autocomplete="list"
          aria-controls="location-dropdown"
          aria-expanded={isOpen}
        />
      </div>
      <BaseDropdown<LocationSuggestion>
        items={suggestions.length > 0 ? suggestions : [placeholderSuggestion]}
        isOpen={isOpen && !error}
        onSelect={handleSelect}
        renderItem={renderLocationItem}
        inputRef={activeField === "psc" ? activePscRef : cityInputRef}
        variant="location"
        position="left"
        className={`${locationType}-dropdown`}
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
