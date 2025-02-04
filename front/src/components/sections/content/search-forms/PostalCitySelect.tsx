// File: src/components/sections/content/search-forms/PostalCitySelect.tsx
// Last change: Applied working patterns from CountrySelect

import React, { useRef, useEffect, useState, RefObject } from "react";
import { useLocationForm, LocationSuggestion } from "./LocationContext";

interface PostalCitySelectProps {
  postalCodeRef?: RefObject<HTMLInputElement>;
  dateInputRef?: RefObject<HTMLInputElement>;
  onValidSelection: () => void;
}

const PostalCitySelect: React.FC<PostalCitySelectProps> = ({
  postalCodeRef,
  dateInputRef,
  onValidSelection,
}) => {
  const {
    state,
    updatePostalCode,
    updateCity,
    handleSuggestionSelect
  } = useLocationForm();

  // Local state
  const [input, setInput] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [isInputFocused, setIsInputFocused] = useState(true);
  const [page, setPage] = useState(1);

  // DOM References
  const inputRef = useRef<HTMLInputElement>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<(HTMLLIElement | null)[]>([]);

  // Constants
  const ITEMS_PER_PAGE = 20;
  const suggestions = state.validation.suggestions || [];
  const visibleSuggestions = suggestions.slice(0, page * ITEMS_PER_PAGE);
  const hasMore = suggestions.length > visibleSuggestions.length;

  // Handle input change
  const handleInputChange = (value: string) => {
    setInput(value);
    updatePostalCode(value);
    setIsDropdownOpen(true);
    setPage(1);
  };

  // Handle selection
  const handleSelection = async (suggestion: LocationSuggestion) => {
    await handleSuggestionSelect(suggestion);
    setIsDropdownOpen(false);
    setHighlightedIndex(null);
    setIsInputFocused(true);
    
    if (suggestion && dateInputRef?.current) {
      dateInputRef.current.focus();
      onValidSelection();
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    // Ak nie je otvorený dropdown a stlačíme šípku dole alebo Enter
    if (!isDropdownOpen && (event.key === 'ArrowDown' || event.key === 'Enter')) {
      event.preventDefault();
      setIsDropdownOpen(true);
      setHighlightedIndex(0);
      setIsInputFocused(false);
      return;
    }

    if (!isDropdownOpen) return;

    const totalItems = visibleSuggestions.length + (hasMore ? 1 : 0);
    const maxIndex = totalItems - 1;

    switch(event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (isInputFocused) {
          setIsInputFocused(false);
          setHighlightedIndex(0);
        } else {
          setHighlightedIndex(prev => 
            prev === null || prev >= maxIndex ? 0 : prev + 1
          );
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (!isInputFocused && (highlightedIndex === 0 || highlightedIndex === null)) {
          setIsInputFocused(true);
          setHighlightedIndex(null);
          inputRef.current?.focus();
        } else {
          setHighlightedIndex(prev =>
            prev === null || prev <= 0 ? maxIndex : prev - 1
          );
        }
        break;

      case 'Enter':
        event.preventDefault();
        if (highlightedIndex !== null && !isInputFocused) {
          if (highlightedIndex === visibleSuggestions.length && hasMore) {
            setPage(p => p + 1);
          } else if (visibleSuggestions[highlightedIndex]) {
            handleSelection(visibleSuggestions[highlightedIndex]);
          }
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

  // Handle scroll into view
  useEffect(() => {
    if (highlightedIndex !== null && !isInputFocused && isDropdownOpen) {
      optionsRef.current[highlightedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [highlightedIndex, isInputFocused, isDropdownOpen]);

  return (
    <div className="location-search" ref={dropdownRef}>
      <div className="location-inputs">
        <div className="postal-code-wrapper">
          <input
            type="text"
            value={state.postalCode}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              setIsInputFocused(true);
              setIsDropdownOpen(true);
            }}
            placeholder="Postal code"
            autoComplete="off"
            className="postal-input"
            ref={postalCodeRef || inputRef}
          />
          
          {isDropdownOpen && visibleSuggestions.length > 0 && (
            <ul className="search-results">
              {visibleSuggestions.map((suggestion, index) => (
                <li
                  key={`${suggestion.countryCode}-${suggestion.postalCode}-${suggestion.city}-${index}`}
                  ref={el => optionsRef.current[index] = el}
                  onClick={() => handleSelection(suggestion)}
                  onKeyDown={handleKeyDown}
                  className={`result-item ${index === highlightedIndex && !isInputFocused ? 'highlighted' : ''}`}
                  tabIndex={index === highlightedIndex && !isInputFocused ? 0 : -1}
                >
                  <img
                    src={suggestion.flagUrl}
                    alt={`${suggestion.countryCode} flag`}
                    className="country-flag-small"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <span className="postal-code">{suggestion.postalCode}</span>
                  <span className="city-name">{suggestion.city}</span>
                </li>
              ))}
              {hasMore && (
                <li
                  ref={el => optionsRef.current[visibleSuggestions.length] = el}
                  onClick={() => setPage(p => p + 1)}
                  className={`load-more ${visibleSuggestions.length === highlightedIndex && !isInputFocused ? 'highlighted' : ''}`}
                  tabIndex={visibleSuggestions.length === highlightedIndex && !isInputFocused ? 0 : -1}
                >
                  Load more results...
                </li>
              )}
            </ul>
          )}
        </div>
        <input
          type="text"
          value={state.city}
          onChange={(e) => updateCity(e.target.value)}
          placeholder="City"
          autoComplete="off"
          className="city-input"
          ref={cityInputRef}
        />
      </div>
    </div>
  );
};

export default PostalCitySelect;