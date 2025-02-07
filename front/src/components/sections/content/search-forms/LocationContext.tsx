// File: src/components/sections/content/search-forms/LocationContext.tsx
// Last change: Added response validation and error handling

import { createContext, useContext, useCallback, ReactNode, useState } from 'react';
import { useFormField } from '@/hooks/useFormField';
import { useAsyncSelect } from '@/hooks/useAsyncSelect';
import type { Country, LocationSuggestion } from '@/types/location.types';

interface EnhancedLocationSuggestion extends LocationSuggestion {
 matchType: 'postal' | 'city' | 'both';
 matchScore: number;
}

interface LocationContextState {
 country: ReturnType<typeof useFormField<Country | null>>;
 postalCode: ReturnType<typeof useFormField<string>>;
 city: ReturnType<typeof useFormField<string>>;
 countrySelect: ReturnType<typeof useAsyncSelect<Country>>;
 suggestions: EnhancedLocationSuggestion[];
 isLoading: boolean;
 error: string | null;
 validateLocation: (code: string, city: string) => Promise<void>;
 reset: () => void;
 loadMore: () => Promise<void>;
 apiHasMore: boolean;
 activeField: 'postal' | 'city' | null;
 setActiveField: (field: 'postal' | 'city' | null) => void;
 dropdownOpen: boolean;
 setDropdownOpen: (open: boolean) => void;
}

interface LocationProviderProps {
 children: ReactNode;
}

const LocationContext = createContext<LocationContextState | undefined>(undefined);

export function LocationProvider({ children }: LocationProviderProps) {
 const [suggestions, setSuggestions] = useState<EnhancedLocationSuggestion[]>([]);
 const [isLoading, setIsLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [apiHasMore, setApiHasMore] = useState(false);
 const [activeField, setActiveField] = useState<'postal' | 'city' | null>(null);
 const [dropdownOpen, setDropdownOpen] = useState(false);

 const handleFieldChange = useCallback(async (code: string, cityValue: string) => {
   console.log("[LocationContext] Field change:", { code, cityValue });
   if (!code && !cityValue) {
     setSuggestions([]);
     setDropdownOpen(false);
     return;
   }
   setDropdownOpen(true);
   await validateLocation(code, cityValue);
 }, []);

 const postalCode = useFormField<string>({
   initialValue: '',
   transform: (value) => value.trim(),
   onChange: (value) => {
     if (activeField === 'postal') {
       handleFieldChange(value, city.value);
     }
   }
 });

 const city = useFormField<string>({
   initialValue: '',
   transform: (value) => value.trim(),
   onChange: (value) => {
     if (activeField === 'city') {
       handleFieldChange(postalCode.value, value);
     }
   }
 });

 const country = useFormField<Country | null>({
   initialValue: null,
   transform: (value) => value,
   onChange: (newCountry) => {
     if (postalCode.value || city.value) {
       validateLocation(postalCode.value, city.value);
     }
   }
 });

 const countrySelect = useAsyncSelect<Country>({
   fetchItems: async (query: string) => {
     const response = await fetch(`/api/geo/countries?q=${query}&sort=logistics_priority`);
     if (!response.ok) throw new Error('Failed to fetch countries');
     
     const countries: Country[] = await response.json();
     return countries.sort((a: Country, b: Country) =>
       (b.logistics_priority || 0) - (a.logistics_priority || 0)
     );
   },
   minQueryLength: 0
 });

 const validateLocation = useCallback(async (code: string, cityValue: string) => {
   if (!code && !cityValue) {
     setSuggestions([]);
     return;
   }

   setIsLoading(true);
   setError(null);

   try {
     const params = new URLSearchParams({
       offset: '0',
       limit: '20'
     });

     if (country.value?.code_2) params.append('countryCode', country.value.code_2);
     if (code) params.append('postalCode', code);
     if (cityValue) params.append('city', cityValue);

     console.log("[LocationContext] Fetching with params:", params.toString());
     const response = await fetch(`/api/geo/location?${params}`);
     
     if (!response.ok) {
       console.error(`API error: ${response.status}`);
       throw new Error(`Failed to validate location: ${response.status}`);
     }

     const text = await response.text();
     let data;
     
     try {
       data = JSON.parse(text);
     } catch (e) {
       console.error('Invalid JSON response:', text.substring(0, 100));
       throw new Error('Invalid server response format');
     }

     const enhancedSuggestions = data.results.map((suggestion: LocationSuggestion) => ({
       ...suggestion,
       matchType: (() => {
         const postalMatch = code && suggestion.postal_code.startsWith(code);
         const cityMatch = cityValue && suggestion.city.toLowerCase().includes(cityValue.toLowerCase());
         return postalMatch && cityMatch ? 'both' : postalMatch ? 'postal' : 'city';
       })(),
       matchScore: (() => {
         let score = suggestion.country.logistics_priority || 0;
         if (code) {
           if (suggestion.postal_code === code) score += 5;
           else if (suggestion.postal_code.startsWith(code)) score += 3;
         }
         if (cityValue) {
           const normalizedCity = suggestion.city.toLowerCase();
           const normalizedQuery = cityValue.toLowerCase();
           if (normalizedCity === normalizedQuery) score += 3;
           else if (normalizedCity.startsWith(normalizedQuery)) score += 2;
           else if (normalizedCity.includes(normalizedQuery)) score += 1;
         }
         return score;
       })()
     }));

     setSuggestions(enhancedSuggestions.sort(
       (a: EnhancedLocationSuggestion, b: EnhancedLocationSuggestion) => 
         b.matchScore - a.matchScore
     ));
     setApiHasMore(!!data.hasMore);
   } catch (error) {
     console.error("[LocationContext] Validation error:", error);
     setError(error instanceof Error ? error.message : 'Failed to validate location');
     setSuggestions([]);
     setApiHasMore(false);
   } finally {
     setIsLoading(false);
     console.log("[LocationContext] validateLocation completed. isLoading set to false.");
   }
 }, [country.value]);

 const loadMore = useCallback(async () => {
   if (!suggestions.length || !apiHasMore) return;
   
   setIsLoading(true);
   setError(null);

   try {
     const params = new URLSearchParams({
       offset: suggestions.length.toString(),
       limit: '20'
     });

     if (country.value?.code_2) params.append('countryCode', country.value.code_2);
     if (postalCode.value) params.append('postalCode', postalCode.value);
     if (city.value) params.append('city', city.value);

     const response = await fetch(`/api/geo/location?${params}`);
     
     if (!response.ok) {
       console.error(`API error: ${response.status}`);
       throw new Error(`Failed to load more locations: ${response.status}`);
     }

     const text = await response.text();
     let data;
     
     try {
       data = JSON.parse(text);
     } catch (e) {
       console.error('Invalid JSON response:', text.substring(0, 100));
       throw new Error('Invalid server response format');
     }

     const newSuggestions = data.results.map((suggestion: LocationSuggestion) => ({
       ...suggestion,
       matchType: (() => {
         const postalMatch = postalCode.value && suggestion.postal_code.startsWith(postalCode.value);
         const cityMatch = city.value && suggestion.city.toLowerCase().includes(city.value.toLowerCase());
         return postalMatch && cityMatch ? 'both' : postalMatch ? 'postal' : 'city';
       })(),
       matchScore: (() => {
         let score = suggestion.country.logistics_priority || 0;
         if (postalCode.value) {
           if (suggestion.postal_code === postalCode.value) score += 5;
           else if (suggestion.postal_code.startsWith(postalCode.value)) score += 3;
         }
         if (city.value) {
           const normalizedCity = suggestion.city.toLowerCase();
           const normalizedQuery = city.value.toLowerCase();
           if (normalizedCity === normalizedQuery) score += 3;
           else if (normalizedCity.startsWith(normalizedQuery)) score += 2;
           else if (normalizedCity.includes(normalizedQuery)) score += 1;
         }
         return score;
       })()
     }));

     setSuggestions(prev => [...prev, ...newSuggestions.sort(
       (a: EnhancedLocationSuggestion, b: EnhancedLocationSuggestion) => 
         b.matchScore - a.matchScore
     )]);
     setApiHasMore(!!data.hasMore);
   } catch (error) {
     console.error("[LocationContext] Load more error:", error);
     setError(error instanceof Error ? error.message : 'Failed to load more locations');
   } finally {
     setIsLoading(false);
   }
 }, [country.value, postalCode.value, city.value, suggestions.length, apiHasMore]);

 const reset = useCallback(() => {
   country.reset();
   postalCode.reset();
   city.reset();
   setSuggestions([]);
   setError(null);
   setActiveField(null);
   setDropdownOpen(false);
 }, [country, postalCode, city]);

 return (
   <LocationContext.Provider value={{
     country,
     postalCode,
     city,
     countrySelect,
     suggestions,
     isLoading,
     error,
     validateLocation,
     reset,
     loadMore,
     apiHasMore,
     activeField,
     setActiveField,
     dropdownOpen,
     setDropdownOpen
   }}>
     {children}
   </LocationContext.Provider>
 );
}

export function useLocation() {
 const context = useContext(LocationContext);
 if (!context) {
   throw new Error('useLocation must be used within LocationProvider');
 }
 return context;
}

export type { LocationContextState, LocationProviderProps, EnhancedLocationSuggestion };