// File: src/components/sections/content/search-forms/PostalCitySelect.tsx
// Last change: Added console logs and fixed validation calls

import React, { useRef, useCallback } from "react";
import { useLocation } from "./LocationContext";
import { BaseDropdown, type LocationType } from "./BaseDropdown";
import type { LocationSuggestion } from '@/types/location.types';

interface PostalCitySelectProps {
 postalCodeRef?: React.RefObject<HTMLInputElement>;
 dateInputRef?: React.RefObject<HTMLInputElement>;
 onValidSelection: () => void;
 locationType: LocationType;
}

export function PostalCitySelect({
 postalCodeRef,
 dateInputRef,
 onValidSelection,
 locationType
}: PostalCitySelectProps) {
 const {
   postalCode,
   city,
   suggestions,
   loadMore,
   validateLocation,
   apiHasMore,
   activeField,
   setActiveField,
   dropdownOpen,
   setDropdownOpen,
   isLoading
 } = useLocation();

 const defaultPostalRef = useRef<HTMLInputElement>(null);
 const cityInputRef = useRef<HTMLInputElement>(null);
 const activePostalRef = postalCodeRef || defaultPostalRef;

 const handlePostalCodeInput = useCallback((value: string) => {
   console.log("[PostalCitySelect] handlePostalCodeInput called with:", value);
   setActiveField('postal');
   postalCode.setValue(value);
   validateLocation(value, city.value);  // Added back
   setDropdownOpen(true);
 }, [validateLocation, city.value, setActiveField, postalCode, setDropdownOpen]);

 const handleCityInput = useCallback((value: string) => {
   console.log("[PostalCitySelect] handleCityInput called with:", value);
   setActiveField('city');
   city.setValue(value);
   validateLocation(postalCode.value, value);  // Added back
   setDropdownOpen(true);
 }, [validateLocation, postalCode.value, setActiveField, city, setDropdownOpen]);

 const handleSelect = useCallback((suggestion: LocationSuggestion) => {
   console.log("[PostalCitySelect] handleSelect called with:", suggestion);
   postalCode.setValue(suggestion.postal_code);
   city.setValue(suggestion.place_name);
   validateLocation(suggestion.postal_code, suggestion.place_name);  // Added back
   setDropdownOpen(false);
   
   if (dateInputRef?.current) {
     dateInputRef.current.focus();
     onValidSelection();
   }
 }, [dateInputRef, onValidSelection, postalCode, city, validateLocation]);

 const handleDropdownClose = useCallback(() => {
   console.log("[PostalCitySelect] handleDropdownClose called");
   setDropdownOpen(false);
   setActiveField(null);
 }, [setDropdownOpen, setActiveField]);

 const renderNoResults = useCallback(() => {
   console.log("[PostalCitySelect] renderNoResults - postalCode:", postalCode.value, "city:", city.value, "isLoading:", isLoading);
   console.log("[PostalCitySelect] suggestions:", suggestions);
   if (isLoading) return <span>Loading...</span>;
   if (!postalCode.value && !city.value) return <span>Enter a value in any field</span>;
   return <span>No results found</span>;
 }, [postalCode.value, city.value, isLoading, suggestions]);

 console.log("[PostalCitySelect] Render - dropdownOpen:", dropdownOpen, "suggestions:", suggestions.length);

 return (
   <div className="dd-wrapper">
     <div className="dd-inputs">
       <input
         ref={activePostalRef}
         type="text"
         value={postalCode.value}
         onChange={e => handlePostalCodeInput(e.target.value)}
         onFocus={() => {
           console.log("[PostalCitySelect] Postal input focus");
           setActiveField('postal');
           setDropdownOpen(true);
         }}
         placeholder="Postal code"
         className={`inp-postal inp-postal-${locationType}`}
       />
       <input
         ref={cityInputRef}
         type="text"
         value={city.value}
         onChange={e => handleCityInput(e.target.value)}
         onFocus={() => {
           console.log("[PostalCitySelect] City input focus");
           setActiveField('city');
           setDropdownOpen(true);
         }}
         placeholder="City"
         className={`inp-city inp-city-${locationType}`}
       />
     </div>
     <BaseDropdown<LocationSuggestion>
       items={suggestions.slice(0, 20)}
       isOpen={dropdownOpen}
       onSelect={handleSelect}
       onClose={handleDropdownClose}
       inputRef={activeField === 'postal' ? activePostalRef : cityInputRef}
       totalItems={suggestions.length + (apiHasMore ? 1 : 0)}
       onLoadMore={loadMore}
       onNoResults={renderNoResults}
       dropdownType="location"
       locationType={locationType}
       renderItem={(suggestion, { isHighlighted }) => (
         <div className={`item-suggestion ${isHighlighted ? 'highlighted' : ''}`}>
           <img
             src={`/flags/4x3/optimized/${suggestion.country_code.toLowerCase()}.svg`}
             alt={`${suggestion.country_code} flag`}
             className="country-flag"
           />
           <span className="country-code">{suggestion.country_code}</span>
           <span className="postal-code">{suggestion.postal_code}</span>
           <span className="city-name">{suggestion.place_name}</span>
         </div>
       )}
     />
   </div>
 );
}

export default PostalCitySelect;