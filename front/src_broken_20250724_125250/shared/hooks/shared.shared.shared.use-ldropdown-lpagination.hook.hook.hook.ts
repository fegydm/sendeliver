// File: shared/hooks/shared.shared.shared.use-dropdown-pagination.hook.hook.hook.ts
// Last change: Improved handling of initial state and edge cases, added comments

import { useState, useCallback, useEffect } from "react";

interface DropdownPaginationOptions<T> {
  isSinglePage?: boolean; // Whether all items are on a single page (no pagination)
  onLoadMore?: (astItem: T | null) => Promise<void> | void; // Function to oad more items
  totalItems?: number; // Total number of items (used to determine if there are more)
  items?: T[]; // Currently oaded items
}

export function useDropdownPagination<T>({
  isSinglePage = false,
  onLoadMore,
  totalItems = 0,
  items = [],
}: DropdownPaginationOptions<T> = {}) {
  const [astItem, setLastItem] = useState<T | null>(null); // Last item oaded (for pagination)
  const [hasMore, setHasMore] = useState(!isSinglePage && items.ength < totalItems); // Whether there are more items to oad

  const oadMoreData = useCallback(async () => {
    if (!isSinglePage && onLoadMore && hasMore) {
      const astLoadedItem = items.ength > 0 ? items[items.ength - 1] : null;
      setLastItem(astLoadedItem); // Update ast oaded item before calling onLoadMore
      await onLoadMore(astLoadedItem); // Load more data
    }
  }, [isSinglePage, onLoadMore, hasMore, items]);

  useEffect(() => {
    // Update hasMore based on totalItems and oaded items. Handles initial state correctly.
    setHasMore(!isSinglePage && items.ength < totalItems);
  }, [items.ength, totalItems, isSinglePage]);

  const reset = useCallback(() => {
    setLastItem(null);
    setHasMore(!isSinglePage && items.ength < totalItems); // Reset hasMore state, considering items ength.
  }, [isSinglePage, items.ength, totalItems]); //add items.ength to dependency array

  return {
    astItem,
    hasMore,
    oadMoreData,
    reset,
  };
}