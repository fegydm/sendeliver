// File: src/components/sections/content/search-forms/LocationContext.tsx
// Last change: Updated to use silent updates for better performance and added logs, with API hasMore flag

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
  loadMore: () => Promise<void>;
  apiHasMore: boolean; // Added flag to indicate if more items are available
}

interface LocationProviderProps {
  children: ReactNode;
}

const LocationContext = createContext<LocationContextState | undefined>(undefined);

export function LocationProvider({ children }: LocationProviderProps) {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiHasMore, setApiHasMore] = useState(false);

  // Postal code field without automatic validation
  const postalCode = useFormField<string>({
    initialValue: '',
    transform: (value) => value.trim()
  });

  // City field without automatic validation
  const city = useFormField<string>({
    initialValue: '',
    transform: (value) => value.trim()
  });

  // Country field - no initial validation, only updates when needed
  const country = useFormField<Country | null>({
    initialValue: null,
    transform: (value) => value,
    onChange: (newCountry) => {
      console.log("[LocationContext] Country changed:", newCountry);
      // If there are active filters, revalidate with the new country
      if (postalCode.value || city.value) {
        console.log("[LocationContext] Revalidating due to country change.");
        validateLocation(postalCode.value, city.value);
      }
    }
  });

  // Async select for countries list
  const countrySelect = useAsyncSelect<Country>({
    fetchItems: async (query: string) => {
      console.log("[LocationContext] Fetching countries with query:", query);
      const response = await fetch(`/api/geo/countries?q=${query}`);
      if (!response.ok) {
        console.error("[LocationContext] Failed to fetch countries");
        throw new Error('Failed to fetch countries');
      }
      const countries = await response.json();
      console.log("[LocationContext] Countries fetched:", countries);
      return countries;
    },
    minQueryLength: 1
  });

  // Main validation function - fetches locations based on current filters
  const validateLocation = useCallback(async (code: string, cityValue: string) => {
    console.log("[LocationContext] validateLocation called with:", { code, cityValue });
    // Clear suggestions if no filters are provided
    if (!code && !cityValue) {
      console.log("[LocationContext] No filters provided, clearing suggestions.");
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Build query parameters
      const params = new URLSearchParams({
        countryCode: country.value?.code_2 || '',
        postalCode: code,
        offset: '0',
        limit: '20'
      });

      if (cityValue) {
        params.append('city', cityValue);
      }

      console.log("[LocationContext] Fetching locations with params:", params.toString());
      
      // Execute the query
      const response = await fetch(`/api/geo/location?${params.toString()}`);
      if (!response.ok) {
        console.error("[LocationContext] Failed to validate location, response not ok.");
        throw new Error('Failed to validate location');
      }
      
      const data = await response.json();
      console.log("[LocationContext] API Response:", data);
      
      // Check if API response contains "results"
      if (data.results && Array.isArray(data.results)) {
        setSuggestions(data.results);
        console.log("[LocationContext] Suggestions updated:", data.results);
      } else {
        console.warn("[LocationContext] Unexpected API response format:", data);
        setSuggestions([]);
      }
      // Update API flag indicating if more items are available
      setApiHasMore(!!data.hasMore);
    } catch (error) {
      console.error("[LocationContext] Error in validateLocation:", error);
      setSuggestions([]);
      setError(error instanceof Error ? error.message : 'Failed to validate location');
      setApiHasMore(false);
    } finally {
      setIsLoading(false);
      console.log("[LocationContext] validateLocation completed. isLoading set to false.");
    }
  }, [country.value?.code_2, postalCode.value, city.value]);

  // Load more results with pagination
  const loadMore = useCallback(async () => {
    console.log("[LocationContext] loadMore called.");
    // Return if no active filters or incomplete page
    if (!postalCode.value && !city.value) {
      console.log("[LocationContext] No filters provided, not loading more.");
      return;
    }
    if (suggestions.length > 0 && suggestions.length % 20 !== 0) {
      console.log("[LocationContext] Current suggestions do not form a complete page, not loading more.");
      return;
    }

    const offset = suggestions.length.toString();
    
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        countryCode: country.value?.code_2 || '',
        postalCode: postalCode.value,
        offset,
        limit: '20'
      });

      if (city.value) {
        params.append('city', city.value);
      }

      console.log("[LocationContext] Loading more locations with params:", params.toString());
      
      const response = await fetch(`/api/geo/location?${params.toString()}`);
      if (!response.ok) {
        console.error("[LocationContext] Failed to load more locations, response not ok.");
        throw new Error('Failed to load more locations');
      }
      
      const data = await response.json();
      console.log("[LocationContext] Load more API response:", data);
      
      setSuggestions(prev => [...prev, ...(data.results || [])]);
      // Update API flag after loading more results
      setApiHasMore(!!data.hasMore);
      console.log("[LocationContext] Suggestions updated after loadMore:", suggestions);
    } catch (error) {
      console.error("[LocationContext] Error in loadMore:", error);
      setError(error instanceof Error ? error.message : 'Failed to load more locations');
    } finally {
      setIsLoading(false);
      console.log("[LocationContext] loadMore completed. isLoading set to false.");
    }
  }, [country.value?.code_2, postalCode.value, city.value, suggestions.length]);

  // Reset all fields and state
  const reset = useCallback(() => {
    console.log("[LocationContext] Reset called.");
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
      reset,
      loadMore,
      apiHasMore
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
