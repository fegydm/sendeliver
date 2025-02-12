// File: src/components/sections/content/search-forms/BaseDropdown.tsx
// Last change: Improved accessibility, performance, and code structure

import React, { useRef, useEffect, useCallback } from "react";
import { useUINavigation } from "@/hooks/useUINavigation";
import { useDropdownPagination } from "@/hooks/useDropdownPagination";

export type DropdownType = "country" | "location";
export type LocationType = "pickup" | "delivery";

interface BaseDropdownProps<T> {
  items: T[];
  isOpen: boolean;
  onSelect: (item: T, index: number) => void;
  onClose: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
  onLoadMore?: (lastItem: T | null) => void;
  renderItem: (item: T, meta: { isHighlighted: boolean; isSelected: boolean }) => React.ReactNode;
  dropdownType: DropdownType;
  locationType: LocationType;
  getItemKey?: (item: T, index: number) => string | number;
  selectedItem?: T | null;
  loadMoreText?: string;
  totalItems?: number;
  pageSize?: number;
  onNoResults?: () => React.ReactNode;
  ariaLabel?: string; // Added aria-label for accessibility
}

export function BaseDropdown<T>({
  items,
  isOpen,
  onSelect,
  onClose,
  inputRef,
  onLoadMore,
  renderItem,
  dropdownType,
  locationType,
  getItemKey = (_: T, index: number) => index,
  selectedItem,
  loadMoreText = "Load more...",
  totalItems = 0,
  pageSize = 10,
  onNoResults,
  ariaLabel = "Dropdown Options", // Default aria-label
}: BaseDropdownProps<T>) {
  const dropdownRef = useRef<HTMLUListElement>(null);

  const { highlightedIndex, handleKeyDown } = useUINavigation({
    items,
    isOpen,
    onSelect,
    inputRef,
    pageSize,
  });

  const { hasMore, loadMoreData } = useDropdownPagination({
    totalItems,
    items,
    onLoadMore,
  });

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node) &&
      !inputRef?.current?.contains(event.target as Node)
    ) {
      onClose();
    }
  }, [onClose, inputRef]); // useCallback for performance

  useEffect(() => {
    if (!isOpen) return;

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, handleClickOutside]); // Use useCallback function

  const handleItemClick = useCallback((item: T, index: number) => {
    onSelect(item, index);
    onClose(); // Close dropdown after selection for better UX
  }, [onSelect, onClose]);

  if (!isOpen) return null;

  return (
    <ul
      ref={dropdownRef}
      className={`dd-list dd-list-${locationType}-${dropdownType}`}
      role="listbox"
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel} // Added aria-label to the list
    >
      {items.length === 0 && onNoResults ? (
        <li className="item-suggestion no-results" role="option">
          {onNoResults()}
        </li>
      ) : (
        items.map((item, index) => (
          <li
            key={getItemKey(item, index)}
            id={`item-${index}`}
            onClick={() => handleItemClick(item, index)} // Use memoized callback
            className={`item-suggestion ${index === highlightedIndex ? "highlighted" : ""}`}
            role="option"
            aria-selected={selectedItem === item}
            tabIndex={index === highlightedIndex ? 0 : -1}
          >
            {renderItem(item, {
              isHighlighted: index === highlightedIndex,
              isSelected: selectedItem === item,
            })}
          </li>
        ))
      )}

      {hasMore && (
        <li
          onClick={loadMoreData}
          className={`dd-load-more ${highlightedIndex === items.length ? "highlighted" : ""}`}
          role="option"
          aria-label={loadMoreText}
          tabIndex={highlightedIndex === items.length ? 0 : -1}
        >
          {loadMoreText}
        </li>
      )}
    </ul>
  );
}