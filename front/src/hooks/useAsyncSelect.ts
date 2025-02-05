// File: src/hooks/useAsyncSelect.ts
// Last change: Allowed empty query for initial search, maintained minQueryLength for selection

import { useState, useCallback } from 'react';

export interface UseAsyncSelectProps<T> {
  fetchItems: (query: string) => Promise<T[]>; // Function to fetch items based on query
  onSelect?: (item: T) => void; // Callback when an item is selected
  minQueryLength?: number; // Minimum characters required for selection
}

export interface UseAsyncSelectResult<T> {
  items: T[]; // List of available items
  isLoading: boolean; // Indicates if items are being fetched
  error: string | null; // Error message if fetching fails
  search: (query: string) => Promise<void>; // Function to perform search
  select: (item: T) => void; // Function to select an item
}

export function useAsyncSelect<T>({
  fetchItems,
  onSelect,
  minQueryLength = 2
}: UseAsyncSelectProps<T>): UseAsyncSelectResult<T> {
  // State for items, loading state, and errors
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch and update items based on query
  const search = useCallback(async (query: string): Promise<void> => {
    if (query.length < minQueryLength && query.length > 0) {
      setItems([]); // If query is too short (but not empty), reset items
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const results = await fetchItems(query); // Fetch items with given query
      setItems(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchItems, minQueryLength]);

  // Function to handle item selection
  const select = useCallback((item: T): void => {
    onSelect?.(item);
    setItems([]); // Clear items after selection
  }, [onSelect]);

  return {
    items,
    isLoading,
    error,
    search,
    select
  };
}
