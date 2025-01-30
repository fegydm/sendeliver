// File: src/components/sections/content/search-forms/CountrySelect.tsx
// Last change: Added toggle arrow animation and fixed flag paths

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
  initialValue = ''
}) => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [countryInput, setCountryInput] = useState(initialValue.toUpperCase());
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [validSecondLetters, setValidSecondLetters] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch("/api/geo/countries");
        if (!response.ok) throw new Error('Failed to fetch countries');
        const data: Country[] = await response.json();
        const sortedCountries = data.sort((a, b) => a.code_2.localeCompare(b.code_2));
        setCountries(sortedCountries);
        setFilteredCountries(sortedCountries);
      } catch (error) {
        console.error('Country loading error:', error);
      }
    };

    fetchCountries();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCountryChange = (input: string) => {
    const cleanInput = input.replace(/[^A-Za-z]/g, '').toUpperCase();
    
    if (cleanInput.length <= 2) {
      if (cleanInput.length === 1) {
        const filtered = countries.filter(country =>
          country.code_2.startsWith(cleanInput)
        );
        const secondLetters = new Set(
          filtered.map(country => country.code_2[1])
        );
        setValidSecondLetters(secondLetters);
        setFilteredCountries(filtered);
        setShowDropdown(true);
        setCountryInput(cleanInput);
      }
      else if (cleanInput.length === 2) {
        if (validSecondLetters.has(cleanInput[1])) {
          const filtered = countries.filter(country =>
            country.code_2 === cleanInput
          );
          setFilteredCountries(filtered);
          setCountryInput(cleanInput);
          
          if (filtered.length === 1) {
            handleCountrySelect(filtered[0]);
            onNextFieldFocus?.();
          }
        }
      } else {
        setCountryInput(cleanInput);
        setFilteredCountries(countries);
        setValidSecondLetters(new Set());
      }
    }
  };

  const toggleDropdown = () => {    
    // If dropdown is already shown, just hide it
    if (showDropdown) {
      setShowDropdown(false);
      return;
    }
    
    // Show and filter list based on current input
    if (countryInput.length > 0) {
      const filtered = countries.filter(country =>
        country.code_2.startsWith(countryInput)
      );
      setFilteredCountries(filtered);
    } else {
      setFilteredCountries(countries);
    }
    setShowDropdown(true);
    inputRef.current?.focus();
  };

  const handleCountrySelect = (country: Country) => {
    setCountryInput(country.code_2);
    setShowDropdown(false);
    onCountrySelect(country.code_2, getFlagPath(country.code_2));
  };

  return (
    <div className="country-select" ref={dropdownRef}>
      <div className="combobox-input-group">
        <input
          ref={inputRef}
          type="text"
          value={countryInput}
          onChange={(e) => handleCountryChange(e.target.value)}
          onFocus={() => {
            if (countryInput.length === 0) {
              setFilteredCountries(countries);
              setShowDropdown(true);
            }
          }}
          placeholder="CC"
          maxLength={2}
          className="country-code-input"
        />
        <button
          type="button"
          className={`dropdown-toggle ${showDropdown ? "active" : ""}`}
          onClick={toggleDropdown}
          aria-label="Toggle country list"
        >
          ▼
        </button>

        {showDropdown && (
          <ul className="combobox-options">
            {filteredCountries.map((country) => (
              <li
                key={country.code_2}
                onClick={() => handleCountrySelect(country)}
                className="combobox-option"
              >
                <img 
                  src={getFlagPath(country.code_2)} 
                  alt={`${country.code_2} flag`}
                  className="country-flag-small"
                />
                <span className="country-code">{country.code_2}</span>
                <span className="country-separator"> - </span>
                <span className="country-name">{country.name_en}</span>
                {country.name_local !== country.name_en && (
                  <span className="name-local">({country.name_local})</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CountrySelect;