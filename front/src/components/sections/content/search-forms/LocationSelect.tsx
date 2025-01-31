// File: src/components/sections/content/search-forms/LocationSelect.tsx
// Last change: Fixed search logic to always start a new search on input change

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
        postalCode: postalCodeValue,
        city: cityValue,
        ...(countryCode && { countryCode }),
        limit: "20",
        offset: newOffset.toString()
      });

      const response = await fetch(`/api/geo/location?${queryParams}`);
      if (!response.ok) throw new Error("Failed to fetch locations");

      const data = await response.json();
      if (!Array.isArray(data.results)) throw new Error("Invalid data format");

      setHasMore(data.results.length === 20);
      setResults(data.results);  // Always set new results, don't append
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

  const handleInputChange = (value: string, isPostalCode: boolean) => {
    const formattedValue = isPostalCode ? value.toUpperCase().replace(/[^0-9A-Z]/g, "") : value;
    
    if (isPostalCode) {
      setPostalCode(formattedValue);
    } else {
      setCity(formattedValue);
    }
  
    // Vždy spustíme nové vyhľadávanie s aktualizovanými hodnotami
    const newPostalCode = isPostalCode ? formattedValue : postalCode;
    const newCity = isPostalCode ? city : formattedValue;
    
    setResults([]); // Vyčistíme existujúce výsledky
    setShowResults(false); // Skryjeme výsledky počas nového vyhľadávania
    setOffset(0); // Resetujeme offset
  
    // Spustíme nové vyhľadávanie len ak máme nejaký vstup
    if (newPostalCode.trim() || newCity.trim()) {
      searchLocations(newPostalCode, newCity, 0);
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

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement | HTMLLIElement | HTMLButtonElement>) => {
    if (!showResults) {
      if (event.key === "ArrowDown" && results.length > 0) {
        setShowResults(true);
        setHighlightedIndex(0);
        return;
      }
      return;
    }

    const currentIndex = highlightedIndex ?? -1;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (currentIndex < results.length - 1) {
          setHighlightedIndex(currentIndex + 1);
          optionsRef.current[currentIndex + 1]?.focus();
        } else if (hasMore) {
          setHighlightedIndex(results.length);
          loadMoreRef.current?.focus();
        }
        break;

      case "ArrowUp":
        event.preventDefault();
        if (currentIndex > 0) {
          setHighlightedIndex(currentIndex - 1);
          optionsRef.current[currentIndex - 1]?.focus();
        } else {
          setHighlightedIndex(null);
          inputRef.current?.focus();
        }
        break;

      case "PageDown":
        event.preventDefault();
        if (hasMore && currentIndex === results.length - 1) {
          searchLocations(postalCode, city, offset);
        } else {
          setHighlightedIndex(Math.min(currentIndex + 5, results.length - 1));
          optionsRef.current[Math.min(currentIndex + 5, results.length - 1)]?.focus();
        }
        break;

      case "PageUp":
        event.preventDefault();
        setHighlightedIndex(Math.max(currentIndex - 5, 0));
        optionsRef.current[Math.max(currentIndex - 5, 0)]?.focus();
        break;

      case "Enter":
        event.preventDefault();
        if (highlightedIndex !== null) {
          if (highlightedIndex === results.length && hasMore) {
            searchLocations(postalCode, city, offset);
          } else {
            handleSelect(results[highlightedIndex]);
          }
        }
        break;

      case "Escape":
        setShowResults(false);
        setHighlightedIndex(null);
        break;
    }
  };

  return (
    <div className="location-search" ref={resultsRef} role="combobox" aria-expanded={showResults}>
      <div className="location-inputs">
        <input
          type="text"
          value={postalCode}
          onChange={(e) => handleInputChange(e.target.value, true)}
          onKeyDown={handleKeyDown}
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
          onChange={(e) => handleInputChange(e.target.value, false)}
          onKeyDown={handleKeyDown}
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
              key={`${location.country_code}-${location.postal_code}`}
              ref={(el) => (optionsRef.current[index] = el)}
              onClick={() => handleSelect(location)}
              onKeyDown={handleKeyDown}
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
              <button
                className="load-more-button"
                ref={loadMoreRef}
                onClick={() => searchLocations(postalCode, city, offset)}
                onKeyDown={handleKeyDown}
              >
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