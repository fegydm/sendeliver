// File: src/components/sections/content/search-forms/LocationContext.tsx
// Last change: Simplified logic, reduced console logs, optimized re-renders with useMemo, and fixed suggestions type error

import { createContext, useState, useCallback, useContext, ReactNode, useRef, useMemo } from 'react';

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
    suggestions: LocationSuggestion[]; // Always an array
  };
  countries: {
    all: Country[];
    filtered: Country[];
    isLoading: boolean;
  };
  pagination: {
    offset: number;
    limit: number;
    total: number;
  };
}

interface ValidationResponse {
  isValid: boolean;
  error?: string;
  suggestions?: LocationSuggestion[];
  total?: number;
}

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
  loadMoreSuggestions: () => Promise<void>;
}

const getFlagPath = (countryCode: string): string =>
  `/flags/4x3/optimized/${countryCode.toLowerCase()}.svg`;

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
    suggestions: [],
  },
  countries: {
    all: [],
    filtered: [],
    isLoading: false,
  },
  pagination: {
    offset: 0,
    limit: 20,
    total: 0,
  },
};

export const LocationFormContext = createContext<LocationFormContextValue | undefined>(undefined);

interface LocationFormProviderProps {
  children: ReactNode;
  type: 'pickup' | 'delivery';
}

export function LocationFormProvider({ children }: LocationFormProviderProps) {
  const [state, setState] = useState<LocationState>(initialState);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Update validation state
  const updateValidation = useCallback((validation: Partial<LocationState['validation']>) => {
    console.log('updateValidation called with:', validation);
    setState((prev) => ({
      ...prev,
      validation: { ...prev.validation, ...validation },
    }));
  }, []);

  // Validate location using API
  const validateLocation = useCallback(
    async (postalCode: string, city: string, signal?: AbortSignal): Promise<ValidationResponse> => {
      console.log('validateLocation called with:', { postalCode, city });
      try {
        const params = new URLSearchParams();
        params.append('postalCode', postalCode);
        params.append('city', city);
        if (state.country.code) {
          params.append('countryCode', state.country.code);
        }
        params.append('offset', state.pagination.offset.toString());
        params.append('limit', state.pagination.limit.toString());
  
        console.log('Calling API with params:', params.toString());
        const response = await fetch(`/api/geo/location?${params.toString()}`, { signal });
        const data = await response.json();
        console.log('API response:', data);
  
        // Check if API returned an error message
        if (data.error) {
          console.error('API returned error:', data.error);
          // Return error in the ValidationResponse
          return { isValid: false, error: data.error, suggestions: [], total: 0 };
        }
  
        const results: any[] = Array.isArray(data.results) ? data.results : [];
        return {
          isValid: results.length > 0,
          suggestions: results.map((result) => ({
            countryCode: result.country_code,
            postalCode: result.postal_code,
            city: result.place_name,
            flagUrl: result.flag_url,
          })),
          total: data.total,
        };
      } catch (error) {
        if ((error as any).name === 'AbortError') {
          console.log('validateLocation aborted');
          return { isValid: false, suggestions: [] };
        }
        console.error('Validation error:', error);
        throw new Error('Failed to validate location');
      }
    },
    [state.country.code, state.pagination.offset, state.pagination.limit]
  );

  // Load more suggestions for pagination
  const loadMoreSuggestions = useCallback(async () => {
    const newOffset = state.pagination.offset + state.pagination.limit;
    console.log('loadMoreSuggestions called, newOffset:', newOffset);

    try {
      const validationResult = await validateLocation(state.postalCode, state.city);
      console.log('loadMoreSuggestions validationResult:', validationResult);
      setState((prev) => ({
        ...prev,
        validation: {
          ...prev.validation,
          // Use nullish coalescing operator to ensure suggestions is always an array
          suggestions: [
            ...(prev.validation.suggestions ?? []),
            ...(validationResult.suggestions ?? []),
          ],
        },
        pagination: {
          ...prev.pagination,
          offset: newOffset,
          total: validationResult.total || prev.pagination.total,
        },
      }));
    } catch (error) {
      console.error('Load more error:', error);
    }
  }, [state.pagination, state.postalCode, state.city, validateLocation]);

  // Fetch countries from API
  const fetchCountries = useCallback(async () => {
    if (state.countries.all.length > 0 || state.countries.isLoading) return;
    console.log('fetchCountries called');

    setState((prev) => ({
      ...prev,
      countries: { ...prev.countries, isLoading: true },
    }));

    try {
      const response = await fetch('/api/geo/countries');
      if (!response.ok) throw new Error('Failed to fetch countries');
      const data: Country[] = await response.json();
      console.log('Fetched countries:', data);
      const sortedData = data.sort((a, b) => a.code_2.localeCompare(b.code_2));
      setState((prev) => ({
        ...prev,
        countries: { all: sortedData, filtered: sortedData, isLoading: false },
      }));
    } catch (error) {
      console.error('Country loading error:', error);
      setState((prev) => ({
        ...prev,
        countries: { ...prev.countries, isLoading: false },
      }));
    }
  }, [state.countries.all.length, state.countries.isLoading]);

  // Filter countries based on input
  const filterCountries = useCallback((input: string) => {
    console.log('filterCountries called with input:', input);
    setState((prev) => ({
      ...prev,
      countries: {
        ...prev.countries,
        filtered: prev.countries.all.filter((country) =>
          country.code_2.startsWith(input.toUpperCase())
        ),
      },
    }));
  }, []);

  // Update selected country
  const updateCountry = useCallback((code: string, flag: string, name?: string) => {
    console.log('updateCountry called with:', { code, flag, name });
    setState((prev) => ({
      ...prev,
      country: { code, flag, name },
      validation: { ...initialState.validation, isDirty: true },
      pagination: { ...initialState.pagination },
    }));
  }, []);

  // Update postal code and perform validation
  const updatePostalCode = useCallback(
    async (code: string) => {
      console.log('updatePostalCode called with:', code);
      if (abortControllerRef.current) {
        console.log('Aborting previous request');
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setState((prev) => ({
        ...prev,
        postalCode: code,
        validation: { ...prev.validation, isDirty: true, isValidating: true, error: null, suggestions: [] },
        pagination: { ...initialState.pagination },
      }));

      if (code.trim() === '') {
        console.log('Postal code is empty, skipping validation');
        updateValidation({ isValidating: false, error: null, isValid: false, suggestions: [] });
        return;
      }

      try {
        const validationResult = await validateLocation(code, state.city, controller.signal);
        console.log('Validation result for postal code:', validationResult);
        updateValidation({
          isValidating: false,
          error: validationResult.error || null,
          isValid: validationResult.isValid,
          suggestions: validationResult.suggestions,
        });
        setState((prev) => ({
          ...prev,
          pagination: { ...prev.pagination, total: validationResult.total || 0 },
        }));
      } catch (error) {
        console.error('Error in updatePostalCode:', error);
        updateValidation({ isValidating: false, error: 'Failed to validate location', isValid: false, suggestions: [] });
      }
    },
    [state.city, validateLocation, updateValidation]
  );

  // Update city and perform validation
  const updateCity = useCallback(
    async (city: string) => {
      console.log('updateCity called with:', city);
      setState((prev) => ({
        ...prev,
        city,
        validation: { ...prev.validation, isDirty: true, isValidating: true },
        pagination: { ...initialState.pagination },
      }));

      try {
        const validationResult = await validateLocation(state.postalCode, city);
        console.log('Validation result for city:', validationResult);
        updateValidation({
          isValidating: false,
          error: validationResult.error || null,
          isValid: validationResult.isValid,
          suggestions: validationResult.suggestions,
        });
        setState((prev) => ({
          ...prev,
          pagination: { ...prev.pagination, total: validationResult.total || 0 },
        }));
      } catch (error) {
        console.error('Error in updateCity:', error);
        updateValidation({ isValidating: false, error: 'Failed to validate location', isValid: false, suggestions: [] });
      }
    },
    [state.postalCode, validateLocation, updateValidation]
  );

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback(
    async (suggestion: LocationSuggestion) => {
      console.log('handleSuggestionSelect called with:', suggestion);
      setState((prev) => ({
        ...prev,
        postalCode: suggestion.postalCode,
        city: suggestion.city,
        validation: { ...prev.validation, isDirty: true, isValidating: true },
      }));

      try {
        const validationResult = await validateLocation(suggestion.postalCode, suggestion.city);
        console.log('Validation result after suggestion select:', validationResult);
        updateValidation({
          isValidating: false,
          error: validationResult.error || null,
          isValid: validationResult.isValid,
          suggestions: validationResult.suggestions,
        });
      } catch (error) {
        console.error('Error in handleSuggestionSelect:', error);
        updateValidation({ isValidating: false, error: 'Failed to validate location', isValid: false, suggestions: [] });
      }
    },
    [validateLocation, updateValidation]
  );

  // Reset form to initial state
  const resetForm = useCallback(() => {
    console.log('resetForm called');
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setState(initialState);
  }, []);

  // Clear validation state
  const clearValidation = useCallback(() => {
    console.log('clearValidation called');
    updateValidation(initialState.validation);
  }, [updateValidation]);

  // Memoize context value to reduce unnecessary re-renders
  const contextValue = useMemo<LocationFormContextValue>(
    () => ({
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
      loadMoreSuggestions,
    }),
    [
      state,
      updateCountry,
      updatePostalCode,
      updateCity,
      resetForm,
      clearValidation,
      handleSuggestionSelect,
      fetchCountries,
      filterCountries,
      loadMoreSuggestions,
    ]
  );

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
