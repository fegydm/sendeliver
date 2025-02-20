// File: src/components/sections/content/search-forms/BaseDropdown.tsx
// Last change: Fixed TypeScript type issues with getItemKey and improved onNoResults handling

import React, { useRef, useCallback } from "react";
import { useUINavigation } from "@/hooks/useUINavigation";

export type DropdownVariant = "default" | "country" | "location";
export type DropdownPosition = "left" | "right" | "center";

interface BaseDropdownProps<T> {
  // Core functionality
  items: T[];
  isOpen: boolean;
  onSelect: (item: T, index: number) => void;
  renderItem: (item: T, meta: { isHighlighted: boolean }) => React.ReactNode;
  inputRef: React.RefObject<HTMLInputElement>;
  
  // Optional configuration
  variant?: DropdownVariant;
  position?: DropdownPosition;
  className?: string;
  
  // Pagination
  onLoadMore?: (lastItem: T | null) => void;
  totalItems?: number;
  pageSize?: number;
  loadMoreText?: string;
  
  // Empty state handling
  onNoResults?: () => React.ReactNode;
  
  // Accessibility
  ariaLabel?: string;

  // Optional key extraction function
  getItemKey?: (item: T) => string | number;
}

export function BaseDropdown<T>({
  items,
  isOpen,
  onSelect,
  renderItem,
  inputRef,
  variant = "default",
  position = "left",
  className = "",
  onLoadMore,
  totalItems = 0,
  pageSize = 10,
  loadMoreText = "Load more...",
  onNoResults,
  ariaLabel = "Dropdown options",
  getItemKey,
}: BaseDropdownProps<T>) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Default key generation if no custom function provided
  const defaultGetItemKey = useCallback((item: T, index: number): string | number => {
    // If getItemKey is provided, use it
    if (getItemKey) return getItemKey(item);
    
    // Otherwise fall back to index
    return index;
  }, [getItemKey]);

  // Navigation hook setup
  const { 
    highlightedIndex,
    handleKeyDown,
    handleItemMouseEnter,
    handleItemClick
  } = useUINavigation({
    items,
    isOpen,
    onSelect,
    inputRef,
    pageSize,
  });

  // Calculate if there are more items to load
  const hasMore = onLoadMore && items.length < totalItems;

  // Handle "Load More" click
  const handleLoadMore = useCallback(() => {
    if (onLoadMore) {
      const lastItem = items.length > 0 ? items[items.length - 1] : null;
      onLoadMore(lastItem);
    }
  }, [items, onLoadMore]);

  if (!isOpen) return null;

  // Construct className based on props
  const dropdownClassName = [
    'dd-list',
    `dd-${variant}`,
    `dd-pos-${position}`,
    className
  ].filter(Boolean).join(' ');

  // Determine if there are no real results; if there's one placeholder item (empty fields), consider it as no results
  const isNoResults = items.length === 0 || (items.length === 1 && typeof items[0] === "object" && !(items[0] as any).psc && !(items[0] as any).city && !(items[0] as any).cc);

  return (
    <div 
      ref={dropdownRef}
      className={dropdownClassName}
      role="listbox"
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel}
      tabIndex={-1}
    >
      {isNoResults ? (
        <div className="no-results" role="option">
          {onNoResults ? onNoResults() : "No results found"}
        </div>
      ) : (
        <>
          {items.map((item, index) => (
            <div
              key={defaultGetItemKey(item, index)}
              id={`dd-item-${index}`}
              onClick={() => handleItemClick(index)}
              onMouseEnter={() => handleItemMouseEnter(index)}
              className={`dd-item ${index === highlightedIndex ? "dd-highlighted" : ""}`}
              role="option"
              tabIndex={-1}
            >
              {renderItem(item, {
                isHighlighted: index === highlightedIndex
              })}
            </div>
          ))}

          {hasMore && (
            <div
              onClick={handleLoadMore}
              className="dd-load-more"
              role="option"
              aria-label={loadMoreText}
              tabIndex={-1}
            >
              {loadMoreText}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default BaseDropdown;
