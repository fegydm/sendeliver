// File: src/components/sections/content/search-forms/PostalCitySelect.tsx
// Last change: Ensured dropdown only opens after first input character

import React, { useRef, useEffect, useState, RefObject } from "react";
import { useLocationForm, LocationSuggestion } from "./LocationContext";
import useDropdownNavigation from "@/hooks/useDropdownNavigation"; // adjust the path as needed

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
  const { state, updatePostalCode, updateCity, handleSuggestionSelect } = useLocationForm();

  // Local state for managing dropdown and pagination
  const [page, setPage] = useState(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // DOM References
  const inputRef = useRef<HTMLInputElement>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<(HTMLLIElement | null)[]>([]);

  // Constants for pagination
  const ITEMS_PER_PAGE = 20;
  const suggestions = state.validation.suggestions || [];
  const visibleSuggestions = suggestions.slice(0, page * ITEMS_PER_PAGE);
  const hasMore = suggestions.length > visibleSuggestions.length;

  // Handle input change – open dropdown only when postal code is not empty
  const handleInputChange = (value: string) => {
    updatePostalCode(value);
    if (value.trim() !== "") {
      console.log("Opening dropdown due to input...");
      setIsDropdownOpen(true);
    } else {
      console.log("Closing dropdown (input empty).");
      setIsDropdownOpen(false);
    }
    setPage(1);
  };

  // Handle selection of a suggestion
  const handleSelection = async (suggestion: LocationSuggestion) => {
    console.log("Selected suggestion:", suggestion);
    await handleSuggestionSelect(suggestion);
    setIsDropdownOpen(false);
    // Move focus to next field if available
    if (suggestion && dateInputRef?.current) {
      dateInputRef.current.focus();
      onValidSelection();
    }
  };

  // Use custom hook for dropdown navigation with openDropdown callback
  const {
    highlightedIndex,
    isInputFocused,
    setIsInputFocused,
    handleKeyDown: dropdownKeyDown,
  } = useDropdownNavigation({
    itemsCount: visibleSuggestions.length,
    hasMore,
    onSelectItem: (index: number) => {
      if (index === visibleSuggestions.length && hasMore) {
        console.log("Load more triggered.");
        setPage((p) => p + 1);
      } else if (visibleSuggestions[index]) {
        console.log("Navigated to suggestion:", visibleSuggestions[index]);
        handleSelection(visibleSuggestions[index]);
      }
    },
    onLoadMore: () => setPage((p) => p + 1),
    inputRef: postalCodeRef || inputRef,
    itemsPerPage: ITEMS_PER_PAGE,
    openDropdown: () => {
      if (state.postalCode.trim() !== "") {
        console.log("Dropdown manually opened.");
        setIsDropdownOpen(true);
      }
    },
    isDropdownOpen: isDropdownOpen, // 🔥 FIX: Dropdown only reacts when it is open
  });

  // Scroll the highlighted item into view
  useEffect(() => {
    if (highlightedIndex !== null && !isInputFocused && isDropdownOpen) {
      console.log("Scrolling to highlighted item:", highlightedIndex);
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
            onKeyDown={(e) => {
              console.log("Key pressed:", e.key, "Dropdown open:", isDropdownOpen);
              dropdownKeyDown(e);
            }}
            onFocus={() => {
              console.log("Input focused, but dropdown does NOT open.");
              setIsInputFocused(true);
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
                  onKeyDown={dropdownKeyDown}
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
                  onClick={() => setPage((p) => p + 1)}
                  onKeyDown={dropdownKeyDown}
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
