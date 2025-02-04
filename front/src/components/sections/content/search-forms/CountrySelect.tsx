// File: src/components/sections/content/search-forms/CountrySelect.tsx
// Last change: Auto-select country when only one result remains, using lastValidInput to avoid re-selection

import { useState, useEffect, useRef } from 'react';
import { useLocationForm, Country } from './LocationContext';
import useDropdownNavigation from '@/hooks/useDropdownNavigation';

interface CountrySelectProps {
  onCountrySelect: (countryCode: string, flagPath: string) => void;
  onNextFieldFocus?: () => void;
  initialValue?: string;
}

const CountrySelect = ({
  onCountrySelect,
  onNextFieldFocus,
  initialValue = '',
}: CountrySelectProps): JSX.Element => {
  const { state, updateCountry, fetchCountries, filterCountries, getFlagPath } = useLocationForm();
  
  // State for the input field (country code) and dropdown open state
  const [input, setInput] = useState(initialValue.toUpperCase());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // This state tracks the last valid input to prevent re-selection of the same country
  const [lastValidInput, setLastValidInput] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch countries on mount
  useEffect(() => { 
    fetchCountries(); 
  }, [fetchCountries]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const closeDropdown = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', closeDropdown);
    return () => document.removeEventListener('mousedown', closeDropdown);
  }, []);

  // Effect for automatic selection when there's exactly one result
  useEffect(() => {
    if (
      state.countries.filtered.length === 1 &&
      input.length === 2 &&
      input !== lastValidInput
    ) {
      const country = state.countries.filtered[0];
      selectCountry(country);
      setLastValidInput(input);
    }
  }, [state.countries.filtered, input, lastValidInput]);

  // Dropdown navigation hook with additional onHighlightChange callback
  const {
    highlightedIndex,
    isInputFocused,
    handleKeyDown,
    resultItemsRef,
    setIsInputFocused,
    setHighlightedIndex,
  } = useDropdownNavigation({
    itemsCount: state.countries.filtered.length,
    isDropdownOpen,
    onSelectItem: (index) => selectCountry(state.countries.filtered[index]),
    inputRef,
    onHighlightChange: (index) => {
      // Reset the last valid input when highlight changes
      if (index === null) setLastValidInput('');
    }
  });

  // Handle changes in the input field
  const handleInputChange = (newInput: string) => {
    // Remove non-letter characters and convert to uppercase
    const cleanInput = newInput.replace(/[^A-Za-z]/g, '').toUpperCase();
    
    if (cleanInput.length === 0) {
      setInput('');
      onCountrySelect('', '');
      filterCountries('');
      setIsDropdownOpen(false);
      return;
    }

    // Validate first character and second character (if exists)
    const filteredCountries = state.countries.filtered;
    const isValidFirstChar = state.countries.all.some(c => c.code_2[0] === cleanInput[0]);
    const isValidSecondChar = cleanInput.length < 2 || filteredCountries.some(c => c.code_2[1] === cleanInput[1]);

    if (!isValidFirstChar || !isValidSecondChar) {
      return;
    }

    setInput(cleanInput);
    filterCountries(cleanInput);
    setIsDropdownOpen(true);
    
    // Automatically highlight the first result if available
    if (filteredCountries.length > 0) {
      setHighlightedIndex(0);
    }
  };

  // Function to select a country
  const selectCountry = (country: Country) => {
    const flagPath = getFlagPath(country.code_2);
    setInput(country.code_2);
    setIsInputFocused(false);
    setIsDropdownOpen(false);
    
    updateCountry(country.code_2, flagPath, country.name_en);
    onCountrySelect(country.code_2, flagPath);
    
    // Move focus to the next field (e.g., PSC) with a minimal delay
    if (onNextFieldFocus) {
      setTimeout(() => onNextFieldFocus(), 0);
    }
  };

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
                ref={el => resultItemsRef.current[index] = el as HTMLElement}
                onClick={() => {
                  selectCountry(country);
                  onNextFieldFocus?.();
                }}
                onKeyDown={handleKeyDown}
                className={`combobox-option result-item ${
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
