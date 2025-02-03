// File: src/hooks/useLocation.ts
// Last change: Fixed validation types and removed unused imports

// Types
export interface LocationSuggestion {
  countryCode: string;
  postalCode: string;
  city: string;
 }
 
 export interface LocationState {
  country: {
    code: string;
    flag: string;
    name?: string;
  };
  postalCode: string;
  city: string;
 }
 
 export interface ValidationState {
  isValidating: boolean;
  error: string | null;
  isDirty: boolean;
  isValid: boolean;
 }
 
 export interface ValidationResponse {
  isValid: boolean;
  error?: string;
  suggestions?: LocationSuggestion[];
 }
 
 export interface LocationContextValue {
  state: LocationState;
  updateCountry: (code: string, flag: string, name?: string) => void;
  updatePostalCode: (code: string) => Promise<ValidationResponse>;
  updateCity: (city: string) => Promise<ValidationResponse>;
  resetLocation: () => void;
  validateLocation: () => Promise<ValidationResponse>;
  clearValidation: () => void;
 }