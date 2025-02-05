// File: src/hooks/useDropdownNavigation.ts
// Last change: Simplified dropdown navigation hook for general use

import { useState, RefObject, useCallback, useRef, useEffect } from 'react';

// Core options for dropdown navigation
interface DropdownNavigationOptions<T> {
  items: T[];                                      // Items to display
  isOpen: boolean;                                // Dropdown open state
  onSelect: (item: T, index: number) => void;     // Item selection handler
  inputRef?: RefObject<HTMLInputElement>;         // Reference to input element
  hasMore?: boolean;                              // Whether more items can be loaded
  onLoadMore?: () => void;                        // Load more items handler
  maxVisibleItems?: number;                       // Max items visible at once
}

export function useDropdownNavigation<T>({
  items,
  isOpen,
  onSelect,
  inputRef,
  hasMore = false,
  onLoadMore,
  maxVisibleItems = 8
}: DropdownNavigationOptions<T>) {
  // State management
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [isInputFocused, setIsInputFocused] = useState(true);
  
  // References
  const itemsRef = useRef<HTMLElement[]>([]);
  const totalItems = items.length + (hasMore ? 1 : 0);

  // Reset state when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setHighlightedIndex(null);
      setIsInputFocused(true);
    }
  }, [isOpen]);

  // Handle keyboard navigation
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
          setIsInputFocused(true);
          setHighlightedIndex(null);
          inputRef?.current?.focus();
        } else {
          setHighlightedIndex(prev => prev !== null ? prev - 1 : null);
        }
        break;
      }

      case 'Enter': {
        event.preventDefault();
        if (highlightedIndex !== null && !isInputFocused) {
          if (highlightedIndex === items.length && hasMore) {
            onLoadMore?.();
          } else {
            onSelect(items[highlightedIndex], highlightedIndex);
          }
        }
        break;
      }

      case 'Escape': {
        event.preventDefault();
        setHighlightedIndex(null);
        setIsInputFocused(true);
        inputRef?.current?.focus();
        break;
      }
    }
  }, [isOpen, totalItems, highlightedIndex, isInputFocused, items, hasMore, onLoadMore, onSelect, inputRef]);

  return {
    highlightedIndex,
    isInputFocused,
    setIsInputFocused,
    handleKeyDown,
    itemsRef
  };
}