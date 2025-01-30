// File: src/components/sections/content/search-forms/CountrySelect.tsx
// Last change: Fixed infinite API calls and improved error handling

import React, { useState, useEffect, useRef } from 'react';

interface Country {
  code_2: string;
  name_en: string;
  name_local: string;
  name_sk: string;
}

interface CountrySelectProps {
  onCountrySelect: (countryCode: string, flagPath: string) => void;
  onNextFieldFocus?: () => void;
  initialValue?: string;
}

const getFlagPath = (countryCode: string) =>
  `flags/4x3/optimized/${countryCode.toLowerCase()}.svg`;

const CountrySelect: React.FC<CountrySelectProps> = ({
  onCountrySelect,
  onNextFieldFocus,
  initialValue = '',
}) => {
  // State management
  const [countries, setCountries] = useState<Country[]>([]);
  const [countryInput, setCountryInput] = useState(initialValue.toUpperCase());
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [lastValidInput, setLastValidInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Refs for DOM elements
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<(HTMLLIElement | null)[]>([]);

  // Fetch countries data
  useEffect(() => {
    let isMounted = true;
    
    const fetchCountries = async () => {
      if (countries.length > 0 || isLoading) return;
      
      setIsLoading(true);
      try {
        const response = await fetch("/api/geo/countries");
        if (!response.ok) throw new Error('Failed to fetch countries');
        const data: Country[] = await response.json();
        
        if (isMounted) {
          const sortedData = data.sort((a, b) => a.code_2.localeCompare(b.code_2));
          setCountries(sortedData);
          setFilteredCountries(sortedData);
        }
      } catch (error) {
        console.error('Country loading error:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchCountries();
    return () => { isMounted = false; };
  }, []);

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setHighlightedIndex(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle country input changes
  const handleCountryChange = (input: string) => {
    const cleanInput = input.replace(/[^A-Za-z]/g, '').toUpperCase();
    
    // Filter countries based on input
    const filtered = countries.filter(country => country.code_2.startsWith(cleanInput));
    
    // Validate second character
    if (cleanInput.length === 2 && filtered.length === 0) {
      setCountryInput(lastValidInput);
      return;
    }

    // Update state
    setCountryInput(cleanInput);
    setFilteredCountries(filtered);
    setShowDropdown(true);
    setHighlightedIndex(null);

    // Store last valid input
    if (filtered.length > 0) {
      setLastValidInput(cleanInput);
    }

    // Auto-select if there's exactly one match
    if (filtered.length === 1 && cleanInput.length === 2) {
      handleCountrySelect(filtered[0]);
    }

    // Clear selection if no exact match
    if (filtered.length !== 1 && cleanInput.length < 2) {
      onCountrySelect('', '');
    }
  };

  // Handle country selection
  const handleCountrySelect = (country: Country) => {
    setCountryInput(country.code_2);
    setShowDropdown(false);
    setHighlightedIndex(null);
    setIsInputFocused(false);
    setLastValidInput(country.code_2);
    onCountrySelect(country.code_2, getFlagPath(country.code_2));
    if (onNextFieldFocus) {
      setTimeout(() => onNextFieldFocus(), 0);
    }
  };

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    if (showDropdown) {
      setShowDropdown(false);
      setHighlightedIndex(null);
    } else {
      setShowDropdown(true);
      setFilteredCountries(countries);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!showDropdown) {
      if (event.key === 'ArrowDown' || event.key === 'Enter') {
        event.preventDefault();
        setShowDropdown(true);
        setHighlightedIndex(0);
        setIsInputFocused(false);
        return;
      }
      return;
    }

    const ITEMS_PER_PAGE = 8;
    const currentIndex = highlightedIndex || 0;

    switch(event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (isInputFocused) {
          setIsInputFocused(false);
          setHighlightedIndex(0);
        } else {
          setHighlightedIndex(prev =>
            prev === null || prev >= filteredCountries.length - 1 ? 0 : prev + 1
          );
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (!isInputFocused && (highlightedIndex === 0 || highlightedIndex === null)) {
          setIsInputFocused(true);
          setHighlightedIndex(null);
        } else {
          setHighlightedIndex(prev =>
            prev === null || prev <= 0 ? filteredCountries.length - 1 : prev - 1
          );
        }
        break;

      case 'PageDown':
        event.preventDefault();
        setHighlightedIndex(Math.min(currentIndex + ITEMS_PER_PAGE, filteredCountries.length - 1));
        setIsInputFocused(false);
        break;

      case 'PageUp':
        event.preventDefault();
        setHighlightedIndex(Math.max(currentIndex - ITEMS_PER_PAGE, 0));
        setIsInputFocused(false);
        break;

      case 'Enter':
        event.preventDefault();
        if (highlightedIndex !== null && !isInputFocused) {
          handleCountrySelect(filteredCountries[highlightedIndex]);
        }
        break;

      case 'Escape':
        setShowDropdown(false);
        setHighlightedIndex(null);
        setIsInputFocused(true);
        inputRef.current?.focus();
        break;
    }
  };

  // Handle scroll into view for highlighted items
  useEffect(() => {
    if (highlightedIndex !== null && !isInputFocused && showDropdown) {
      const option = optionsRef.current[highlightedIndex];
      if (option) {
        option.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        option.focus();
      }
    } else if (isInputFocused) {
      inputRef.current?.focus();
    }
  }, [highlightedIndex, isInputFocused, showDropdown]);

  return (
    <div className="country-select" ref={dropdownRef}>
      <div className="combobox-input-group">
        <input
          ref={inputRef}
          type="text"
          value={countryInput}
          onChange={(e) => handleCountryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsInputFocused(true);
            setShowDropdown(true);
          }}
          placeholder="CC"
          maxLength={2}
          className="country-code-input"
        />
        <button
          type="button"
          className={`dropdown-toggle ${showDropdown ? 'active' : ''}`}
          onClick={toggleDropdown}
          aria-label="Toggle country list"
        >
          ▼
        </button>

        {showDropdown && (
          <ul className="combobox-options" role="listbox">
            {filteredCountries.map((country, index) => (
              <li
                key={country.code_2}
                ref={el => optionsRef.current[index] = el}
                onClick={() => handleCountrySelect(country)}
                onKeyDown={handleKeyDown}
                className={`combobox-option ${index === highlightedIndex && !isInputFocused ? 'highlighted' : ''}`}
                role="option"
                tabIndex={index === highlightedIndex && !isInputFocused ? 0 : -1}
                aria-selected={index === highlightedIndex}
              >
                <img
                  src={getFlagPath(country.code_2)}
                  alt={`${country.code_2} flag`}
                  className="country-flag-small"
                />
                <span className="country-code">{country.code_2}</span>
                <span className="country-separator"> - </span>
                <span className="country-name">{country.name_en}</span>
                <span className="name-local">{country.name_local}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CountrySelect;