// File: src/components/sections/content/search-forms/CountrySelect.tsx
// Last change: Cleaned up unused code and fixed dropdown behavior

import { useRef, useState, useMemo } from 'react';
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
  const [inputValue, setInputValue] = useState(initialValue);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);

  const validFirstChars = useMemo(() => [...new Set(countrySelect.items
    .map(c => c.code_2?.[0])
    .filter(Boolean))], [countrySelect.items]);

  const validSecondChars = useMemo(() => inputValue.length === 1 ? 
    [...new Set(countrySelect.items
      .filter(c => c.code_2?.startsWith(inputValue))
      .map(c => c.code_2?.[1])
      .filter(Boolean))] : [], [inputValue, countrySelect.items]);

  const filteredItems = useMemo(() => !inputValue ? 
    countrySelect.items : 
    countrySelect.items.filter(c => c.code_2?.startsWith(inputValue)), 
    [inputValue, countrySelect.items]);

  const handleInputChange = (value: string) => {
    const upperValue = value.toUpperCase();
    if (!upperValue) {
      setInputValue('');
      setIsOpen(true);
      countrySelect.search('');
      onCountrySelect('', '');
      return;
    }

    if (upperValue.length === 1 && validFirstChars.includes(upperValue)) {
      setInputValue(upperValue);
      setIsOpen(true);
      countrySelect.search(upperValue);
      onCountrySelect('', '');
      return;
    }

    if (upperValue.length === 2 && validFirstChars.includes(upperValue[0]) && 
        validSecondChars.includes(upperValue[1])) {
      setInputValue(upperValue);
      const exactMatch = filteredItems.find(c => c.code_2 === upperValue);
      
      if (exactMatch) {
        handleSelect(exactMatch);
      } else {
        setIsOpen(true);
        countrySelect.search(upperValue);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
      if (!filteredItems.length && countrySelect.items.length === 0) {
        countrySelect.search('');
      }
      setTimeout(() => {
        const firstOption = document.querySelector('.combobox-option') as HTMLElement;
        if (firstOption) {
          setHighlightedIndex(0);
          firstOption.focus();
        }
      }, 0);
    }
  };

  function handleSelect(selectedCountry: Country) {
    if (!selectedCountry.code_2) return;
    const countryCode = selectedCountry.code_2;
    const flagUrl = `/flags/4x3/optimized/${countryCode.toLowerCase()}.svg`;
    setInputValue(countryCode);
    country.handleChange(selectedCountry);
    setIsOpen(false);
    onCountrySelect(countryCode, flagUrl);
    onNextFieldFocus?.();
  }

  const handleClose = () => {
    setIsOpen(false);
    setHighlightedIndex(null);
    if (!inputValue) {
      onCountrySelect('', '');
    }
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOpen) {
      handleClose();
    } else {
      setIsOpen(true);
      if (countrySelect.items.length === 0) {
        countrySelect.search('');
      }
    }
  };

  return (
    <div className="combobox-input-group">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={e => handleInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onClick={() => {
          if (!isOpen) {
            setIsOpen(true);
            if (countrySelect.items.length === 0) countrySelect.search('');
          }
        }}
        placeholder="CC"
        maxLength={2}
        className="country-code-input"
      />
      <button
        type="button"
        className="dropdown-toggle"
        onClick={toggleDropdown}
        aria-label="Toggle country list"
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

      <BaseDropdown
        items={filteredItems}
        isOpen={isOpen && filteredItems.length > 0}
        onSelect={handleSelect}
        onClose={handleClose}
        inputRef={inputRef}
        className="combobox-options"
        renderItem={(country, isHighlighted) => (
          <div className={`combobox-option ${isHighlighted ? 'highlighted' : ''}`}>
            <img
              src={`/flags/4x3/optimized/${country.code_2?.toLowerCase()}.svg`}
              alt={`${country.code_2 ?? 'Unknown'} flag`}
              className="country-flag-small"
            />
            <span className="country-code">{country.code_2 ?? '--'}</span>
            <span className="country-name">{country.name_en}</span>
            <span className="country-local">({country.name_local})</span>
          </div>
        )}
      />
    </div>
  );
}

export default CountrySelect;