// File: src/components/sections/content/search-forms/PostalCitySelect.tsx
// Last change: Added logging for flag loading issues and ensured correct flag URL handling

import React, { useRef, useEffect, RefObject } from "react";
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
    clearValidation,
    handleSuggestionSelect,
    getFlagPath,
  } = useLocationForm();

  const inputRef = useRef<HTMLInputElement>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Listen for clicks outside the component to clear validation messages
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
        clearValidation();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [clearValidation]);

  // When a valid selection is made, focus the next field and trigger callback
  useEffect(() => {
    if (state.validation.isValid && dateInputRef?.current) {
      dateInputRef.current.focus();
      onValidSelection();
    }
  }, [state.validation.isValid, dateInputRef, onValidSelection]);

  return (
    <div className="location-search" ref={resultsRef} role="combobox" aria-expanded={state.validation.isDirty}>
      <div className="location-inputs">
        <div className="postal-code-wrapper">
          <input
            type="text"
            value={state.postalCode}
            onChange={(e) => updatePostalCode(e.target.value)}
            placeholder="Postal code"
            autoComplete="off"
            className="postal-input"
            ref={postalCodeRef || inputRef}
            aria-controls="location-list"
            role="textbox"
          />
          {state.validation.error && (
            <div className="postal-error" role="alert">
              {state.validation.error}
            </div>
          )}
          {state.validation.isValidating && (
            <div className="postal-loading">
              Validating...
            </div>
          )}
          {state.validation.isDirty &&
            !state.validation.error &&
            state.validation.suggestions &&
            state.validation.suggestions.length > 0 && (
              <ul id="location-list" className="search-results" role="listbox">
                {state.validation.suggestions.map((suggestion: LocationSuggestion, index: number) => {
                  const flagUrl = suggestion.flagUrl || getFlagPath(suggestion.countryCode);

                  console.log(
                    `Suggestion: ${suggestion.countryCode} | Flag URL: ${flagUrl}`
                  );

                  return (
                    <li
                      key={`${suggestion.countryCode}-${suggestion.postalCode}-${suggestion.city}-${index}`}
                      onClick={() => handleSuggestionSelect(suggestion)}
                      className="result-item"
                      tabIndex={0}
                      role="option"
                    >
                      <img
                        src={flagUrl}
                        alt={`${suggestion.countryCode} flag`}
                        className="country-flag-small"
                        onError={(e) => {
                          console.error("Flag load error:", e.currentTarget.src);
                          e.currentTarget.style.display = "none";
                        }}
                      />
                      <span className="postal-code">{suggestion.postalCode}</span>
                      <span className="city-name">{suggestion.city}</span>
                    </li>
                  );
                })}
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
          aria-controls="location-list"
          role="textbox"
        />
      </div>
    </div>
  );
};

export default PostalCitySelect;
