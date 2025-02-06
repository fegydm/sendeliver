// File: src/hooks/useUINavigation.ts
// Last change: Fixed UI navigation to always show 10 items for PageUp/PageDown

import { useState, RefObject, useCallback, useRef, useEffect } from 'react';

interface UINavigationOptions<T> {
 items: T[];
 isOpen: boolean;
 onSelect: (item: T, index: number) => void;
 inputRef?: RefObject<HTMLInputElement>;
}

export function useUINavigation<T>({
 items,
 isOpen,
 onSelect,
 inputRef
}: UINavigationOptions<T>) {
 const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
 const [isInputFocused, setIsInputFocused] = useState(true);
 const [navigationIndex, setNavigationIndex] = useState(0);
 const itemsRef = useRef<HTMLElement[]>([]);

 const UI_PAGE_SIZE = 10;

 useEffect(() => {
   if (!isOpen) {
     setHighlightedIndex(null);
     setIsInputFocused(true);
     setNavigationIndex(0);
   }
 }, [isOpen]);

 const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
   if (!isOpen) return;

   switch (event.key) {
     case 'ArrowDown': {
       event.preventDefault();
       setIsInputFocused(false);
       setHighlightedIndex(prev => {
         if (prev === null) return 0;
         return prev < items.length - 1 ? prev + 1 : prev;
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
         setHighlightedIndex(prev => (prev !== null ? prev - 1 : null));
       }
       break;
     }
     case 'PageDown': {
       event.preventDefault();
       const newNavIndex = Math.min(navigationIndex + UI_PAGE_SIZE, Math.max(0, items.length - UI_PAGE_SIZE));
       setNavigationIndex(newNavIndex);
       setHighlightedIndex(newNavIndex);
       break;
     }
     case 'PageUp': {
       event.preventDefault();
       const newNavIndex = Math.max(0, navigationIndex - UI_PAGE_SIZE);
       setNavigationIndex(newNavIndex);
       setHighlightedIndex(newNavIndex);
       break;
     }
     case 'Enter': {
       event.preventDefault();
       if (highlightedIndex !== null && !isInputFocused) {
         onSelect(items[highlightedIndex], highlightedIndex);
       }
       break;
     }
     case 'Escape': {
       event.preventDefault();
       setHighlightedIndex(null);
       setIsInputFocused(true);
       setNavigationIndex(0);
       inputRef?.current?.focus();
       break;
     }
   }
 }, [isOpen, items, highlightedIndex, isInputFocused, navigationIndex, onSelect, inputRef]);

 return {
   highlightedIndex,
   isInputFocused,
   setIsInputFocused,
   handleKeyDown,
   itemsRef
 };
}