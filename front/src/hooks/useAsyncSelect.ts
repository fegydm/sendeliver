// File: src/hooks/useAsyncSelect.ts
// Last change: Added strict typing and fixed query parameter type

import { useState, useCallback } from 'react';

export interface UseAsyncSelectProps<T> {
  fetchItems: (query: string) => Promise<T[]>;
  onSelect?: (item: T) => void;
  debounceMs?: number;
  minQueryLength?: number;
}

export interface UseAsyncSelectResult<T> {
  items: T[];
  isLoading: boolean;
  error: string | null;
  search: (query: string) => Promise<void>;
  select: (item: T) => void;
}

export function useAsyncSelect<T>({
  fetchItems,
  onSelect,
  minQueryLength = 2
}: UseAsyncSelectProps<T>): UseAsyncSelectResult<T> {
  // State management
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search handler
  const search = useCallback(async (query: string): Promise<void> => {
    if (query.length < minQueryLength) {
      setItems([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const results = await fetchItems(query);
      setItems(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchItems, minQueryLength]);

  // Selection handler
  const select = useCallback((item: T): void => {
    onSelect?.(item);
    setItems([]);
  }, [onSelect]);

  return {
    items,
    isLoading,
    error,
    search,
    select
  };
}