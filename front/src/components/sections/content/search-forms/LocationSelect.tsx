// File: src/components/sections/content/search-forms/LocationSelect.tsx
// Last change: Fixed countryCode filtering for postal code search, disabled browser autocomplete

import React, { useState, useRef, useEffect } from "react";

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
}

const LocationSelect: React.FC<LocationSelectProps> = ({
  countryCode,
  onLocationSelect,
  initialPostalCode = "",
  initialCity = ""
}) => {
  const [postalCode, setPostalCode] = useState(initialPostalCode);
  const [city, setCity] = useState(initialCity);
  const [results, setResults] = useState<PostalCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [activeField, setActiveField] = useState<"postal" | "city" | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Close results on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // API search function
  const searchPostalCodes = async (searchValue: string, field: "postal" | "city") => {
    if (field === "city" && searchValue.length < 3) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        ...(field === "postal" && { postalCode: searchValue }),
        ...(field === "city" && { place: searchValue }),
        ...(countryCode && { countryCode }),
        limit: "10"
      });

      const response = await fetch(`/api/geo/location?${queryParams}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch locations");
      }

      const data = await response.json();

      if (!data.results || !Array.isArray(data.results)) {
        throw new Error("Invalid data format received");
      }

      setResults(data.results);
      setShowResults(data.results.length > 0);
      setError(null);
    } catch (error: any) {
      console.error("❌ Search error:", error.message);
      setResults([]);
      setError(error.message);
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Handle postal code input changes
  const handlePostalCodeChange = (value: string) => {
    const cleanValue = value.replace(/[^0-9A-Za-z]/g, "").toUpperCase();
    setPostalCode(cleanValue);
    setActiveField("postal");

    if (cleanValue) {
      searchPostalCodes(cleanValue, "postal");
    } else {
      setResults([]);
      setShowResults(false);
    }
  };

  // Handle city input changes
  const handleCityChange = (value: string) => {
    const cleanValue = value.trim();
    setCity(cleanValue);
    setActiveField("city");

    if (cleanValue.length >= 3) {
      searchPostalCodes(cleanValue, "city");
    } else {
      setResults([]);
      setShowResults(false);
    }
  };

  // Handle location selection
  const handleSelect = (location: PostalCode) => {
    setPostalCode(location.postal_code);
    setCity(location.place_name);
    setShowResults(false);
    onLocationSelect(location);
  };

  return (
    <div className="location-search" ref={resultsRef}>
      <div className="location-inputs">
        <input
          type="text"
          value={postalCode}
          onChange={(e) => handlePostalCodeChange(e.target.value)}
          onFocus={() => setActiveField("postal")}
          placeholder="Postal code"
          autoComplete="off"
          inputMode="numeric"
          className="postal-input"
        />
        <input
          type="text"
          value={city}
          onChange={(e) => handleCityChange(e.target.value)}
          onFocus={() => setActiveField("city")}
          placeholder="City/Place"
          autoComplete="off"
          className="city-input"
        />
      </div>

      {loading && <div className="loading-indicator">Loading...</div>}
      {error && <div className="error-message">{error}</div>}

      {showResults && results.length > 0 && (
        <ul className="search-results">
          {results.map((location) => (
            <li
              key={`${location.country_code}-${location.postal_code}-${location.place_name}`}
              onClick={() => handleSelect(location)}
              className="result-item"
            >
              <img 
                src={`/flags/4x3/optimized/${location.country_code.toLowerCase()}.svg`}
                alt={`${location.country_code} flag`}
                className="country-flag-small"
              />
              <span className="country-code">{location.country_code}</span>
              <span className="postal-code">{location.postal_code}</span>
              <span className="separator">-</span>
              <span className="city-name">{location.place_name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationSelect;
