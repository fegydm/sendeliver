// File: src/components/sections/content/search-forms/LocationSelect.tsx
// Last change: Fixed duplicate key issue and improved load more functionality

import React, { useState, useRef, useEffect, RefObject } from "react";

interface PostalCode {
  country_code: string;
  postal_code: string;
  place_name: string;
}

interface LocationSelectProps {
  countryCode?: string;
  onLocationSelect: (location: PostalCode) => void;
  initialPostalCode?: string;
  initialCity?: string;
  postalCodeRef?: RefObject<HTMLInputElement>;
  onValidSelection: () => void;
}

const LocationSelect: React.FC<LocationSelectProps> = ({
  countryCode,
  onLocationSelect,
  initialPostalCode = "",
  initialCity = "",
  postalCodeRef,
  onValidSelection
}) => {
  const [postalCode, setPostalCode] = useState(initialPostalCode);
  const [city, setCity] = useState(initialCity);
  const [results, setResults] = useState<PostalCode[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<(HTMLLIElement | null)[]>([]);
  const loadMoreRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setHighlightedIndex(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchLocations = async (postalCodeValue: string, cityValue: string, newOffset = 0) => {
    if (!postalCodeValue.trim() && !cityValue.trim()) {
      setResults([]);
      setShowResults(false);
      setHasMore(false);
      setOffset(0);
      return;
    }
  
    try {
      const queryParams = new URLSearchParams({
        ...(postalCodeValue && { postalCode: postalCodeValue }),
        ...(cityValue && { city: cityValue }),
        ...(countryCode && { countryCode }),
        limit: "20",
        offset: newOffset.toString()
      });
  
      console.log("Sending request with params:", queryParams.toString());
  
      const response = await fetch(`/api/geo/location?${queryParams}`);
      if (!response.ok) throw new Error("Failed to fetch locations");
  
      const data = await response.json();
      console.log("Received data:", data);
  
      if (!Array.isArray(data.results)) throw new Error("Invalid data format");
  
      setHasMore(data.results.length === 20);
      setResults((prevResults) => [...prevResults, ...data.results]);
      setOffset(newOffset + 20);
      setShowResults(data.results.length > 0);
  
      if (data.results.length === 1) {
        handleSelect(data.results[0]);
      }
    } catch (error: any) {
      console.error("Search error:", error.message);
      setResults([]);
      setShowResults(false);
      setHasMore(false);
      setOffset(0);
    }
  };

  const handleSelect = (location: PostalCode) => {
    setPostalCode(location.postal_code);
    setCity(location.place_name);
    setShowResults(false);
    setHighlightedIndex(null);
    onLocationSelect(location);
    onValidSelection();
  };

  return (
    <div className="location-search" ref={resultsRef} role="combobox" aria-expanded={showResults}>
      <div className="location-inputs">
        <input
          type="text"
          value={postalCode}
          onChange={(e) => searchLocations(e.target.value, city, 0)}
          placeholder="Postal code"
          autoComplete="off"
          className="postal-input"
          ref={postalCodeRef || inputRef}
          aria-controls="location-list"
          role="textbox"
        />
        <input
          type="text"
          value={city}
          onChange={(e) => searchLocations(postalCode, e.target.value, 0)}
          placeholder="City/Place"
          autoComplete="off"
          className="city-input"
          ref={cityInputRef}
          aria-controls="location-list"
          role="textbox"
        />
      </div>
      {showResults && results.length > 0 && (
        <ul id="location-list" className="search-results" role="listbox">
          {results.map((location, index) => (
            <li
              key={`${location.country_code}-${location.postal_code}-${location.place_name}`}
              onClick={() => handleSelect(location)}
              className={`result-item ${index === highlightedIndex ? "highlighted" : ""}`}
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
          {hasMore && (
            <li className="load-more-item">
              <button className="load-more-button" ref={loadMoreRef} onClick={() => searchLocations(postalCode, city, offset)}>
                Load More
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default LocationSelect;
