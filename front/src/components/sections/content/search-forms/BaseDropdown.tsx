// File: src/components/sections/content/search-forms/BaseDropdown.tsx
// Last change: Made component more generic while preserving specific functionality

import React, { useRef, useEffect, useCallback } from "react";
import { useUINavigation } from "@/hooks/useUINavigation";
import { useDropdownPagination } from "@/hooks/useDropdownPagination";

// Generic dropdown types for reusability across the app
export type DropdownVariant = "default" | "country" | "location" | "menu";
export type DropdownSize = "sm" | "md" | "lg";
export type DropdownPosition = "left" | "right" | "center";
export type LocationType = "pickup" | "delivery";  // Specific to location dropdowns

// Base props that any dropdown will need
interface BaseDropdownProps<T> {
  // Core functionality
  items: T[];
  isOpen: boolean;
  onSelect: (item: T, index: number) => void;
  onClose: () => void;
  renderItem: (item: T, meta: { isHighlighted: boolean; isSelected: boolean }) => React.ReactNode;
  inputRef: React.RefObject<HTMLInputElement>;
  
  // Item identification and state
  getItemKey?: (item: T, index: number) => string | number;
  selectedItem?: T | null;
  
  // Styling and layout
  variant?: DropdownVariant;
  size?: DropdownSize;
  position?: DropdownPosition;
  className?: string;
  maxHeight?: number;
  
  // Pagination
  onLoadMore?: (lastItem: T | null) => void;
  loadMoreText?: string;
  totalItems?: number;
  pageSize?: number;
  
  // Empty state
  onNoResults?: () => React.ReactNode;
  noResultsText?: string;
  
  // Accessibility
  ariaLabel?: string;
  
  // Navigation
  onNextFieldFocus?: () => void;
  
  // Location-specific (optional)
  locationType?: LocationType;
}

export function BaseDropdown<T>({
  // Destructure with defaults
  items,
  isOpen,
  onSelect,
  onClose,
  renderItem,
  inputRef,
  getItemKey = (_: T, index: number) => index,
  selectedItem,
  variant = "default",
  size = "md",
  position = "left",
  className = "",
  maxHeight,
  onLoadMore,
  loadMoreText = "Load more...",
  totalItems = 0,
  pageSize = 10,
  onNoResults,
  noResultsText = "No results found",
  ariaLabel = "Dropdown options",
  onNextFieldFocus,
  locationType,
}: BaseDropdownProps<T>) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Navigation hook setup
  const { 
    highlightedIndex, 
    handleKeyDown: originalHandleKeyDown, 
    handleItemMouseEnter,
    handleItemClick
  } = useUINavigation({
    items,
    isOpen,
    onSelect: (item, index) => {
      onSelect(item, index);
      onClose();
      onNextFieldFocus?.();
    },
    inputRef,
    pageSize,
  });

  // Keyboard navigation handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      onNextFieldFocus?.();
      return;
    }
    originalHandleKeyDown(e);
  }, [originalHandleKeyDown, onNextFieldFocus]);

  // Pagination setup
  const { hasMore, loadMoreData } = useDropdownPagination({
    totalItems,
    items,
    onLoadMore,
  });

  // Click outside handler
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node) &&
      !inputRef.current?.contains(event.target as Node)
    ) {
      onClose();
    }
  }, [onClose, inputRef]);

  // Click outside effect
  useEffect(() => {
    if (!isOpen) return;
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, handleClickOutside]);

  if (!isOpen) return null;

  // Construct className based on props
  const dropdownClassName = [
    'dd-list',
    `dd-${variant}`,
    `dd-size-${size}`,
    `dd-pos-${position}`,
    locationType && `dd-${locationType}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      ref={dropdownRef}
      className={dropdownClassName}
      role="listbox"
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel}
      tabIndex={-1}
      style={maxHeight ? { maxHeight: `${maxHeight}px` } : undefined}
    >
      {items.length === 0 ? (
        <div className="dd-no-results" role="option">
          {onNoResults ? onNoResults() : noResultsText}
        </div>
      ) : (
        <>
          {items.map((item, index) => (
            <div
              key={getItemKey(item, index)}
              id={`dd-item-${index}`}
              onClick={() => {
                handleItemClick(index);
                onNextFieldFocus?.();
              }}
              onMouseEnter={() => handleItemMouseEnter(index)}
              className={`dd-item ${index === highlightedIndex ? "dd-highlighted" : ""}`}
              role="option"
              aria-selected={selectedItem === item}
              tabIndex={-1}
            >
              {renderItem(item, {
                isHighlighted: index === highlightedIndex,
                isSelected: selectedItem === item,
              })}
            </div>
          ))}

          {hasMore && (
            <div
              onClick={loadMoreData}
              className={`dd-load-more ${highlightedIndex === items.length ? "dd-highlighted" : ""}`}
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