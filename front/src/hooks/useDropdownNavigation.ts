// File: src/hooks/useDropdownNavigation.ts
// Last change: Fixed TS18047 error (highlightedIndex possibly null)

import { useState, RefObject } from 'react';


interface DropdownNavigationOptions {
  itemsCount: number;
  hasMore?: boolean;
  onSelectItem: (index: number) => void;
  onLoadMore?: () => void;
  inputRef?: RefObject<HTMLInputElement>;
  itemsPerPage?: number;
  openDropdown?: () => void;
  isDropdownOpen: boolean;
}

const useDropdownNavigation = ({
  itemsCount,
  hasMore = false,
  onSelectItem,
  onLoadMore,
  inputRef,
  itemsPerPage = 8,
  
  isDropdownOpen,
}: DropdownNavigationOptions) => {
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [isInputFocused, setIsInputFocused] = useState(true);
  
  const totalItems = itemsCount + (hasMore ? 1 : 0);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    console.log("Key pressed:", event.key, "Dropdown open:", isDropdownOpen);

    if (!isDropdownOpen) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (totalItems === 0) return;

        if (isInputFocused) {
          setIsInputFocused(false);
          setHighlightedIndex(0);
          inputRef?.current?.blur(); 

          setTimeout(() => {
            const firstItem = document.querySelectorAll<HTMLElement>(".result-item")[0];
            if (firstItem) firstItem.focus(); // ✅ Prevents null reference
          }, 0);

          console.log("Focus moved to first dropdown item.");
        } else {
          setHighlightedIndex(prev => {
            const nextIndex = prev === null ? 0 : (prev + 1) % totalItems;
            setTimeout(() => {
              const nextItem = document.querySelectorAll<HTMLElement>(".result-item")[nextIndex];
              if (nextItem) nextItem.focus(); // ✅ Ensures nextIndex is valid
            }, 0);
            return nextIndex;
          });
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (totalItems === 0) return;

        if (!isInputFocused && (highlightedIndex === null || highlightedIndex === 0)) {
          setIsInputFocused(true);
          setHighlightedIndex(null);
          inputRef?.current?.focus();
        } else {
          setHighlightedIndex(prev => {
            const prevIndex = prev === null || prev <= 0 ? totalItems - 1 : prev - 1;
            setTimeout(() => {
              const prevItem = document.querySelectorAll<HTMLElement>(".result-item")[prevIndex];
              if (prevItem) prevItem.focus(); // ✅ Prevents null reference
            }, 0);
            return prevIndex;
          });
        }
        break;
        
const VISIBLE_ITEMS_COUNT = 8; // 🔥 Adjust this based on actual visible rows

case 'PageDown':
  event.preventDefault();
  if (totalItems === 0) return;

  setHighlightedIndex(prev => {
    const newIndex = prev === null ? 0 : Math.min(prev + VISIBLE_ITEMS_COUNT, totalItems - 1);

    setTimeout(() => {
      const newItem = document.querySelectorAll<HTMLElement>(".result-item")[newIndex];
      if (newItem) {
        newItem.focus();
        newItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        console.log("PageDown moved focus to:", newIndex);
      }
    }, 0);

    return newIndex;
  });

  setIsInputFocused(false);
  break;

  case 'PageUp':
    event.preventDefault();
    if (totalItems === 0) return;
  
    setHighlightedIndex(prev => {
      const newIndex = prev === null ? 0 : Math.max(prev - VISIBLE_ITEMS_COUNT, 0);
  
      setTimeout(() => {
        const newItem = document.querySelectorAll<HTMLElement>(".result-item")[newIndex];
        if (newItem) {
          newItem.focus();
          newItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          console.log("PageUp moved focus to:", newIndex);
        }
      }, 0);
  
      return newIndex;
    });
  
    setIsInputFocused(false);
    break;



      case 'Enter':
        event.preventDefault();
        if (highlightedIndex !== null && !isInputFocused) {
          if (highlightedIndex === itemsCount && hasMore) {
            onLoadMore && onLoadMore();
          } else {
            onSelectItem(highlightedIndex);
          }
        }
        break;

      case 'Escape':
        event.preventDefault();
        setHighlightedIndex(null);
        setIsInputFocused(true);
        inputRef?.current?.focus();
        break;

      default:
        break;
    }
  };

  return { highlightedIndex, setHighlightedIndex, isInputFocused, setIsInputFocused, handleKeyDown, totalItems };
};

export default useDropdownNavigation;
