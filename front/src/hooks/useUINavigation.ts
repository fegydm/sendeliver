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

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!isOpen) return;

    // Calculate the total number of selectable items (including "Load more" if present)
    const totalSelectableItems = items.length + (items.length < pageSize ? 0 : 1);

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setIsInputFocused(false);
        setHighlightedIndex((prev) => {
          if (prev === null) return 0;
          // Allow navigation to "Load more" option when at the last item
          return Math.min(prev + 1, items.length);
        });
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
        setIsInputFocused(false);
        setHighlightedIndex((prev) => Math.min((prev ?? 0) + pageSize, items.length - 1));
        break;
      case "PageUp":
        event.preventDefault();
        setIsInputFocused(false);
        setHighlightedIndex((prev) => Math.max((prev ?? 0) - pageSize, 0));
        break;
      case "Enter":
        event.preventDefault();
        if (highlightedIndex !== null && !isInputFocused) {
          if (highlightedIndex < items.length) {
            // Regular item selected
            onSelect(items[highlightedIndex], highlightedIndex);
          } else {
            // "Load more" option selected
            const loadMoreEvent = new CustomEvent('loadMore');
            document.dispatchEvent(loadMoreEvent);
            // Do NOT reset highlightedIndex here
            return;
          }
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
  }, [isOpen, items, highlightedIndex, onSelect, inputRef, pageSize]);

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
    setHighlightedIndex, // Export setHighlightedIndex function
    isInputFocused,
    setIsInputFocused,
    handleKeyDown,
    itemsRef,
    handleItemMouseEnter,
    handleItemClick,
  };
}