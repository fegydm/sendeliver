import React, { useRef, useCallback, useEffect, forwardRef } from "react";
import { useUINavigation } from "@/hooks/useUINavigation";

export type DropdownVariant = "default" | "country" | "location";
export type DropdownPosition = "left" | "right" | "center";

interface BaseDropdownProps<T> {
  items: T[];
  isOpen: boolean;
  onSelect: (item: T, index: number) => void;
  renderItem: (item: T, meta: { isHighlighted: boolean }) => React.ReactNode;
  inputRef: React.RefObject<HTMLInputElement>;
  variant?: DropdownVariant;
  position?: DropdownPosition;
  className?: string;
  onLoadMore?: (lastItem: T | null) => void;
  totalItems?: number;
  pageSize?: number;
  loadMoreText?: string;
  onNoResults?: () => React.ReactNode;
  ariaLabel?: string;
  getItemKey?: (item: T) => string | number;
}

export const BaseDropdown = forwardRef<HTMLDivElement, BaseDropdownProps<any>>(
  <T,>({
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
  }: BaseDropdownProps<T>, ref: React.Ref<HTMLDivElement>) => {
    const internalDropdownRef = useRef<HTMLDivElement>(null);
    const dropdownRef = (ref as React.RefObject<HTMLDivElement>) || internalDropdownRef;
    const defaultGetItemKey = useCallback((item: T, index: number) => getItemKey ? getItemKey(item) : index, [getItemKey]);
    const { highlightedIndex, setHighlightedIndex, handleKeyDown, handleItemMouseEnter, handleItemClick, itemsRef } = useUINavigation({
      items,
      isOpen,
      onSelect,
      inputRef,
      pageSize,
    });

    const hasMore = onLoadMore && items.length < totalItems;
    const handleLoadMore = useCallback(() => {
      if (onLoadMore) {
        // Just trigger the load more action
        // The focus will be handled by the useEffect that watches items.length
        onLoadMore(items.length > 0 ? items[items.length - 1] : null);
      }
    }, [items, onLoadMore]);
    
    // Listen for loadMore custom event
    useEffect(() => {
      const handleLoadMoreEvent = () => {
        handleLoadMore();
      };
      
      document.addEventListener('loadMore', handleLoadMoreEvent);
      return () => {
        document.removeEventListener('loadMore', handleLoadMoreEvent);
      };
    }, [handleLoadMore]);
    
    // Track the previous items length to identify new items
    const prevItemsLengthRef = useRef(items.length);
    
    // Effect to track changes in items array and focus on the first new item
    useEffect(() => {
      const prevLength = prevItemsLengthRef.current;
      const currentLength = items.length;
      
      // If items were added
      if (currentLength > prevLength && prevLength > 0) {
        // Focus on the first new item (at prevLength index)
        setHighlightedIndex(prevLength);
        if (itemsRef.current[prevLength]) {
          itemsRef.current[prevLength].focus();
        }
      }
      
      // Update the reference
      prevItemsLengthRef.current = currentLength;
    }, [items.length, setHighlightedIndex]);
    const dropdownClassName = `dropdown ${className}`;
    const isNoResults = items.length === 0 || (items.length === 1 && typeof items[0] === "object" && !(items[0] as any).psc && !(items[0] as any).city && !(items[0] as any).cc);

    // Handle focus event on the dropdown container
    const handleDropdownFocus = useCallback(() => {
      if (items.length > 0 && highlightedIndex === null) {
        // Automatically highlight the first item when dropdown receives focus
        setHighlightedIndex(0);
        
        // Ensure the first item gets focus
        if (itemsRef.current[0]) {
          itemsRef.current[0].focus();
        }
      }
    }, [items, highlightedIndex, setHighlightedIndex, itemsRef]);

    useEffect(() => {
      if (isOpen && itemsRef.current[0] && document.activeElement === dropdownRef.current) {
        // When dropdown opens and has focus, automatically highlight first item
        setHighlightedIndex(0);
        itemsRef.current[0].focus();
      } else if (isOpen && highlightedIndex !== null && itemsRef.current[highlightedIndex]) {
        itemsRef.current[highlightedIndex].focus();
      }
    }, [isOpen, highlightedIndex, setHighlightedIndex]);

    if (!isOpen) return null;

    return (
      <div 
        ref={dropdownRef} 
        className={dropdownClassName} 
        role="listbox" 
        onKeyDown={handleKeyDown} 
        onFocus={handleDropdownFocus}
        aria-label={ariaLabel} 
        tabIndex={0}
      >
        {isNoResults ? (
          <div className="dropdown__no-results" role="option">{onNoResults ? onNoResults() : "No results found"}</div>
        ) : (
          <>
            {items.map((item, index) => (
              <div
                key={defaultGetItemKey(item, index)}
                id={`dropdown-item-${index}`}
                ref={(el) => itemsRef.current[index] = el!}
                onClick={() => handleItemClick(index)}
                onMouseEnter={() => handleItemMouseEnter(index)}
                className={`dropdown__item ${index === highlightedIndex ? "dropdown--highlighted" : ""}`}
                role="option"
                tabIndex={-1}
              >
                {renderItem(item, { isHighlighted: index === highlightedIndex })}
              </div>
            ))}
            {hasMore && (
              <div 
                onClick={handleLoadMore} 
                className={`dropdown__load-more ${highlightedIndex === items.length ? "dropdown--highlighted" : ""}`}
                role="option" 
                aria-label={loadMoreText} 
                tabIndex={-1}
                ref={(el) => el && (itemsRef.current[items.length] = el)}
              >
                {loadMoreText}
              </div>
            )}
          </>
        )}
      </div>
    );
  }
);

export default BaseDropdown;