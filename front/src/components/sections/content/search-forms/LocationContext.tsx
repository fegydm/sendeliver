// File: src/components/sections/content/search-forms/LocationContext.tsx
// Last change: Added pagination and enhanced validation logic

import { createContext, useState, useCallback, useContext, ReactNode, useRef } from 'react';

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
    suggestions?: LocationSuggestion[];
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
    total: 0
  }
};

export const LocationFormContext = createContext<LocationFormContextValue | undefined>(undefined);

interface LocationFormProviderProps {
  children: ReactNode;
  type: 'pickup' | 'delivery';
}

export function LocationFormProvider({ children }: LocationFormProviderProps) {
  const [state, setState] = useState<LocationState>(initialState);
  const abortControllerRef = useRef<AbortController | null>(null);

  const updateValidation = useCallback((validation: Partial<LocationState['validation']>) => {
    setState((prev) => ({
      ...prev,
      validation: {
        ...prev.validation,
        ...validation,
      },
    }));
  }, []);

  const validateLocation = useCallback(
    async (postalCode: string, city: string, signal?: AbortSignal): Promise<ValidationResponse> => {
      try {
        const params = new URLSearchParams();
        params.append("postalCode", postalCode);
        params.append("city", city);
        if (state.country.code) {
          params.append("countryCode", state.country.code);
        }
        params.append("offset", state.pagination.offset.toString());
        params.append("limit", state.pagination.limit.toString());

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
          total: data.total
        };
      } catch (error) {
        if ((error as any).name === "AbortError") {
          return { isValid: false, suggestions: [] };
        }
        console.error("Validation error:", error);
        return { isValid: false, error: "Validation failed" };
      }
    },
    [state.country.code, state.pagination.offset, state.pagination.limit]
  );

  const loadMoreSuggestions = useCallback(async () => {
    const newOffset = state.pagination.offset + state.pagination.limit;
    
    try {
      const validationResult = await validateLocation(state.postalCode, state.city);
      
      setState(prev => ({
        ...prev,
        validation: {
          ...prev.validation,
          suggestions: [
            ...(prev.validation.suggestions || []),
            ...(validationResult.suggestions || [])
          ]
        },
        pagination: {
          ...prev.pagination,
          offset: newOffset,
          total: validationResult.total || prev.pagination.total
        }
      }));
    } catch (error) {
      console.error("Load more error:", error);
    }
  }, [state.pagination, state.postalCode, state.city, validateLocation]);

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

  const filterCountries = useCallback((input: string) => {
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

  const updateCountry = useCallback((code: string, flag: string, name?: string) => {
    setState((prev) => ({
      ...prev,
      country: { code, flag, name },
      validation: {
        ...initialState.validation,
        isDirty: true,
      },
      pagination: {
        ...initialState.pagination
      }
    }));
  }, []);

  const updatePostalCode = useCallback(async (code: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

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
      pagination: {
        ...initialState.pagination
      }
    }));

    if (code.trim() === "") {
      updateValidation({
        isValidating: false,
        error: null,
        isValid: false,
        suggestions: [],
      });
      return;
    }

    const validationResult = await validateLocation(code, state.city, controller.signal);
    updateValidation({
      isValidating: false,
      error: validationResult.error || null,
      isValid: validationResult.isValid,
      suggestions: validationResult.suggestions,
    });
    
    setState(prev => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        total: validationResult.total || 0
      }
    }));
  }, [state.city, validateLocation, updateValidation]);

  const updateCity = useCallback(async (city: string) => {
    setState((prev) => ({
      ...prev,
      city,
      validation: {
        ...prev.validation,
        isDirty: true,
        isValidating: true,
      },
      pagination: {
        ...initialState.pagination
      }
    }));
    
    const validationResult = await validateLocation(state.postalCode, city);
    updateValidation({
      isValidating: false,
      error: validationResult.error || null,
      isValid: validationResult.isValid,
      suggestions: validationResult.suggestions,
    });
    
    setState(prev => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        total: validationResult.total || 0
      }
    }));
  }, [state.postalCode, validateLocation, updateValidation]);

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

  const resetForm = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
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
    handleSuggestionSelect,
    fetchCountries,
    filterCountries,
    getFlagPath,
    loadMoreSuggestions
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