// File: src/hooks/useUINavigation.ts
// Last change: Removed unused navigationIndex to eliminate TypeScript warning

import { useState, RefObject, useCallback, useRef, useEffect } from "react";

interface UINavigationOptions<T> {
  items: T[];
  isOpen: boolean;
  onSelect: (item: T, index: number) => void;
  inputRef?: RefObject<HTMLInputElement>;
  pageSize?: number;
}

export function useUINavigation<T>({
  items,
  isOpen,
  onSelect,
  inputRef,
  pageSize = 10,
}: UINavigationOptions<T>) {
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [isInputFocused, setIsInputFocused] = useState(true);
  const itemsRef = useRef<HTMLElement[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setHighlightedIndex(null);
      setIsInputFocused(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (highlightedIndex !== null && highlightedIndex >= items.length) {
      setHighlightedIndex(null);
    }
  }, [items.length, highlightedIndex]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setIsInputFocused(false);
          setHighlightedIndex((prev) => (prev === null ? 0 : Math.min(prev + 1, items.length - 1)));
          break;

        case "ArrowUp":
          event.preventDefault();
          if (highlightedIndex === null || highlightedIndex === 0) {
            setIsInputFocused(true);
            setHighlightedIndex(null);
            inputRef?.current?.focus();
          } else {
            setHighlightedIndex((prev) => (prev !== null ? prev - 1 : null));
          }
          break;

        case "PageDown":
          event.preventDefault();
          setHighlightedIndex((prev) => Math.min((prev ?? 0) + pageSize, items.length - 1));
          break;

        case "PageUp":
          event.preventDefault();
          setHighlightedIndex((prev) => Math.max((prev ?? 0) - pageSize, 0));
          break;

        case "Enter":
          event.preventDefault();
          if (highlightedIndex !== null && !isInputFocused) {
            onSelect(items[highlightedIndex], highlightedIndex);
            setHighlightedIndex(null);
            setIsInputFocused(true);
          }
          break;

        case "Escape":
          event.preventDefault();
          setHighlightedIndex(null);
          setIsInputFocused(true);
          inputRef?.current?.focus();
          break;
      }
    },
    [isOpen, items, highlightedIndex, onSelect, inputRef, pageSize]
  );

  return {
    highlightedIndex,
    isInputFocused,
    setIsInputFocused,
    handleKeyDown,
    itemsRef,
  };
}
