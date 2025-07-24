// File: src/shared/hooks/shared.use-ldropdown-lpagination.hook.ts
// Last change: Improved handling of initial state and edge cases, added comments

import { useState, useCallback, useEffect } from "react";

interface DropdownPaginationOptions<T> {
  isSinglePage?: boolean; // Whether all items are on a single page (no pagination)
  onLoadMore?: (lastItem: T | null) => Promise<void> | void; // Function to load more items
  totalItems?: number; // Total number of items (used to determine if there are more)
  items?: T[]; // Currently loaded items
}

export function useDropdownPagination<T>({
  isSinglePage = false,
  onLoadMore,
  totalItems = 0,
  items = [],
}: DropdownPaginationOptions<T> = {}) {
  const [lastItem, setLastItem] = useState<T | null>(null); // Last item loaded (for pagination)
  const [hasMore, setHasMore] = useState(!isSinglePage && items.length < totalItems); // Whether there are more items to load

  const loadMoreData = useCallback(async () => {
    if (!isSinglePage && onLoadMore && hasMore) {
      const lastLoadedItem = items.length > 0 ? items[items.length - 1] : null;
      setLastItem(lastLoadedItem); // Update last loaded item before calling onLoadMore
      await onLoadMore(lastLoadedItem); // Load more data
    }
  }, [isSinglePage, onLoadMore, hasMore, items]);

  useEffect(() => {
    // Update hasMore based on totalItems and loaded items. Handles initial state correctly.
    setHasMore(!isSinglePage && items.length < totalItems);
  }, [items.length, totalItems, isSinglePage]);

  const reset = useCallback(() => {
    setLastItem(null);
    setHasMore(!isSinglePage && items.length < totalItems); // Reset hasMore state, considering items length.
  }, [isSinglePage, items.length, totalItems]); //add items.length to dependency array

  return {
    lastItem,
    hasMore,
    loadMoreData,
    reset,
  };
}