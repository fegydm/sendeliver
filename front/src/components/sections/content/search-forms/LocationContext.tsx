// File: src/components/sections/content/search-forms/LocationContext.tsx
// Last change: Refactored validateLocation to omit empty city parameter; removed unused variable warnings and added minimal debugging logs

import { createContext, useContext, useCallback, ReactNode, useState } from 'react';
import { useFormField } from '@/hooks/useFormField';
import { useAsyncSelect } from '@/hooks/useAsyncSelect';
import type { Country, LocationSuggestion } from '@/types/location.types';

interface LocationContextState {
  country: ReturnType<typeof useFormField<Country | null>>;
  postalCode: ReturnType<typeof useFormField<string>>;
  city: ReturnType<typeof useFormField<string>>;
  countrySelect: ReturnType<typeof useAsyncSelect<Country>>;
  suggestions: LocationSuggestion[];
  isLoading: boolean;
  error: string | null;
  validateLocation: (code: string, city: string) => Promise<void>;
  reset: () => void;
}

interface LocationProviderProps {
  children: ReactNode;
}

const LocationContext = createContext<LocationContextState | undefined>(undefined);

export function LocationProvider({ children }: LocationProviderProps) {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Country field validation - renamed unused parameter to _value to avoid warnings
  const country = useFormField<Country | null>({
    initialValue: null,
    validate: async (_value) => true,
    onChange: () => {
      postalCode.reset();
      city.reset();
    }
  });

  const countrySelect = useAsyncSelect<Country>({
    fetchItems: async (query: string) => {
      const response = await fetch(`/api/geo/countries?q=${query}`);
      if (!response.ok) throw new Error('Failed to fetch countries');
      return response.json();
    },
    minQueryLength: 1
  });

  const validateLocation = useCallback(async (code: string, cityValue: string) => {
    if (!code) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        countryCode: country.value?.code_2 || '',
        postalCode: code,
        page: '1',
        limit: '20'
      });
      if (cityValue) {
        params.append('city', cityValue);
      }

      const response = await fetch(`/api/geo/location?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to validate location');

      const data = await response.json();
      // Log API response for debugging
      console.log('API Response:', data);
      setSuggestions(data.results || []);
      // Log updated suggestions for debugging
      console.log('Updated suggestions:', data.results);
    } catch (error) {
      setSuggestions([]);
      setError(error instanceof Error ? error.message : 'Failed to validate location');
    } finally {
      setIsLoading(false);
    }
  }, [country.value?.code_2]);

  const postalCode = useFormField<string>({
    initialValue: '',
    validate: async (value) => {
      await validateLocation(value, city.value);
      return true;
    }
  });

  const city = useFormField<string>({
    initialValue: '',
    validate: async (value) => {
      await validateLocation(postalCode.value, value);
      return true;
    }
  });

  const reset = useCallback(() => {
    country.reset();
    postalCode.reset();
    city.reset();
    setSuggestions([]);
    setError(null);
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
      reset
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

export type { LocationContextState, LocationProviderProps };
