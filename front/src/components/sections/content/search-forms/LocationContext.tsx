// File: src/components/sections/content/search-forms/LocationContext.tsx
// Last change: Complete context implementation with proper typing

import { createContext, useContext, useCallback, ReactNode } from 'react';
import { useFormField } from '@/hooks/useFormField';
import { useAsyncSelect } from '@/hooks/useAsyncSelect';
import { usePagination } from '@/hooks/usePagination';
import type { Country, LocationSuggestion, ValidationResult } from '@/types/location.types';

// API helper functions
const getFlagPath = (countryCode: string): string => 
  `/flags/4x3/${countryCode.toLowerCase()}.svg`;

// Context state definition
interface LocationContextState {
  country: ReturnType<typeof useFormField<Country | null>>;
  postalCode: ReturnType<typeof useFormField<string>>;
  city: ReturnType<typeof useFormField<string>>;
  countrySelect: ReturnType<typeof useAsyncSelect<Country>>;
  suggestions: LocationSuggestion[];
  validation: {
    isLoading: boolean;
    error: string | null;
  };
  pagination: ReturnType<typeof usePagination>;
  validateLocation: (code: string, city: string) => Promise<ValidationResult>;
  reset: () => void;
  getFlagPath: (countryCode: string) => string;
}

interface LocationProviderProps {
  children: ReactNode;
  onValidSelection?: () => void;
}

// Create context
const LocationContext = createContext<LocationContextState | undefined>(undefined);

// Provider component
export function LocationProvider({ children }: LocationProviderProps) {
  // Pagination setup
  const pagination = usePagination({
    dataPageSize: 20,
    uiPageSize: 8
  });

  // Country field with validation
  const country = useFormField<Country | null>({
    initialValue: null,
    validate: async (value) => {
      return Boolean(value?.code_2);
    },
    onChange: () => {
      postalCode.reset();
      city.reset();
      pagination.reset();
    }
  });

  // Country selection with async search
  const countrySelect = useAsyncSelect<Country>({
    fetchItems: async (query: string) => {
      const response = await fetch(`/api/geo/countries?q=${query}`);
      if (!response.ok) throw new Error('Failed to fetch countries');
      return response.json();
    },
    minQueryLength: 1
  });

  // Location validation logic
  const validateLocation = useCallback(async (
    code: string,
    cityValue: string
  ): Promise<ValidationResult> => {
    if (!country.value?.code_2 || !code || !cityValue) {
      return { isValid: false, suggestions: [] };
    }

    try {
      const params = new URLSearchParams({
        countryCode: country.value.code_2,
        postalCode: code,
        city: cityValue,
        page: String(pagination.dataPage),
        limit: String(pagination.dataPageSize)
      });

      const response = await fetch(`/api/geo/location?${params}`);
      if (!response.ok) throw new Error('Failed to validate location');
      
      const data = await response.json();
      pagination.updateHasMore(data.total);

      return {
        isValid: data.results.length > 0,
        suggestions: data.results
      };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Validation failed',
        suggestions: []
      };
    }
  }, [country.value?.code_2, pagination]);

  // Postal code field
  const postalCode = useFormField<string>({
    initialValue: '',
    validate: async (value) => {
      if (!value || !country.value) return false;
      const result = await validateLocation(value, city.value);
      return result.isValid;
    }
  });

  // City field
  const city = useFormField<string>({
    initialValue: '',
    validate: async (value) => {
      if (!value || !country.value) return false;
      const result = await validateLocation(postalCode.value, value);
      return result.isValid;
    }
  });

  // Reset all form state
  const reset = useCallback(() => {
    country.reset();
    postalCode.reset();
    city.reset();
    pagination.reset();
  }, [country, postalCode, city, pagination]);

  const contextValue: LocationContextState = {
    country,
    postalCode,
    city,
    countrySelect,
    suggestions: [],
    validation: {
      isLoading: false,
      error: null
    },
    pagination,
    validateLocation,
    reset,
    getFlagPath
  };

  return (
    <LocationContext.Provider value={contextValue}>
      {children}
    </LocationContext.Provider>
  );
}

// Custom hook for accessing context
export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within LocationProvider');
  }
  return context;
}

// Exports
export { getFlagPath };
export type { LocationContextState, LocationProviderProps };