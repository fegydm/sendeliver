// File: src/components/sections/content/search-forms/LocationContext.tsx
// Last change: Consolidated all business logic into context

import { createContext, useState, useCallback, useContext, ReactNode } from 'react';

// Types
export interface LocationSuggestion {
 countryCode: string;
 postalCode: string;
 city: string;
}

interface LocationState {
 country: {
   code: string;
   flag: string;
   name?: string;
 };
 postalCode: string;
 city: string;
 validation: {
   isValidating: boolean;
   error: string | null;
   isDirty: boolean;
   isValid: boolean;
   suggestions?: LocationSuggestion[];
 };
}

interface ValidationResponse {
 isValid: boolean;
 error?: string;
 suggestions?: LocationSuggestion[];
}

interface LocationFormContextValue {
 state: LocationState;
 updateCountry: (code: string, flag: string, name?: string) => void;
 updatePostalCode: (code: string) => Promise<void>;
 updateCity: (city: string) => Promise<void>;
 resetForm: () => void;
 clearValidation: () => void;
 handleSuggestionSelect: (suggestion: LocationSuggestion) => Promise<void>;
}

interface LocationFormProviderProps {
 children: ReactNode;
 type: 'pickup' | 'delivery';
}

// Initial state
const initialState: LocationState = {
 country: {
   code: '',
   flag: '',
   name: '',
 },
 postalCode: '',
 city: '',
 validation: {
   isValidating: false,
   error: null,
   isDirty: false,
   isValid: false,
   suggestions: []
 }
};

export const LocationFormContext = createContext<LocationFormContextValue | undefined>(undefined);

export function LocationFormProvider({ children, type }: LocationFormProviderProps) {
 const [state, setState] = useState<LocationState>(initialState);
 
 const updateValidation = useCallback((validation: Partial<LocationState['validation']>) => {
   setState(prev => ({
     ...prev,
     validation: {
       ...prev.validation,
       ...validation
     }
   }));
 }, []);

 const validateLocation = useCallback(async (
   postalCode: string,
   city: string
 ): Promise<ValidationResponse> => {
   try {
     const response = await fetch(
       `/api/geo/location/validate?` +
       `${state.country.code ? `countryCode=${state.country.code}&` : ''}` +
       `postalCode=${postalCode}&` +
       `city=${city}`
     );
     
     const data = await response.json();
     return data;
   } catch (error) {
     console.error('Validation error:', error);
     return {
       isValid: false,
       error: 'Validation failed'
     };
   }
 }, [state.country.code]);

 const updateCountry = useCallback((code: string, flag: string, name?: string) => {
   setState(prev => ({
     ...prev,
     country: { code, flag, name },
     validation: {
       ...initialState.validation,
       isDirty: true
     }
   }));
 }, []);

 const updatePostalCode = useCallback(async (code: string) => {
   setState(prev => ({
     ...prev,
     postalCode: code,
     validation: {
       ...prev.validation,
       isDirty: true,
       isValidating: true
     }
   }));

   if (code && state.city) {
     const validationResult = await validateLocation(code, state.city);
     updateValidation({
       isValidating: false,
       error: validationResult.error || null,
       isValid: validationResult.isValid,
       suggestions: validationResult.suggestions
     });
   } else {
     updateValidation({
       isValidating: false,
       error: null,
       isValid: false,
       suggestions: []
     });
   }
 }, [state.city, validateLocation, updateValidation]);

 const updateCity = useCallback(async (city: string) => {
   setState(prev => ({
     ...prev,
     city,
     validation: {
       ...prev.validation,
       isDirty: true,
       isValidating: true
     }
   }));

   if (city && state.postalCode) {
     const validationResult = await validateLocation(state.postalCode, city);
     updateValidation({
       isValidating: false,
       error: validationResult.error || null,
       isValid: validationResult.isValid,
       suggestions: validationResult.suggestions
     });
   } else {
     updateValidation({
       isValidating: false,
       error: null,
       isValid: false,
       suggestions: []
     });
   }
 }, [state.postalCode, validateLocation, updateValidation]);

 const handleSuggestionSelect = useCallback(async (suggestion: LocationSuggestion) => {
   setState(prev => ({
     ...prev,
     postalCode: suggestion.postalCode,
     city: suggestion.city,
     validation: {
       ...prev.validation,
       isDirty: true,
       isValidating: true
     }
   }));

   const validationResult = await validateLocation(suggestion.postalCode, suggestion.city);
   updateValidation({
       isValidating: false,
       error: validationResult.error || null,
       isValid: validationResult.isValid,
       suggestions: validationResult.suggestions
   });
 }, [validateLocation, updateValidation]);

 const resetForm = useCallback(() => {
   setState(initialState);
 }, []);

 const clearValidation = useCallback(() => {
   updateValidation(initialState.validation);
 }, [updateValidation]);

 const contextValue: LocationFormContextValue = {
   state,
   updateCountry,
   updatePostalCode,
   updateCity,
   resetForm,
   clearValidation,
   handleSuggestionSelect
 };

 return (
   <LocationFormContext.Provider value={contextValue}>
     {children}
   </LocationFormContext.Provider>
 );
}

export function useLocationForm() {
 const context = useContext(LocationFormContext);
 if (!context) {
   throw new Error('useLocationForm must be used within LocationFormProvider');
 }
 return context;
}