// File: src/components/sections/content/search-forms/PostalCitySelect1.tsx
// Last change: Basic implementation with combined dropdown for postal code and city selection using SQL filtering

import React, { useEffect, useState, useRef } from 'react';
import { BaseDropdown } from './BaseDropdown';
import type { LocationSuggestion } from '@/types/location.types';

interface PostalCitySelect1Props {
  postalCodeRef?: React.RefObject<HTMLInputElement>;
  onValidSelection: () => void;
}

export function PostalCitySelect1({
  postalCodeRef,
  onValidSelection
}: PostalCitySelect1Props) {
  // Internal state for postal code and city inputs
  const [postalCodeInput, setPostalCodeInput] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const internalInputRef = useRef<HTMLInputElement>(null);
  
  // Function to fetch suggestions from SQL backend based on postal code and city inputs
  const fetchSuggestions = async (postal: string, city: string) => {
    // Create query parameters
    const params = new URLSearchParams();
    if (postal) params.append('postalCode', postal);
    if (city) params.append('city', city);
    
    try {
      const response = await fetch(`/api/geo/postal_codes?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch postal code suggestions');
      const data = await response.json();
      return data as LocationSuggestion[];
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      return [];
    }
  };

  // Effect hook to fetch and update suggestions when inputs change
  useEffect(() => {
    // Only fetch if at least one input field is non-empty
    if (postalCodeInput.trim() || cityInput.trim()) {
      fetchSuggestions(postalCodeInput.trim(), cityInput.trim()).then((results) => {
        setSuggestions(results);
        setIsOpen(true);
        // Auto-select if exactly one unique result is returned and both fields are filled
        if (results.length === 1 && postalCodeInput.trim() && cityInput.trim()) {
          handleSelect(results[0]);
        }
      });
    } else {
      // If both fields are empty, clear suggestions and close dropdown
      setSuggestions([]);
      setIsOpen(false);
    }
  }, [postalCodeInput, cityInput]);

  // Handle selection of a suggestion from the dropdown
  const handleSelect = (selected: LocationSuggestion) => {
    setPostalCodeInput(selected.postalCode);
    setCityInput(selected.city);
    setIsOpen(false);
    onValidSelection();
  };

  // Handle keyboard navigation for the dropdown list
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (suggestions.length === 0) return;
      setIsOpen(true);
      setHighlightedIndex(0);
    }
  };

  // Toggle dropdown visibility on button click
  const toggleDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className="postal-city-combobox-group">
      <div className="input-group">
        <input
          ref={postalCodeRef || internalInputRef}
          type="text"
          value={postalCodeInput}
          onChange={(e) => setPostalCodeInput(e.target.value.toUpperCase())}
          onKeyDown={handleKeyDown}
          placeholder="Postal Code"
          className="postal-code-input"
        />
        <input
          type="text"
          value={cityInput}
          onChange={(e) => setCityInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="City"
          className="city-input"
        />
        <button
          type="button"
          className="dropdown-toggle"
          onClick={toggleDropdown}
          aria-label="Toggle postal code and city list"
          aria-expanded={isOpen}
        >
          <svg
            width="10"
            height="6"
            viewBox="0 0 10 6"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease'
            }}
          >
            <path
              d="M1 1L5 5L9 1"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <BaseDropdown
        items={suggestions}
        isOpen={isOpen && suggestions.length > 0}
        onSelect={handleSelect}
        onClose={() => setIsOpen(false)}
        inputRef={internalInputRef}
        className="combobox-options"
        renderItem={(item, isHighlighted) => (
          <div className={`dropdown-option ${isHighlighted ? 'highlighted' : ''}`}>
            <span className="postal-code">{item.postalCode}</span>
            <span className="city-name">{item.city}</span>
          </div>
        )}
      />
    </div>
  );
}

export default PostalCitySelect1;
