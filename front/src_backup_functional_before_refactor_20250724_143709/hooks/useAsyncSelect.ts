import { useState, useCallback, useRef } from 'react';

export interface UseAsyncSelectProps<T> {
  fetchItems: (query: string, options?: { signal?: AbortSignal }) => Promise<T[]>; // Pass signal for cancellation
  onSelect?: (item: T) => void;
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
  minQueryLength = 1 // minimal length if needed
}: UseAsyncSelectProps<T>): UseAsyncSelectResult<T> {
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimeout = useRef<number | undefined>(undefined);
  const abortControllerRef = useRef<AbortController | null>(null);

  const search = useCallback(async (query: string): Promise<void> => {
    // Clear any pending debounce timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    // Very short debounce delay (50 ms) for immediate cancellation
    debounceTimeout.current = window.setTimeout(async () => {
      if (query.length < minQueryLength && query.length > 0) {
        setItems([]);
        return;
      }
      
      setIsLoading(true);
      setError(null);

      // Abort previous request if any
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      
      try {
        const results = await fetchItems(query, { signal: abortControllerRef.current.signal });
        setItems(results);
      } catch (err) {
        if (!(err instanceof DOMException && err.name === 'AbortError')) {
          setError(err instanceof Error ? err.message : 'Unknown error occurred');
          setItems([]);
        }
      } finally {
        setIsLoading(false);
      }
    }, 50); // 50ms delay
  }, [fetchItems, minQueryLength]);

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
