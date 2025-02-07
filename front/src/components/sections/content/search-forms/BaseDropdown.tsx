// File: src/components/sections/content/search-forms/BaseDropdown.tsx
// Last change: Centralized useUINavigation inside BaseDropdown

import React, { useRef, useEffect } from "react";
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
  pageSize = 10, // Now receives pageSize dynamically
}: BaseDropdownProps<T>) {
  const dropdownRef = useRef<HTMLUListElement>(null);

  // Centralized useUINavigation here
  const { highlightedIndex, handleKeyDown } = useUINavigation({
    items,
    isOpen,
    onSelect,
    inputRef,
    pageSize, // Receives page size from the parent
  });

  const { hasMore, loadMoreData } = useDropdownPagination({
    totalItems,
    items,
    onLoadMore,
  });

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef?.current?.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose, inputRef]);

  if (!isOpen) return null;

  return (
    <ul ref={dropdownRef} className={`dd-list dd-list-${locationType}-${dropdownType}`} role="listbox" onKeyDown={handleKeyDown}>
      {items.length === 0 ? (
        <li className="item-suggestion no-results">No results found</li>
      ) : (
        items.map((item, index) => (
          <li
            key={getItemKey(item, index)}
            id={`item-${index}`}
            onClick={() => onSelect(item, index)}
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
