// File: src/shared/hooks/shared.use-lu-li-lnavigation.hook.ts
// Last change: Fixed ArrowUp to navigate within dropdown, focus input only from item 0

import { useState, useCallback, useEffect } from "react";

interface UINavigationOptions<T> {
  items: T[];
  isOpen: boolean;
  onSelect: (item: T, index: number) => void;
  pageSize?: number;
  onLoadMore?: () => void;
  inputRef?: React.RefObject<HTMLInputElement>;
}

export function useUINavigation<T>({
  items,
  isOpen,
  onSelect,
  pageSize = 10,
  onLoadMore,
  inputRef,
}: UINavigationOptions<T>) {
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setHighlightedIndex(null);
      return;
    }
    if (highlightedIndex !== null && highlightedIndex >= items.length) {
      setHighlightedIndex(items.length > 0 ? 0 : null);
    }
  }, [isOpen, items.length]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!isOpen || items.length === 0) return;

      const totalSelectableItems = onLoadMore && items.length >= pageSize ? items.length + 1 : items.length;

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setHighlightedIndex((prev) => {
            if (prev === null) return 0; // Start at first item if no HL
            return Math.min(prev + 1, totalSelectableItems - 1); // Move down
          });
          break;

        case "ArrowUp":
          event.preventDefault();
          setHighlightedIndex((prev) => {
            if (prev === null) return items.length - 1; // Start at last item if no HL
            if (prev === 0) {
              if (inputRef?.current) {
                inputRef.current.focus(); // Focus input only from item 0
              }
              return null; // Clear HL when moving up from first item
            }
            return prev - 1; // Move up within dropdown
          });
          break;

        case "PageDown":
          event.preventDefault();
          setHighlightedIndex((prev) => Math.min((prev ?? 0) + pageSize, items.length - 1));
          break;

        case "PageUp":
          event.preventDefault();
          setHighlightedIndex((prev) => Math.max((prev ?? items.length) - pageSize, 0));
          break;

        case "Enter":
          event.preventDefault();
          if (highlightedIndex !== null) {
            if (highlightedIndex < items.length) {
              onSelect(items[highlightedIndex], highlightedIndex);
              setHighlightedIndex(null);
            } else if (onLoadMore) {
              onLoadMore();
            }
          }
          break;

        case "Escape":
          event.preventDefault();
          setHighlightedIndex(null);
          if (inputRef?.current) {
            inputRef.current.focus();
          }
          break;

        default:
          break;
      }
    },
    [isOpen, items, onSelect, pageSize, onLoadMore, highlightedIndex, inputRef]
  );

  const handleItemClick = useCallback(
    (index: number) => {
      onSelect(items[index], index);
      setHighlightedIndex(null);
    },
    [onSelect, items]
  );

  return {
    highlightedIndex,
    setHighlightedIndex,
    handleKeyDown,
    handleItemClick,
  };
}