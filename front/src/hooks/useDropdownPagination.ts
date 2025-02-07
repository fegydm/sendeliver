// File: src/hooks/useDropdownPagination.ts
// Last change: Removed pagination constants and made fully generic

import { useState, useCallback, useEffect } from "react";

interface DropdownPaginationOptions<T> {
  isSinglePage?: boolean;
  onLoadMore?: (lastItem: T | null) => Promise<void> | void;
  totalItems?: number;
  items?: T[];
}

export function useDropdownPagination<T>({
  isSinglePage = false,
  onLoadMore,
  totalItems = 0,
  items = [],
}: DropdownPaginationOptions<T> = {}) {
  const [lastItem, setLastItem] = useState<T | null>(null);
  const [hasMore, setHasMore] = useState(!isSinglePage);

  const loadMoreData = useCallback(async () => {
    if (!isSinglePage && onLoadMore && hasMore) {
      const lastLoadedItem = items.length > 0 ? items[items.length - 1] : null;
      setLastItem(lastLoadedItem);
      await onLoadMore(lastLoadedItem);
    }
  }, [isSinglePage, onLoadMore, hasMore, items]);

  useEffect(() => {
    setHasMore(items.length < totalItems);
  }, [items.length, totalItems, isSinglePage]);

  const reset = useCallback(() => {
    setLastItem(null);
    setHasMore(!isSinglePage);
  }, [isSinglePage]);

  return {
    lastItem,
    hasMore,
    loadMoreData,
    reset,
  };
}
