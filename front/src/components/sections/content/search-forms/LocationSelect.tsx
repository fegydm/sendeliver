// File: src/components/sections/content/search-forms/LocationSelect.tsx
// Last change: Error handling and filtering logic improvement

import React, { useState, useRef, useEffect, RefObject } from "react";

// Types definition for location data
interface PostalCode {
  country_code: string;
  postal_code: string;
  place_name: string;
}

// Component props interface
interface LocationSelectProps {
  countryCode?: string;
  onLocationSelect: (location: PostalCode) => void;
  initialPostalCode?: string;
  initialCity?: string;
  postalCodeRef?: RefObject<HTMLInputElement>;
  dateInputRef?: RefObject<HTMLInputElement>;
  onValidSelection: () => void;
}

const LocationSelect: React.FC<LocationSelectProps> = ({
  countryCode,
  onLocationSelect,
  initialPostalCode = "",
  initialCity = "",
  postalCodeRef,
  dateInputRef,
  onValidSelection
}) => {
  // State management
  const [postalCode, setPostalCode] = useState(initialPostalCode);
  const [city, setCity] = useState(initialCity);
  const [results, setResults] = useState<PostalCode[]>([]);
  const [filteredResults, setFilteredResults] = useState<PostalCode[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [errorText, setErrorText] = useState<string>("");

  // Refs for DOM elements and async operations
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLButtonElement>(null);

  // Handle clicks outside the component
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Automatically select single result and move focus
  useEffect(() => {
    const uniqueResults = getUniqueResults();
    if (uniqueResults.length === 1 && showResults) {
      handleSelect(uniqueResults[0]);
      if (dateInputRef?.current) {
        dateInputRef.current.focus();
      }
    }
  }, [filteredResults, showResults]);

  // Filter and check results
  const filterResults = (
    currentPostalCode: string,
    currentCity: string,
    allResults: PostalCode[]
  ): PostalCode[] => {
    // Hide dropdown if both fields are empty
    if (!currentPostalCode && !currentCity) {
      setShowResults(false);
      setErrorText("");
      return [];
    }

    const filtered = allResults.filter(location => {
      const matchesPostal = !currentPostalCode || 
        location.postal_code.toLowerCase().startsWith(currentPostalCode.toLowerCase());
      const matchesCity = !currentCity || 
        location.place_name.toLowerCase().startsWith(currentCity.toLowerCase());
      const matchesCountry = !countryCode || 
        location.country_code === countryCode;
      
      return matchesPostal && matchesCity && matchesCountry;
    });

    // Update UI based on filtered results
    if (filtered.length === 0 && (currentPostalCode || currentCity)) {
      setErrorText("No matching locations found");
    } else {
      setErrorText("");
    }

    return filtered;
  };

  // Check if any results exist
  const checkExistence = async (postalCodeValue: string, cityValue: string): Promise<boolean> => {
    try {
      const queryParams = new URLSearchParams({
        ...(postalCodeValue && { postalCode: postalCodeValue }),
        ...(cityValue && { city: cityValue }),
        ...(countryCode && { countryCode }),
        checkExists: 'true'
      });

      const response = await fetch(`/api/geo/location/exists?${queryParams}`);
      const data = await response.json();
      return data.exists;
    } catch (error) {
      console.error("Error checking existence:", error);
      return false;
    }
  };

  // Main search function with existence check
  const searchLocations = async (postalCodeValue: string, cityValue: string, newOffset = 0, appendResults = false) => {
    if (!hasInteracted || (!postalCodeValue && !cityValue)) {
      setShowResults(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // First check if any results exist
      const exists = await checkExistence(postalCodeValue, cityValue);
      
      if (!exists) {
        setErrorText("No matching locations found");
        setShowResults(false);
        setResults([]);
        setFilteredResults([]);
        return;
      }

      // If results exist, fetch full data
      const queryParams = new URLSearchParams({
        ...(postalCodeValue && { postalCode: postalCodeValue }),
        ...(cityValue && { city: cityValue }),
        ...(countryCode && { countryCode }),
        limit: "20",
        offset: newOffset.toString()
      });

      const response = await fetch(`/api/geo/location?${queryParams}`, { signal: controller.signal });
      if (!response.ok) throw new Error("Failed to fetch locations");

      const data = await response.json();
      if (!Array.isArray(data.results)) throw new Error("Invalid data format");

      const newResults = appendResults ? [...results, ...data.results] : data.results;
      setResults(newResults);
      
      // Filter new results
      const filtered = filterResults(postalCodeValue, cityValue, newResults);
      setFilteredResults(filtered);
      setShowResults(filtered.length > 0);
      setHasMore(data.results.length === 20);
      setOffset(newOffset + 20);
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Search error:", error.message);
      }
      if (!appendResults) {
        setResults([]);
        setFilteredResults([]);
        setShowResults(false);
        setHasMore(false);
        setOffset(0);
      }
    }
  };

  // Handle input changes
  const handleInputChange = (
    value: string,
    type: 'postal' | 'city'
  ) => {
    // Update input value
    if (type === 'postal') {
      setPostalCode(value);
    } else {
      setCity(value);
    }

    if (!hasInteracted) setHasInteracted(true);

    const newPostalCode = type === 'postal' ? value : postalCode;
    const newCity = type === 'city' ? value : city;

    // Hide dropdown if both fields are empty
    if (!newPostalCode && !newCity) {
      setShowResults(false);
      setErrorText("");
      return;
    }

    // Filter existing results first
    if (results.length > 0) {
      const filtered = filterResults(newPostalCode, newCity, results);
      setFilteredResults(filtered);
      setShowResults(filtered.length > 0);

      // If we have filtered results, don't search server
      if (filtered.length > 0) return;
    }

    // Search server with delay
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      searchLocations(newPostalCode, newCity, 0);
    }, 300);
  };

  // Remove duplicate results
  const getUniqueResults = () => {
    return filteredResults.filter(
      (location, index, self) =>
        index === self.findIndex(
          (t) =>
            t.country_code === location.country_code &&
            t.postal_code === location.postal_code &&
            t.place_name === location.place_name
        )
    );
  };

  // Handle location selection
  const handleSelect = (location: PostalCode) => {
    setPostalCode(location.postal_code);
    setCity(location.place_name);
    setShowResults(false);
    setErrorText("");
    onLocationSelect(location);
    onValidSelection();
  };

  // Load more results
  const handleLoadMore = () => {
    searchLocations(postalCode, city, offset, true);
  };

  const uniqueResults = getUniqueResults();
  const shouldShowLoadMore = hasMore && uniqueResults.length >= 20;

  return (
    <div className="location-search" ref={resultsRef} role="combobox" aria-expanded={showResults}>
      <div className="location-inputs">
        <input
          type="text"
          value={postalCode}
          onChange={(e) => handleInputChange(e.target.value, 'postal')}
          placeholder="Postal code"
          autoComplete="off"
          className={`postal-input ${errorText ? 'border-red-500' : ''}`}
          ref={postalCodeRef || inputRef}
          aria-controls="location-list"
          role="textbox"
        />
        <input
          type="text"
          value={city}
          onChange={(e) => handleInputChange(e.target.value, 'city')}
          placeholder="City"
          autoComplete="off"
          className={`city-input ${errorText ? 'border-red-500' : ''}`}
          ref={cityInputRef}
          aria-controls="location-list"
          role="textbox"
        />
      </div>

      {errorText && (
        <div className="text-red-500 text-sm mt-1" role="alert">
          {errorText}
        </div>
      )}

      {showResults && uniqueResults.length > 0 && (
        <ul id="location-list" className="search-results" role="listbox">
          {uniqueResults.map((location, index) => (
            <li
              key={`${location.country_code}-${location.postal_code}-${location.place_name}-${index}`}
              onClick={() => handleSelect(location)}
              className="result-item"
              tabIndex={0}
              role="option"
            >
              <img
                src={`/flags/4x3/optimized/${location.country_code.toLowerCase()}.svg`}
                alt={`${location.country_code} flag`}
                className="country-flag-small"
              />
              <span className="postal-code">{location.postal_code}</span>
              <span className="city-name">{location.place_name}</span>
            </li>
          ))}
          {shouldShowLoadMore && (
            <li className="load-more-item">
              <button className="load-more-button" ref={loadMoreRef} onClick={handleLoadMore}>
                Load more
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default LocationSelect;