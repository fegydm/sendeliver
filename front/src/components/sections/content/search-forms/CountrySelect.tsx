// File: src/components/sections/content/search-forms/CountrySelect.tsx
// Last change: Fixed TypeScript error by ensuring selectedCountry properties are defined

import { useRef, useState } from 'react';
import { useLocation } from './LocationContext';
import { BaseDropdown } from './BaseDropdown';
import type { Country } from '@/types/location.types';

interface CountrySelectProps {
  onCountrySelect: (code: string, flag: string) => void;
  onNextFieldFocus?: () => void;
  initialValue?: string;
}

export function CountrySelect({
  onCountrySelect,
  onNextFieldFocus,
  initialValue = ''
}: CountrySelectProps) {
  const { country, countrySelect } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle input change
  const handleInputChange = (value: string) => {
    const cleanValue = value.replace(/[^A-Za-z]/g, '').toUpperCase();
    country.handleChange(null);
    countrySelect.search(cleanValue);
    setIsOpen(true);
  };

  // Handle country selection
  const handleSelect = (selectedCountry: Country) => {
    const countryCode = selectedCountry.code_2 ?? "";
    const flagUrl = selectedCountry.flag_url ?? "";

    country.handleChange(selectedCountry);
    setIsOpen(false);
    onCountrySelect(countryCode, flagUrl);

    if (onNextFieldFocus) {
      setTimeout(onNextFieldFocus, 0);
    }
  };

  return (
    <div className="country-select">
      <div className="input-group">
        <input
          ref={inputRef}
          type="text"
          value={country.value?.code_2 || initialValue}
          onChange={e => handleInputChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="CC"
          maxLength={2}
          className="country-input"
        />
        <button
          type="button"
          className="dropdown-toggle"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle country list"
          aria-expanded={isOpen}
        >
          <svg 
            width="10" 
            height="6" 
            viewBox="0 0 10 6" 
            fill="none" 
            className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
          >
            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <BaseDropdown
        items={countrySelect.items}
        isOpen={isOpen}
        onSelect={handleSelect}
        inputRef={inputRef}
        renderItem={(country, isHighlighted) => (
          <div className={`country-item ${isHighlighted ? 'highlighted' : ''}`}>
            <img
              src={country.flag_url ?? ""}
              alt={`${country.code_2 ?? "Unknown"} flag`}
              className="country-flag-small"
            />
            <span className="country-code">{country.code_2 ?? "--"}</span>
            <span className="country-separator"> - </span>
            <span className="country-name">{country.name_en}</span>
            <span className="country-local">({country.name_local})</span>
          </div>
        )}
      />
    </div>
  );
}

export default CountrySelect;
export type { CountrySelectProps };
