// File: src/components/sections/content/search-forms/CountrySelect.tsx
// Last change: Added useLocationForm integration while preserving existing logic

import React, { useState, useEffect, useRef } from 'react';
import { useLocationForm } from './LocationContext';

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
 initialValue = '',
}) => {
 const { updateCountry } = useLocationForm();

 const [countries, setCountries] = useState<Country[]>([]);
 const [countryInput, setCountryInput] = useState(initialValue.toUpperCase());
 const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
 const [showDropdown, setShowDropdown] = useState(false);
 const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
 const [isInputFocused, setIsInputFocused] = useState(false);
 const [lastValidInput, setLastValidInput] = useState('');
 const [isLoading, setIsLoading] = useState(false);

 const inputRef = useRef<HTMLInputElement>(null);
 const dropdownRef = useRef<HTMLDivElement>(null);
 const optionsRef = useRef<(HTMLLIElement | null)[]>([]);

 useEffect(() => {
   let isMounted = true;
   
   const fetchCountries = async () => {
     if (countries.length > 0 || isLoading) return;
     
     setIsLoading(true);
     try {
       const response = await fetch("/api/geo/countries");
       if (!response.ok) throw new Error('Failed to fetch countries');
       const data: Country[] = await response.json();
       
       if (isMounted) {
         const sortedData = data.sort((a, b) => a.code_2.localeCompare(b.code_2));
         setCountries(sortedData);
         setFilteredCountries(sortedData);
       }
     } catch (error) {
       console.error('Country loading error:', error);
     } finally {
       if (isMounted) {
         setIsLoading(false);
       }
     }
   };

   fetchCountries();
   return () => { isMounted = false; };
 }, []);

 useEffect(() => {
   const handleClickOutside = (event: MouseEvent) => {
     if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
       setShowDropdown(false);
       setHighlightedIndex(null);
     }
   };

   document.addEventListener('mousedown', handleClickOutside);
   return () => document.removeEventListener('mousedown', handleClickOutside);
 }, []);

 const filterCountries = (input: string) => {
   return countries.filter(country => 
     country.code_2.startsWith(input.toUpperCase())
   );
 };

 const handleCountryChange = (input: string) => {
   const cleanInput = input.replace(/[^A-Za-z]/g, '').toUpperCase();
   
   const filtered = filterCountries(cleanInput);
   
   if (cleanInput.length === 2 && filtered.length === 0) {
     setCountryInput(lastValidInput);
     return;
   }

   setCountryInput(cleanInput);
   setFilteredCountries(filtered);
   setShowDropdown(true);
   setHighlightedIndex(null);

   if (filtered.length > 0) {
     setLastValidInput(cleanInput);
   }

   if (filtered.length === 1 && cleanInput.length === 2) {
     handleCountrySelect(filtered[0]);
   }

   if (filtered.length !== 1 && cleanInput.length < 2) {
     onCountrySelect('', '');
   }
 };

 const handleCountrySelect = (country: Country) => {
   setCountryInput(country.code_2);
   setShowDropdown(false);
   setHighlightedIndex(null);
   setIsInputFocused(false);
   setLastValidInput(country.code_2);

   // Add context update
   const flagPath = getFlagPath(country.code_2);
   updateCountry(country.code_2, flagPath, country.name_en);
   
   // Keep existing callback
   onCountrySelect(country.code_2, flagPath);
   
   if (onNextFieldFocus) {
     setTimeout(onNextFieldFocus, 0);
   }
 };

 const toggleDropdown = () => {
   if (showDropdown) {
     setShowDropdown(false);
     setHighlightedIndex(null);
   } else {
     const filtered = countryInput ? filterCountries(countryInput) : countries;
     setFilteredCountries(filtered);
     setShowDropdown(true);
   }
 };

 const handleKeyDown = (event: React.KeyboardEvent) => {
   if (!showDropdown && (event.key === 'ArrowDown' || event.key === 'Enter')) {
     event.preventDefault();
     setShowDropdown(true);
     setHighlightedIndex(0);
     setIsInputFocused(false);
     return;
   }

   if (!showDropdown) return;

   const ITEMS_PER_PAGE = 8;
   const currentIndex = highlightedIndex || 0;

   switch(event.key) {
     case 'ArrowDown':
       event.preventDefault();
       if (isInputFocused) {
         setIsInputFocused(false);
         setHighlightedIndex(0);
       } else {
         setHighlightedIndex(prev =>
           prev === null || prev >= filteredCountries.length - 1 ? 0 : prev + 1
         );
       }
       break;

     case 'ArrowUp':
       event.preventDefault();
       if (!isInputFocused && (highlightedIndex === 0 || highlightedIndex === null)) {
         setIsInputFocused(true);
         setHighlightedIndex(null);
       } else {
         setHighlightedIndex(prev =>
           prev === null || prev <= 0 ? filteredCountries.length - 1 : prev - 1
         );
       }
       break;

     case 'PageDown':
       event.preventDefault();
       setHighlightedIndex(Math.min(currentIndex + ITEMS_PER_PAGE, filteredCountries.length - 1));
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
         handleCountrySelect(filteredCountries[highlightedIndex]);
       }
       break;

     case 'Escape':
       setShowDropdown(false);
       setHighlightedIndex(null);
       setIsInputFocused(true);
       inputRef.current?.focus();
       break;
   }
 };

 useEffect(() => {
   if (highlightedIndex !== null && !isInputFocused && showDropdown) {
     const option = optionsRef.current[highlightedIndex];
     if (option) {
       option.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
       option.focus();
     }
   } else if (isInputFocused) {
     inputRef.current?.focus();
   }
 }, [highlightedIndex, isInputFocused, showDropdown]);

 return (
   <div className="country-select" ref={dropdownRef}>
     <div className="combobox-input-group">
       <input
         ref={inputRef}
         type="text"
         value={countryInput}
         onChange={(e) => handleCountryChange(e.target.value)}
         onKeyDown={handleKeyDown}
         onFocus={() => {
           setIsInputFocused(true);
           setShowDropdown(true);
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
         aria-expanded={showDropdown}
         style={{
           padding: '0.25rem',
           background: 'transparent',
           border: 'none',
           cursor: 'pointer',
           display: 'flex',
           alignItems: 'center',
           marginLeft: '-1px'
         }}
       >
         <svg 
           width="10" 
           height="6" 
           viewBox="0 0 10 6" 
           fill="none" 
           xmlns="http://www.w3.org/2000/svg"
           style={{ 
             transform: showDropdown ? "rotate(180deg)" : "rotate(0deg)",
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

       {showDropdown && (
         <ul className="combobox-options" role="listbox">
           {filteredCountries.map((country, index) => (
             <li
               key={country.code_2}
               ref={el => optionsRef.current[index] = el}
               onClick={() => handleCountrySelect(country)}
               onKeyDown={handleKeyDown}
               className={`combobox-option ${index === highlightedIndex && !isInputFocused ? 'highlighted' : ''}`}
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
               <span className="country-local text-gray-500">&nbsp;({country.name_local})</span>
             </li>
           ))}
         </ul>
       )}
     </div>
   </div>
 );
};

export default CountrySelect;