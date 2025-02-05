// File: src/components/dropdown/BaseDropdown.tsx
// Last change: Created reusable base dropdown component

import React from 'react';
import { useDropdownNavigation } from '@/hooks/useDropdownNavigation';

interface BaseDropdownProps<T> {
  items: T[];                                           // Items to display
  isOpen: boolean;                                     // Dropdown open state
  onSelect: (item: T, index: number) => void;         // Selection handler
  inputRef?: React.RefObject<HTMLInputElement>;       // Input reference
  hasMore?: boolean;                                  // More items available
  onLoadMore?: () => void;                           // Load more handler
  renderItem: (item: T, isHighlighted: boolean) => React.ReactNode;  // Item renderer
  className?: string;                                // Optional styling
}

export function BaseDropdown<T>({
  items,
  isOpen,
  onSelect,
  inputRef,
  hasMore,
  onLoadMore,
  renderItem,
  className = ''
}: BaseDropdownProps<T>) {
  // Use navigation hook
  const {
    highlightedIndex,
    isInputFocused,
    handleKeyDown,
    itemsRef
  } = useDropdownNavigation({
    items,
    isOpen,
    onSelect,
    inputRef,
    hasMore,
    onLoadMore
  });

  if (!isOpen) return null;

  return (
    <ul 
      className={`dropdown-list ${className}`}
      role="listbox"
      onKeyDown={handleKeyDown}
    >
      {items.map((item, index) => (
        <li
          key={index}
          ref={el => itemsRef.current[index] = el as HTMLElement}
          onClick={() => onSelect(item, index)}
          className={`dropdown-item ${index === highlightedIndex && !isInputFocused ? 'highlighted' : ''}`}
          role="option"
          tabIndex={index === highlightedIndex && !isInputFocused ? 0 : -1}
        >
          {renderItem(item, index === highlightedIndex)}
        </li>
      ))}

      {hasMore && (
        <li
          ref={el => itemsRef.current[items.length] = el as HTMLElement}
          onClick={onLoadMore}
          className={`load-more ${items.length === highlightedIndex ? 'highlighted' : ''}`}
          role="option"
          tabIndex={items.length === highlightedIndex ? 0 : -1}
        >
          Load more...
        </li>
      )}
    </ul>
  );
}