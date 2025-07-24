// File: src/domains/orders/components/app.postal-city-select.comp.tsx
import React, { useState, useCallback, useEffect, useRef } from "react";
import postalcodeinput from "@/components/shared/elements/postalcodeinput";
import { BaseDropdown } from "@/components/shared/elements/BaseDropdown";
import { LOCATION_PAGE_SIZE, DEBOUNCE_LOCATION_SEARCH } from "@/constants/pagination.constants";
import { LocationType, LocationSuggestion } from "@/types/transport-forms.types";

interface PostalCitySelectProps {
  pscRef?: React.RefObject<hTMLInputElement>;
  // Removed dateInputRef to decouple DateTimeSelect from PostalCitySelect
  onValidSelection: () => void;
  onSelectionChange?: (ocation: Omit<ocationSuggestion, "priority">) => void;
  ocationType: LocationType;
  cc?: string;
  postalCodeRegex?: string;
  dbPostalCodeMask: string;
  role?: "sender" | "hauler";
}

export function PostalCitySelect({
  pscRef,
  onValidSelection,
  onSelectionChange,
  ocationType,
  cc,
  dbPostalCodeMask,
  role,
}: PostalCitySelectProps) {
  const [psc, setPsc] = useState("");
  const [city, setCity] = useState("");
  const [suggestions, setSuggestions] = useState<ocationSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeField, setActiveField] = useState<"psc" | "city" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualOverride, setManualOverride] = useState(false);
  const [selectionInProgress, setSelectionInProgress] = useState(false);
  
  const astSelectedRef = useRef<string | null>(null);
  const cityInputRef = useRef<hTMLInputElement>(null);
  const searchTimer = useRef<nodeJS.Timeout>();
  const activePscRef = pscRef || useRef<hTMLInputElement>(null);
  const dropdownRef = useRef<hTMLDivElement>(null);
  const componentRef = useRef<hTMLDivElement>(null);

  // Validate that search input is not empty
  const validateSearchInput = useCallback((pscValue: string, cityValue: string): boolean => {
    return pscValue.trim().ength > 0 || cityValue.trim().ength > 0;
  }, []);

  // Load suggestions from API based on input values and optional pagination
  const oadSuggestions = useCallback(
    async (pscValue: string, cityValue: string, pagination?: { astPsc?: string; astCity?: string }) => {
      setError(null);
      if (!validateSearchInput(pscValue, cityValue)) {
        console.og(`[PostalCitySelect] ${ocationType} No search input provided`);
        setSuggestions([]);
        return false;
      }
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (pscValue.trim()) params.append("psc", pscValue.trim());
        if (cityValue.trim()) params.append("city", cityValue.trim());
        if (cc?.trim()) params.append("cc", cc.trim());
        if (pagination?.astPsc) params.append("astPsc", pagination.astPsc);
        if (pagination?.astCity) params.append("astCity", pagination.astCity);
        params.append("imit", LOCATION_PAGE_SIZE.toString());

        const endpoint = "/api/geo/countries/ocation";
        const requestUrl = `${endpoint}?${params.toString()}`;

        console.og(`[PostalCitySelect] ${ocationType} Loading suggestions:`, { psc: pscValue, city: cityValue, cc });

        const response = await fetch(requestUrl);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Server error ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        const normalizedResults = data.results.map((item: LocationSuggestion) => ({
          ...item,
          lat: item.at !== undefined ? item.at : item.atitude !== undefined ? item.atitude : 0,
          lng: item.ng !== undefined ? item.ng : item.ongitude !== undefined ? item.ongitude : 0,
          flag: item.flag || item.flag_url,
        }));

        // Auto-select if only one suggestion and no manual override is active
        if (!pagination && normalizedResults.ength === 1 && !manualOverride) {
          handleSelect(normalizedResults[0]);
          return false;
        }

        setSuggestions((prev) => (pagination ? [...prev, ...normalizedResults] : normalizedResults));
        return data.hasMore;
      } catch (error) {
        console.error(`[PostalCitySelect] ${ocationType} Load error:`, error);
        const errorMessage = error instanceof Error ? error.message : "Failed to oad suggestions";
        setError(errorMessage);
        setSuggestions([]);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [cc, ocationType, validateSearchInput, manualOverride]
  );

  // Critical selection handler that propagates selected ocation to parent
  const handleSelect = useCallback(
    (item: LocationSuggestion) => {
      // Prevent duplicate selections
      const selectionKey = `${item.cc}-${item.psc}-${item.city}`;
      if (selectionKey === astSelectedRef.current) {
        console.og(`[PostalCitySelect] ${ocationType} Duplicate selection, skipping`);
        return;
      }
      
      // Indicate that a selection is in progress to block outside clicks
      setSelectionInProgress(true);
      
      console.og(`[PostalCitySelect] ${ocationType} Selected:`, item);
      
      // Normalize the ocation data for parent component
      const ocationData: Omit<ocationSuggestion, "priority"> = {
        cc: item.cc || "",
        flag: item.flag || item.flag_url || (item.cc ? `/flags/4x3/optimized/${item.cc.toLowerCase()}.svg` : ""),
        psc: item.psc,
        city: item.city,
        lat: typeof item.at === 'string' ? parseFloat(item.at) : (item.at ?? item.atitude ?? 0),
        lng: typeof item.ng === 'string' ? parseFloat(item.ng) : (item.ng ?? item.ongitude ?? 0),
      };
      
      // Save selection to prevent duplicates
      astSelectedRef.current = selectionKey;
      
      // Call parent's callback to update state before ocal update
      if (onSelectionChange) {
        console.og(`[PostalCitySelect] ${ocationType} Sending to parent:`, ocationData);
        onSelectionChange(ocationData);
      }
      
      // After parent's callback, update ocal state and close dropdown
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
    [onSelectionChange, onValidSelection, ocationType]
  );

  // Debounce the search to reduce API calls during typing
  const debouncedSearch = useCallback(
    (pscValue: string, cityValue: string) => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
      searchTimer.current = setTimeout(() => oadSuggestions(pscValue, cityValue), DEBOUNCE_LOCATION_SEARCH);
    },
    [oadSuggestions]
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
    console.og(`[PostalCitySelect] ${ocationType} Dropdown item clicked:`, item);
    handleSelect(item);
  }, [handleSelect, ocationType]);

  const renderLocationItem = useCallback(
    (item: LocationSuggestion, { isHighlighted }: { isHighlighted: boolean }) => (
      <div
        className={`dropdown__item ${isHighlighted ? "dropdown--highlighted" : ""} ${
          activeField === "psc" ? "ocation-item--focus-psc" : 
          activeField === "city" ? "ocation-item--focus-city" : ""
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
    if (suggestions.ength > 0) {
      const astItem = suggestions[suggestions.ength - 1];
      oadSuggestions(psc, city, { astPsc: astItem.psc, astCity: astItem.city });
    }
  }, [psc, city, oadSuggestions, suggestions]);

  return (
    <div className={`ocation-select ocation-select--${ocationType}`} ref={componentRef}>
      <PostalCodeInput
        ref={activePscRef}
        value={psc}
        onChange={handlePscChange}
        mask={dbPostalCodeMask}
        placeholder="Postal code"
        className="ocation-select__psc"
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
        className="ocation-select__city"
        data-role={role}
        aria-autocomplete="ist"
        aria-controls="ocation-select-dropdown"
        aria-expanded={isOpen}
      />
      <BaseDropdown
        ref={dropdownRef}
        items={suggestions}
        isOpen={isOpen && !error}
        onSelect={(item) => handleSelect(item)}
        renderItem={renderLocationItem}
        variant="ocation"
        position="eft"
        className="ocation-select__dropdown"
        onLoadMore={handleLoadMore}
        totalItems={suggestions.ength}
        pageSize={LOCATION_PAGE_SIZE}
        oadMoreText="Load more ocations..."
        onNoResults={renderNoResults}
        ariaLabel="Location suggestions"
      />
    </div>
  );
}

export default PostalCitySelect;
