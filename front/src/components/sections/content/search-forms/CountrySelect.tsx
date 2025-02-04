// File: src/components/sections/content/search-forms/CountrySelect.tsx
// Last change: Enhanced auto-selection logic to trigger on unique filter match

import React, { useState, useEffect, useRef } from 'react';
import { useLocationForm, Country } from './LocationContext';

interface CountrySelectProps {
  onCountrySelect: (countryCode: string, flagPath: string) => void;
  onNextFieldFocus?: () => void;
  initialValue?: string;
}

const CountrySelect: React.FC<CountrySelectProps> = ({
  onCountrySelect,
  onNextFieldFocus,
  initialValue = '',
}) => {
  // Core state management
  const { state, updateCountry, fetchCountries, filterCountries, getFlagPath } = useLocationForm();
  const [input, setInput] = useState(initialValue.toUpperCase());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [lastValidInput, setLastValidInput] = useState('');

  // DOM References
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<(HTMLLIElement | null)[]>([]);

  // Initial data fetch
  useEffect(() => { fetchCountries(); }, [fetchCountries]);

  // Get valid first characters from available countries
  const getValidFirstChars = (): Set<string> => {
    return new Set(state.countries.all.map(country => country.code_2[0]));
  };

  // Handle clicks outside the component
  useEffect(() => {
    const closeDropdown = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setHighlightedIndex(null);
      }
    };

    document.addEventListener('mousedown', closeDropdown);
    return () => document.removeEventListener('mousedown', closeDropdown);
  }, []);

  // Core input handler with immediate selection for unique matches
  const handleInputChange = (newInput: string) => {
    // Clean and normalize input
    const cleanInput = newInput.replace(/[^A-Za-z]/g, '').toUpperCase();
    
    // Validate first character
    if (cleanInput.length === 1) {
      const validFirstChars = getValidFirstChars();
      if (!validFirstChars.has(cleanInput)) {
        return;
      }
    }

    // Update input state and filter countries
    setInput(cleanInput);
    filterCountries(cleanInput);
    
    // Check filtered results after filtering
    const filteredCountries = cleanInput.length > 0 
      ? state.countries.all.filter(c => c.code_2.startsWith(cleanInput))
      : [];
    
    // Auto-select if only one country matches
    if (filteredCountries.length === 1) {
      selectCountry(filteredCountries[0]);
      return;
    }

    // Update UI state for multiple matches
    setIsDropdownOpen(true);
    setHighlightedIndex(null);

    // Handle valid input states
    if (filteredCountries.length > 0) {
      setLastValidInput(cleanInput);
    }

    // Clear selection if no matches
    if (cleanInput.length === 0 || filteredCountries.length === 0) {
      onCountrySelect('', '');
    }
  };

  // Country selection handler
  const selectCountry = (country: Country) => {
    const flagPath = getFlagPath(country.code_2);
    
    // Update all states
    setInput(country.code_2);
    setIsDropdownOpen(false);
    setHighlightedIndex(null);
    setIsInputFocused(false);
    setLastValidInput(country.code_2);
    
    // Update context and parent
    updateCountry(country.code_2, flagPath, country.name_en);
    onCountrySelect(country.code_2, flagPath);
    
    // Move focus to postal code field
    if (onNextFieldFocus) {
      setTimeout(onNextFieldFocus, 0);
    }
  };

  // Keyboard navigation handler
  const handleKeyDown = (event: React.KeyboardEvent) => {
    // Handle dropdown-closed state
    if (!isDropdownOpen && (event.key === 'ArrowDown' || event.key === 'Enter')) {
      event.preventDefault();
      setIsDropdownOpen(true);
      setHighlightedIndex(0);
      setIsInputFocused(false);
      return;
    }

    if (!isDropdownOpen) return;

    const ITEMS_PER_PAGE = 8;
    const maxIndex = state.countries.filtered.length - 1;
    const currentIndex = highlightedIndex ?? 0;

    switch(event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (isInputFocused) {
          setIsInputFocused(false);
          setHighlightedIndex(0);
        } else {
          setHighlightedIndex(currentIndex >= maxIndex ? 0 : currentIndex + 1);
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (!isInputFocused && (highlightedIndex === 0 || highlightedIndex === null)) {
          setIsInputFocused(true);
          setHighlightedIndex(null);
        } else {
          setHighlightedIndex(currentIndex <= 0 ? maxIndex : currentIndex - 1);
        }
        break;

      case 'PageDown':
        event.preventDefault();
        setHighlightedIndex(Math.min(currentIndex + ITEMS_PER_PAGE, maxIndex));
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
          selectCountry(state.countries.filtered[highlightedIndex]);
        }
        break;

      case 'Escape':
        event.preventDefault();
        setIsDropdownOpen(false);
        setHighlightedIndex(null);
        setIsInputFocused(true);
        inputRef.current?.focus();
        break;
    }
  };

  // Handle scroll behavior for keyboard navigation
  useEffect(() => {
    if (highlightedIndex !== null && !isInputFocused && isDropdownOpen) {
      optionsRef.current[highlightedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [highlightedIndex, isInputFocused, isDropdownOpen]);

  return (
    <div className="country-select" ref={dropdownRef}>
      <div className="combobox-input-group">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsInputFocused(true);
            setIsDropdownOpen(true);
          }}
          placeholder="CC"
          maxLength={2}
          className="country-code-input"
        />
        <button
          type="button"
          className="dropdown-toggle"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          aria-label="Toggle country list"
          aria-expanded={isDropdownOpen}
        >
          <svg 
            width="10" 
            height="6" 
            viewBox="0 0 10 6" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            style={{ 
              transform: `rotate(${isDropdownOpen ? 180 : 0}deg)`,
              transition: "transform 0.2s ease-in-out"
            }}
            aria-hidden="true"
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

        {isDropdownOpen && (
          <ul className="combobox-options" role="listbox">
            {state.countries.filtered.map((country, index) => (
              <li
                key={country.code_2}
                ref={el => optionsRef.current[index] = el}
                onClick={() => selectCountry(country)}
                onKeyDown={handleKeyDown}
                className={`combobox-option ${
                  index === highlightedIndex && !isInputFocused ? 'highlighted' : ''
                }`}
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
                <span className="country-separator">&nbsp;-&nbsp;</span>
                <span className="country-name">{country.name_en}</span>
                <span className="country-local text-gray-500">
                  &nbsp;({country.name_local})
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CountrySelect;