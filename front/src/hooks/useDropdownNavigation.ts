// File: src/hooks/useDropdownNavigation.ts
// Last change: Fixed type safety and added hooks composition support

import { useState, RefObject, useCallback, useRef, useEffect } from 'react';

interface DropdownNavigationOptions {
  itemsCount: number;
  hasMore?: boolean;
  onSelectItem: (index: number) => void;
  onLoadMore?: () => void;
  inputRef?: RefObject<HTMLInputElement>;
  itemsPerPage?: number;
  isDropdownOpen: boolean;
  initialHighlightedIndex?: number | null;
  onDropdownClose?: () => void;
  onDropdownOpen?: () => void;
  onHighlightChange?: (index: number | null) => void;
  customKeyHandlers?: {
    [key: string]: (event: React.KeyboardEvent) => boolean;
  };
  preventInputBlur?: boolean;
}

const useDropdownNavigation = ({
  itemsCount,
  hasMore = false,
  onSelectItem,
  onLoadMore,
  inputRef,
  itemsPerPage = 8,
  isDropdownOpen,
  initialHighlightedIndex = null,
  onDropdownClose,
  onDropdownOpen,
  onHighlightChange,
  customKeyHandlers = {},
  preventInputBlur = false
}: DropdownNavigationOptions) => {
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(initialHighlightedIndex);
  const [isInputFocused, setIsInputFocused] = useState(true);
  
  const totalItems = itemsCount + (hasMore ? 1 : 0);
  const resultItemsRef = useRef<HTMLElement[]>([]);

  const updateHighlightedIndex = useCallback((indexOrFn: number | null | ((prev: number | null) => number | null)) => {
    const newIndex = typeof indexOrFn === 'function' ? indexOrFn(highlightedIndex) : indexOrFn;
    setHighlightedIndex(newIndex);
    onHighlightChange?.(newIndex);
  }, [onHighlightChange, highlightedIndex]);

  useEffect(() => {
    if (!isDropdownOpen) {
      updateHighlightedIndex(null);
      setIsInputFocused(true);
      onDropdownClose?.();
    } else {
      onDropdownOpen?.();
    }
  }, [isDropdownOpen, onDropdownClose, onDropdownOpen, updateHighlightedIndex]);

  const focusItem = useCallback((index: number) => {
    if (!preventInputBlur) {
      const element = resultItemsRef.current[index];
      if (element) {
        element.focus();
        element.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [preventInputBlur]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (customKeyHandlers[event.key] && customKeyHandlers[event.key](event)) {
      return;
    }

    if (!isDropdownOpen) return;

    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        if (totalItems === 0) return;

        if (isInputFocused) {
          setIsInputFocused(false);
          updateHighlightedIndex(0);
          focusItem(0);
        } else {
          updateHighlightedIndex((prev: number | null) => {
            const nextIndex = prev === null ? 0 : (prev + 1) % totalItems;
            focusItem(nextIndex);
            return nextIndex;
          });
        }
        break;
      }

      case 'ArrowUp': {
        event.preventDefault();
        if (totalItems === 0) return;

        if (!isInputFocused && (highlightedIndex === null || highlightedIndex === 0)) {
          setIsInputFocused(true);
          updateHighlightedIndex(null);
          inputRef?.current?.focus();
        } else {
          updateHighlightedIndex((prev: number | null) => {
            const prevIndex = prev === null || prev <= 0 ? totalItems - 1 : prev - 1;
            focusItem(prevIndex);
            return prevIndex;
          });
        }
        break;
      }

      case 'PageDown': {
        event.preventDefault();
        if (totalItems === 0) return;

        updateHighlightedIndex((prev: number | null) => {
          const newIndex = Math.min(prev === null ? 0 : prev + itemsPerPage, totalItems - 1);
          focusItem(newIndex);
          return newIndex;
        });
        setIsInputFocused(false);
        break;
      }

      case 'PageUp': {
        event.preventDefault();
        if (totalItems === 0) return;

        updateHighlightedIndex((prev: number | null) => {
          const newIndex = Math.max(prev === null ? 0 : prev - itemsPerPage, 0);
          focusItem(newIndex);
          return newIndex;
        });
        setIsInputFocused(false);
        break;
      }

      case 'Enter': {
        event.preventDefault();
        if (highlightedIndex !== null && !isInputFocused) {
          if (highlightedIndex === itemsCount && hasMore) {
            onLoadMore?.();
          } else {
            onSelectItem(highlightedIndex);
          }
        }
        break;
      }

      case 'Escape': {
        event.preventDefault();
        updateHighlightedIndex(null);
        setIsInputFocused(true);
        inputRef?.current?.focus();
        break;
      }
    }
  }, [
    isDropdownOpen,
    totalItems,
    isInputFocused,
    highlightedIndex,
    itemsCount,
    hasMore,
    onLoadMore,
    onSelectItem,
    inputRef,
    itemsPerPage,
    focusItem,
    updateHighlightedIndex,
    customKeyHandlers
  ]);

  return {
    highlightedIndex,
    setHighlightedIndex: updateHighlightedIndex,
    isInputFocused,
    setIsInputFocused,
    handleKeyDown,
    totalItems,
    resultItemsRef,
  };
};

export default useDropdownNavigation;