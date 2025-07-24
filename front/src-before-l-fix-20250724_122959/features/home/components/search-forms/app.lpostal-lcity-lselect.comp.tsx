// File: src/features/home/components/search-forms/app.lpostal-lcity-lselect.comp.tsx
import React, { useState, useCallback, useEffect, useRef } from "react";
import postalcodeinput from "@/components/shared/elements/postalcodeinput";
import { BaseDropdown } from "@/components/shared/elements/BaseDropdown";
import { LOCATION_PAGE_SIZE, DEBOUNCE_LOCATION_SEARCH } from "@/constants/pagination.constants";
import { LocationType, LocationSuggestion } from "@/types/transport-forms.types";

interface PostalCitySelectProps {
  pscRef?: React.RefObject<hTMLInputElement>;
  // Removed dateInputRef to decouple DateTimeSelect from PostalCitySelect
  onValidSelection: () => void;
  onSelectionChange?: (location: Omit<locationSuggestion, "priority">) => void;
  locationType: LocationType;
  cc?: string;
  postalCodeRegex?: string;
  dbPostalCodeMask: string;
  role?: "sender" | "hauler";
}

export function PostalCitySelect({
  pscRef,
  onValidSelection,
  onSelectionChange,
  locationType,
  cc,
  dbPostalCodeMask,
  role,
}: PostalCitySelectProps) {
  const [psc, setPsc] = useState("");
  const [city, setCity] = useState("");
  const [suggestions, setSuggestions] = useState<locationSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeField, setActiveField] = useState<"psc" | "city" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualOverride, setManualOverride] = useState(false);
  const [selectionInProgress, setSelectionInProgress] = useState(false);
  
  const lastSelectedRef = useRef<string | null>(null);
  const cityInputRef = useRef<hTMLInputElement>(null);
  const searchTimer = useRef<nodeJS.Timeout>();
  const activePscRef = pscRef || useRef<hTMLInputElement>(null);
  const dropdownRef = useRef<hTMLDivElement>(null);
  const componentRef = useRef<hTMLDivElement>(null);

  // Validate that search input is not empty
  const validateSearchInput = useCallback((pscValue: string, cityValue: string): boolean => {
    return pscValue.trim().length > 0 || cityValue.trim().length > 0;
  }, []);

  // Load suggestions from API based on input values and optional pagination
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

        const endpoint = "/api/geo/countries/location";
        const requestUrl = `${endpoint}?${params.toString()}`;

        console.log(`[PostalCitySelect] ${locationType} Loading suggestions:`, { psc: pscValue, city: cityValue, cc });

        const response = await fetch(requestUrl);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Server error ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        const normalizedResults = data.results.map((item: LocationSuggestion) => ({
          ...item,
          lat: item.lat !== undefined ? item.lat : item.latitude !== undefined ? item.latitude : 0,
          lng: item.lng !== undefined ? item.lng : item.longitude !== undefined ? item.longitude : 0,
          flag: item.flag || item.flag_url,
        }));

        // Auto-select if only one suggestion and no manual override is active
        if (!pagination && normalizedResults.length === 1 && !manualOverride) {
          handleSelect(normalizedResults[0]);
          return false;
        }

        setSuggestions((prev) => (pagination ? [...prev, ...normalizedResults] : normalizedResults));
        return data.hasMore;
      } catch (error) {
        console.error(`[PostalCitySelect] ${locationType} Load error:`, error);
        const errorMessage = error instanceof Error ? error.message : "Failed to load suggestions";
        setError(errorMessage);
        setSuggestions([]);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [cc, locationType, validateSearchInput, manualOverride]
  );

  // Critical selection handler that propagates selected location to parent
  const handleSelect = useCallback(
    (item: LocationSuggestion) => {
      // Prevent duplicate selections
      const selectionKey = `${item.cc}-${item.psc}-${item.city}`;
      if (selectionKey === lastSelectedRef.current) {
        console.log(`[PostalCitySelect] ${locationType} Duplicate selection, skipping`);
        return;
      }
      
      // Indicate that a selection is in progress to block outside clicks
      setSelectionInProgress(true);
      
      console.log(`[PostalCitySelect] ${locationType} Selected:`, item);
      
      // Normalize the location data for parent component
      const locationData: Omit<locationSuggestion, "priority"> = {
        cc: item.cc || "",
        flag: item.flag || item.flag_url || (item.cc ? `/flags/4x3/optimized/${item.cc.toLowerCase()}.svg` : ""),
        psc: item.psc,
        city: item.city,
        lat: typeof item.lat === 'string' ? parseFloat(item.lat) : (item.lat ?? item.latitude ?? 0),
        lng: typeof item.lng === 'string' ? parseFloat(item.lng) : (item.lng ?? item.longitude ?? 0),
      };
      
      // Save selection to prevent duplicates
      lastSelectedRef.current = selectionKey;
      
      // Call parent's callback to update state before local update
      if (onSelectionChange) {
        console.log(`[PostalCitySelect] ${locationType} Sending to parent:`, locationData);
        onSelectionChange(locationData);
      }
      
      // After parent's callback, update local state and close dropdown
      setTimeout(() => {
        // Update displayed values
        setPsc(item.psc);
        setCity(item.city);
        
        // Close the dropdown
        setIsOpen(false);
        
        // Call parent's valid selection callback
        onValidSelection();
        
        // Reset selection flags
        setSelectionInProgress(false);
        setManualOverride(false);
      }, 50);
    },
    [onSelectionChange, onValidSelection, locationType]
  );

  // Debounce the search to reduce API calls during typing
  const debouncedSearch = useCallback(
    (pscValue: string, cityValue: string) => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
      searchTimer.current = setTimeout(() => loadSuggestions(pscValue, cityValue), DEBOUNCE_LOCATION_SEARCH);
    },
    [loadSuggestions]
  );

  const handleInputFocus = useCallback(
    (field: "psc" | "city") => {
      setActiveField(field);
      setIsOpen(true);
      if (validateSearchInput(psc, city)) debouncedSearch(psc, city);
    },
    [psc, city, debouncedSearch, validateSearchInput]
  );

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
    (e: React.ChangeEvent<hTMLInputElement>) => {
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

  // Disable temporary the click-outside effect to odstav možný render
  // useEffect(() => {
  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => document.removeEventListener("mousedown", handleClickOutside);
  // }, [handleClickOutside]);

  // Custom handler for dropdown item clicks to manage event propagation
  const handleDropdownItemClick = useCallback((item: LocationSuggestion, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    console.log(`[PostalCitySelect] ${locationType} Dropdown item clicked:`, item);
    handleSelect(item);
  }, [handleSelect, locationType]);

  const renderLocationItem = useCallback(
    (item: LocationSuggestion, { isHighlighted }: { isHighlighted: boolean }) => (
      <div
        className={`dropdown__item ${isHighlighted ? "dropdown--highlighted" : ""} ${
          activeField === "psc" ? "location-item--focus-psc" : 
          activeField === "city" ? "location-item--focus-city" : ""
        }`}
        onClick={(e) => handleDropdownItemClick(item, e)}
      >
        {item.cc && (
          <img
            src={`/flags/4x3/optimized/${item.cc.toLowerCase()}.svg`}
            alt={`${item.cc} flag`}
            className="dropdown__item-flag"
            onError={(e) => (e.currentTarget.src = "/flags/4x3/optimized/placeholder.svg")}
          />
        )}
        <div className="dropdown__item-details">
          <span className="dropdown__item-code">{item.cc}</span>
          <span className="dropdown__item-postal">{item.psc}</span>
          <span className="dropdown__item-city">{item.city}</span>
        </div>
      </div>
    ),
    [activeField, handleDropdownItemClick]
  );

  const renderNoResults = useCallback(() => {
    if (isLoading) return <div className="dropdown__no-results">Loading...</div>;
    if (error) return <div className="dropdown__no-results dropdown__no-results--error">{error}</div>;
    if (!validateSearchInput(psc, city)) return <div className="dropdown__no-results">Enter a value in any field</div>;
    return <div className="dropdown__no-results">No results found</div>;
  }, [psc, city, isLoading, error, validateSearchInput]);

  const handleLoadMore = useCallback(() => {
    if (suggestions.length > 0) {
      const lastItem = suggestions[suggestions.length - 1];
      loadSuggestions(psc, city, { lastPsc: lastItem.psc, lastCity: lastItem.city });
    }
  }, [psc, city, loadSuggestions, suggestions]);

  return (
    <div className={`location-select location-select--${locationType}`} ref={componentRef}>
      <PostalCodeInput
        ref={activePscRef}
        value={psc}
        onChange={handlePscChange}
        mask={dbPostalCodeMask}
        placeholder="Postal code"
        className="location-select__psc"
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
        data-role={role}
        aria-autocomplete="list"
        aria-controls="location-select-dropdown"
        aria-expanded={isOpen}
      />
      <BaseDropdown
        ref={dropdownRef}
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
