// File: src/hooks/useDropdownPagination.ts
import { useState, useCallback, useEffect } from 'react';

interface DropdownPaginationOptions {
  isSinglePage?: boolean;
  dataPageSize?: number;
  onLoadMore?: () => Promise<void> | void; // Callback can be async or sync
  totalItems?: number;
}

export function useDropdownPagination({
  isSinglePage = false,
  dataPageSize = 20,
  onLoadMore,
  totalItems = 0,
}: DropdownPaginationOptions = {}) {
  // Holds current page number
  const [dataPage, setDataPage] = useState(1);
  // Indicates if there are more items to load
  const [hasMore, setHasMore] = useState(!isSinglePage);

  // Function to load more data (async version)
  const loadMoreData = useCallback(async () => {
    // Only load more if not in single page mode, onLoadMore exists and there are more items
    if (!isSinglePage && onLoadMore && hasMore) {
      await onLoadMore();
      setDataPage((prev) => prev + 1);
    }
  }, [isSinglePage, onLoadMore, hasMore]);

  // Update hasMore whenever current page, page size or total items will change
  useEffect(() => {
    if (!isSinglePage) {
      const currentItems = dataPage * dataPageSize;
      setHasMore(currentItems < totalItems);
    }
  }, [dataPage, dataPageSize, totalItems, isSinglePage]);

  // Reset pagination to initial state
  const reset = useCallback(() => {
    setDataPage(1);
    setHasMore(!isSinglePage);
  }, [isSinglePage]);

  return {
    dataPage,
    hasMore,
    loadMoreData,
    reset,
  };
}
