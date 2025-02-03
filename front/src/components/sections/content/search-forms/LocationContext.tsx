// File: src/components/sections/content/search-forms/LocationContext.tsx
import { createContext, useState, useCallback, useContext, ReactNode, useRef } from 'react';

// Types for Country and LocationSuggestion
export interface Country {
  code_2: string;
  name_en: string;
  name_local: string;
  name_sk: string;
}

export interface LocationSuggestion {
  countryCode: string;
  postalCode: string;
  city: string;
  flagUrl: string;
}

// Interface for the location form state
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
  countries: {
    all: Country[];
    filtered: Country[];
    isLoading: boolean;
  };
}

// Response interface from the validation API
interface ValidationResponse {
  isValid: boolean;
  error?: string;
  suggestions?: LocationSuggestion[];
}

// Context value interface for the location form
interface LocationFormContextValue {
  state: LocationState;
  updateCountry: (code: string, flag: string, name?: string) => void;
  updatePostalCode: (code: string) => Promise<void>;
  updateCity: (city: string) => Promise<void>;
  resetForm: () => void;
  clearValidation: () => void;
  handleSuggestionSelect: (suggestion: LocationSuggestion) => Promise<void>;
  fetchCountries: () => Promise<void>;
  filterCountries: (input: string) => void;
  getFlagPath: (countryCode: string) => string;
}

// Function to generate the flag URL as a fallback if API does not return one.
// UPDATED: Now using the folder "4x3" as required.
const getFlagPath = (countryCode: string): string =>
  `/flags/4x3/optimized/${countryCode.toLowerCase()}.svg`;

// Initial state for the location form
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
    suggestions: [],
  },
  countries: {
    all: [],
    filtered: [],
    isLoading: false,
  },
};

export const LocationFormContext = createContext<LocationFormContextValue | undefined>(undefined);

interface LocationFormProviderProps {
  children: ReactNode;
  type: 'pickup' | 'delivery';
}

export function LocationFormProvider({ children }: LocationFormProviderProps) {
  const [state, setState] = useState<LocationState>(initialState);

  // AbortController ref to cancel previous API requests when needed
  const abortControllerRef = useRef<AbortController | null>(null);

  // Function to update validation state by merging new values
  const updateValidation = useCallback((validation: Partial<LocationState['validation']>) => {
    setState((prev) => ({
      ...prev,
      validation: {
        ...prev.validation,
        ...validation,
      },
    }));
  }, []);

  // Function to validate the location via an API call.
  // Accepts an AbortSignal to allow cancellation of the request.
  const validateLocation = useCallback(
    async (postalCode: string, city: string, signal?: AbortSignal): Promise<ValidationResponse> => {
      try {
        const params = new URLSearchParams();
        params.append("postalCode", postalCode);
        params.append("city", city);
        if (state.country.code) {
          params.append("countryCode", state.country.code);
        }
        const response = await fetch(`/api/geo/location?${params.toString()}`, { signal });
        const data = await response.json();
        return {
          isValid: data.results && data.results.length > 0,
          suggestions: data.results.map((result: any) => ({
            countryCode: result.country_code,
            postalCode: result.postal_code,
            city: result.place_name,
            flagUrl: result.flag_url,
          })),
        };
      } catch (error) {
        if ((error as any).name === "AbortError") {
          // Request was aborted; return an empty result.
          return {
            isValid: false,
            suggestions: [],
          };
        }
        console.error("Validation error:", error);
        return {
          isValid: false,
          error: "Validation failed",
        };
      }
    },
    [state.country.code]
  );

  // Fetch the list of countries from the API.
  const fetchCountries = useCallback(async () => {
    if (state.countries.all.length > 0 || state.countries.isLoading) return;

    setState((prev) => ({
      ...prev,
      countries: { ...prev.countries, isLoading: true },
    }));

    try {
      const response = await fetch('/api/geo/countries');
      if (!response.ok) throw new Error('Failed to fetch countries');
      const data: Country[] = await response.json();
      const sortedData = data.sort((a, b) => a.code_2.localeCompare(b.code_2));
      setState((prev) => ({
        ...prev,
        countries: {
          all: sortedData,
          filtered: sortedData,
          isLoading: false,
        },
      }));
    } catch (error) {
      console.error("Country loading error:", error);
      setState((prev) => ({
        ...prev,
        countries: {
          ...prev.countries,
          isLoading: false,
        },
      }));
    }
  }, [state.countries.all.length, state.countries.isLoading]);

  // Filter countries based on the input text.
  const filterCountries = useCallback((input: string) => {
    const filtered = state.countries.all.filter((country) =>
      country.code_2.startsWith(input.toUpperCase())
    );
    setState((prev) => ({
      ...prev,
      countries: {
        ...prev.countries,
        filtered,
      },
    }));
  }, [state.countries.all]);

  // Update the selected country and reset validation.
  const updateCountry = useCallback((code: string, flag: string, name?: string) => {
    setState((prev) => ({
      ...prev,
      country: { code, flag, name },
      validation: {
        ...initialState.validation,
        isDirty: true,
      },
    }));
  }, []);

  // Update postal code with immediate cancellation of previous validation calls.
  const updatePostalCode = useCallback(async (code: string) => {
    // Abort previous request if it exists.
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    // Create a new AbortController for the current request.
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Update state with the new postal code and reset validation errors and suggestions.
    setState((prev) => ({
      ...prev,
      postalCode: code,
      validation: {
        ...prev.validation,
        isDirty: true,
        isValidating: true,
        error: null,
        suggestions: [],
      },
    }));

    // If the postal code is empty, clear validation and exit early.
    if (code.trim() === "") {
      updateValidation({
        isValidating: false,
        error: null,
        isValid: false,
        suggestions: [],
      });
      return;
    }

    // Call the API to validate the location with the current postal code, city, and abort signal.
    const validationResult = await validateLocation(code, state.city, controller.signal);
    updateValidation({
      isValidating: false,
      error: validationResult.error || null,
      isValid: validationResult.isValid,
      suggestions: validationResult.suggestions,
    });
  }, [state.city, validateLocation, updateValidation]);

  // Update city and revalidate the location.
  const updateCity = useCallback(async (city: string) => {
    setState((prev) => ({
      ...prev,
      city,
      validation: {
        ...prev.validation,
        isDirty: true,
        isValidating: true,
      },
    }));
    const validationResult = await validateLocation(state.postalCode, city);
    updateValidation({
      isValidating: false,
      error: validationResult.error || null,
      isValid: validationResult.isValid,
      suggestions: validationResult.suggestions,
    });
  }, [state.postalCode, validateLocation, updateValidation]);

  // Handle selection from the suggestions list.
  const handleSuggestionSelect = useCallback(async (suggestion: LocationSuggestion) => {
    setState((prev) => ({
      ...prev,
      postalCode: suggestion.postalCode,
      city: suggestion.city,
      validation: {
        ...prev.validation,
        isDirty: true,
        isValidating: true,
      },
    }));
    const validationResult = await validateLocation(suggestion.postalCode, suggestion.city);
    updateValidation({
      isValidating: false,
      error: validationResult.error || null,
      isValid: validationResult.isValid,
      suggestions: validationResult.suggestions,
    });
  }, [validateLocation, updateValidation]);

  // Reset the entire form to its initial state.
  const resetForm = useCallback(() => {
    setState(initialState);
  }, []);

  // Clear only the validation state.
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
    handleSuggestionSelect,
    fetchCountries,
    filterCountries,
    getFlagPath,
  };

  return (
    <LocationFormContext.Provider value={contextValue}>
      {children}
    </LocationFormContext.Provider>
  );
}

// Hook to use the LocationFormContext.
export function useLocationForm() {
  const context = useContext(LocationFormContext);
  if (!context) {
    throw new Error('useLocationForm must be used within LocationFormProvider');
  }
  return context;
}
