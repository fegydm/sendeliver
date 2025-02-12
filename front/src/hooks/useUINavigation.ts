// File: src/hooks/useUINavigation.ts
// Last change: Improved handling of focus, added support for mouse navigation, and better handling of edge cases.

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
      return;
    }

    if (highlightedIndex !== null && highlightedIndex >= items.length) {
        setHighlightedIndex(items.length > 0 ? 0 : null);
    }
    
  }, [isOpen, items.length]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!isOpen) return;

      event.preventDefault();

      switch (event.key) {
        case "ArrowDown":
          setIsInputFocused(false);
          setHighlightedIndex((prev) => (prev === null ? 0 : Math.min(prev + 1, items.length - 1)));
          break;

        case "ArrowUp":
          if (highlightedIndex === null || highlightedIndex === 0) {
            setIsInputFocused(true);
            setHighlightedIndex(null);
            inputRef?.current?.focus();
          } else {
            setHighlightedIndex((prev) => (prev !== null ? prev - 1 : null));
          }
          break;

        case "PageDown":
          setIsInputFocused(false);
          setHighlightedIndex((prev) => Math.min((prev ?? 0) + pageSize, items.length - 1));
          break;

        case "PageUp":
           setIsInputFocused(false);
          setHighlightedIndex((prev) => Math.max((prev ?? 0) - pageSize, 0));
          break;

        case "Enter":
          if (highlightedIndex !== null && !isInputFocused) {
            onSelect(items[highlightedIndex], highlightedIndex);
            setHighlightedIndex(null);
            setIsInputFocused(true);
          }
          break;

        case "Escape":
          setHighlightedIndex(null);
          setIsInputFocused(true);
          inputRef?.current?.focus();
          break;
      }
    },
    [isOpen, items, highlightedIndex, onSelect, inputRef, pageSize]
  );

  const handleItemMouseEnter = useCallback((index: number) => {
    setHighlightedIndex(index);
    setIsInputFocused(false);
  }, []);

  const handleItemClick = useCallback((index: number) => {
    onSelect(items[index], index);
    setHighlightedIndex(null);
    setIsInputFocused(true);
  }, [onSelect, items]);


  return {
    highlightedIndex,
    isInputFocused,
    setIsInputFocused,
    handleKeyDown,
    itemsRef,
    handleItemMouseEnter,
    handleItemClick,
  };
}