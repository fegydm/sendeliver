// File: src/hooks/useDropdownNavigation.ts
// Last change: Set maxVisibleItems to 10 for UI pagination; load more appears only when applicable

import { useState, RefObject, useCallback, useRef, useEffect } from 'react';

// Core options for dropdown navigation
interface DropdownNavigationOptions<T> {
  items: T[];                                      // Items to display
  isOpen: boolean;                                // Dropdown open state
  onSelect: (item: T, index: number) => void;      // Item selection handler
  inputRef?: RefObject<HTMLInputElement>;          // Reference to input element
  hasMore?: boolean;                               // Whether more items can be loaded
  onLoadMore?: () => void;                         // Load more items handler
}

export function useDropdownNavigation<T>({
  items,
  isOpen,
  onSelect,
  inputRef,
  hasMore = false,
  onLoadMore
}: DropdownNavigationOptions<T>) {
  // State management for highlighted index and input focus
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [isInputFocused, setIsInputFocused] = useState(true);

  // Set maximum number of visible items in the dropdown UI to 10
  const maxVisibleItems = 10;
  // Calculate total items for navigation: limit to maxVisibleItems and add one extra for "Load more" if applicable
  const totalItems = Math.min(items.length, maxVisibleItems) + (hasMore ? 1 : 0);

  // Reference to each dropdown item element
  const itemsRef = useRef<HTMLElement[]>([]);

  // Log key states for debugging
  console.log('Dropdown Navigation: Render', {
    isOpen,
    totalItems,
    highlightedIndex,
    isInputFocused
  });

  // Reset highlighted index and input focus when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setHighlightedIndex(null);
      setIsInputFocused(true);
    }
  }, [isOpen]);

  // Ensure highlightedIndex is within the allowed range when items change
  useEffect(() => {
    if (highlightedIndex !== null && highlightedIndex >= totalItems) {
      console.log('Dropdown Navigation: Resetting out-of-bounds index');
      setHighlightedIndex(null);
    }
  }, [items, totalItems, highlightedIndex]);

  // Handle keyboard navigation events
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        setIsInputFocused(false);
        setHighlightedIndex(prev => {
          if (prev === null) return 0;
          return prev < totalItems - 1 ? prev + 1 : prev;
        });
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        if (highlightedIndex === null || highlightedIndex === 0) {
          console.log('Dropdown Navigation: Moving focus back to input');
          setIsInputFocused(true);
          setHighlightedIndex(null);
          inputRef?.current?.focus();
        } else {
          setHighlightedIndex(prev => (prev !== null ? prev - 1 : null));
        }
        break;
      }
      case 'Enter': {
        event.preventDefault();
        if (highlightedIndex !== null && !isInputFocused) {
          if (hasMore && highlightedIndex === Math.min(items.length, maxVisibleItems)) {
            console.log('Dropdown Navigation: Loading more items');
            onLoadMore?.();
          } else if (highlightedIndex < Math.min(items.length, maxVisibleItems)) {
            console.log('Dropdown Navigation: Selecting item', items[highlightedIndex]);
            onSelect(items[highlightedIndex], highlightedIndex);
          }
        }
        break;
      }
      case 'Escape': {
        event.preventDefault();
        console.log('Dropdown Navigation: Escape pressed, closing dropdown');
        setHighlightedIndex(null);
        setIsInputFocused(true);
        inputRef?.current?.focus();
        break;
      }
      default:
        console.log('Dropdown Navigation: Unhandled key', event.key);
    }
  }, [isOpen, totalItems, highlightedIndex, isInputFocused, items, hasMore, onLoadMore, onSelect, inputRef, maxVisibleItems]);

  return {
    highlightedIndex,
    isInputFocused,
    setIsInputFocused,
    handleKeyDown,
    itemsRef
  };
}
