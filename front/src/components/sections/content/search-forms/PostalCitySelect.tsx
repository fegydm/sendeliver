// File: src/components/sections/content/search-forms/PostalCitySelect.tsx
// Last change: Simplified to UI component only

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
 onValidSelection
}) => {
 const {
   state,
   updatePostalCode,
   updateCity,
   clearValidation,
   handleSuggestionSelect
 } = useLocationForm();

 const inputRef = useRef<HTMLInputElement>(null);
 const cityInputRef = useRef<HTMLInputElement>(null);
 const resultsRef = useRef<HTMLDivElement>(null);

 // Handle outside clicks
 useEffect(() => {
   const handleClickOutside = (event: MouseEvent) => {
     if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
       clearValidation();
     }
   };

   document.addEventListener("mousedown", handleClickOutside);
   return () => document.removeEventListener("mousedown", handleClickOutside);
 }, [clearValidation]);

 // Handle valid selection and focus
 useEffect(() => {
   if (state.validation.isValid && dateInputRef?.current) {
     dateInputRef.current.focus();
     onValidSelection();
   }
 }, [state.validation.isValid, dateInputRef, onValidSelection]);

 return (
   <div 
     className="location-search" 
     ref={resultsRef} 
     role="combobox" 
     aria-expanded={state.validation.isDirty}
   >
     <div className="location-inputs">
       <input
         type="text"
         value={state.postalCode}
         onChange={(e) => updatePostalCode(e.target.value)}
         placeholder="Postal code"
         autoComplete="off"
         className={`postal-input ${state.validation.error ? 'border-red-500' : ''}`}
         ref={postalCodeRef || inputRef}
         aria-controls="location-list"
         role="textbox"
       />
       <input
         type="text"
         value={state.city}
         onChange={(e) => updateCity(e.target.value)}
         placeholder="City"
         autoComplete="off"
         className={`city-input ${state.validation.error ? 'border-red-500' : ''}`}
         ref={cityInputRef}
         aria-controls="location-list"
         role="textbox"
       />
     </div>

     {/* Error display */}
     {state.validation.error && (
       <div className="text-red-500 text-sm mt-1" role="alert">
         {state.validation.error}
       </div>
     )}

     {/* Loading indicator */}
     {state.validation.isValidating && (
       <div className="text-gray-500 text-sm mt-1">
         Validating...
       </div>
     )}

     {/* Suggestions list */}
     {state.validation.isDirty && 
      !state.validation.error && 
      state.validation.suggestions &&
      state.validation.suggestions.length > 0 && (
       <ul id="location-list" className="search-results" role="listbox">
         {state.validation.suggestions.map((suggestion: LocationSuggestion, index: number) => (
           <li
             key={`${suggestion.countryCode}-${suggestion.postalCode}-${suggestion.city}-${index}`}
             onClick={() => handleSuggestionSelect(suggestion)}
             className="result-item"
             tabIndex={0}
             role="option"
           >
             <img
               src={`/flags/4x3/optimized/${suggestion.countryCode.toLowerCase()}.svg`}
               alt={`${suggestion.countryCode} flag`}
               className="country-flag-small"
             />
             <span className="postal-code">{suggestion.postalCode}</span>
             <span className="city-name">{suggestion.city}</span>
           </li>
         ))}
       </ul>
     )}
   </div>
 );
};

export default PostalCitySelect;