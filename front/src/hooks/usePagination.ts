// File: src/hooks/usePagination.ts
// Last change: Simplified pagination hook with data and UI pagination support

import { useState, useCallback } from 'react';

// Configuration for both pagination types
interface PaginationConfig {
  dataPageSize?: number;    // Items per API request
  uiPageSize?: number;      // Items per UI view
}

export function usePagination({ 
  dataPageSize = 20,
  uiPageSize = 8
}: PaginationConfig = {}) {
  // State management
  const [dataPage, setDataPage] = useState(1);
  const [uiPage, setUiPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Core pagination actions
  const loadMore = useCallback(() => {
    setDataPage(prev => prev + 1);
  }, []);

  const showMore = useCallback(() => {
    setUiPage(prev => prev + 1);
  }, []);

  const getVisibleCount = useCallback(() => {
    return uiPage * uiPageSize;
  }, [uiPage, uiPageSize]);

  // Utility functions
  const reset = useCallback(() => {
    setDataPage(1);
    setUiPage(1);
    setHasMore(true);
  }, []);

  const updateHasMore = useCallback((totalItems: number) => {
    setHasMore(dataPage * dataPageSize < totalItems);
  }, [dataPage, dataPageSize]);

  return {
    // Data pagination
    dataPage,
    dataPageSize,
    hasMore,
    loadMore,
    updateHasMore,

    // UI pagination
    uiPage,
    uiPageSize,
    getVisibleCount,
    showMore,

    // Utils
    reset
  };
}