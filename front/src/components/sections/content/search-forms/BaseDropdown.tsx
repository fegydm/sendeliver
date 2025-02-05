// File: src/components/sections/content/search-forms/BaseDropdown.tsx
// Last change: Added highlightedIndex and isInputFocused to props

import React, { useEffect, useRef } from 'react';
import { useDropdownNavigation } from '@/hooks/useDropdownNavigation';

interface BaseDropdownProps<T> {
  items: T[];
  isOpen: boolean;
  onSelect: (item: T, index: number) => void;
  onClose: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
  hasMore?: boolean;
  onLoadMore?: () => void;
  renderItem: (item: T, isHighlighted: boolean) => React.ReactNode;
  className?: string;
  highlightedIndex?: number | null;
  isInputFocused?: boolean;
}

export function BaseDropdown<T>({
  items,
  isOpen,
  onSelect,
  onClose,
  inputRef,
  hasMore = false,
  onLoadMore,
  renderItem,
  className = '',
  highlightedIndex: externalHighlightedIndex,
  isInputFocused: externalIsInputFocused,
}: BaseDropdownProps<T>) {
  const dropdownRef = useRef<HTMLUListElement>(null);
  const {
    highlightedIndex: internalHighlightedIndex,
    isInputFocused: internalIsInputFocused,
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

  const activeHighlightedIndex = externalHighlightedIndex ?? internalHighlightedIndex;
  const activeIsInputFocused = externalIsInputFocused ?? internalIsInputFocused;

  console.log('BaseDropdown Render:', {
    isOpen,
    itemsLength: items.length,
    highlightedIndex: activeHighlightedIndex,
    isInputFocused: activeIsInputFocused,
    hasMore
  });

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && 
          !dropdownRef.current.contains(event.target as Node) && 
          !inputRef?.current?.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, inputRef]);

  useEffect(() => {
    if (!isOpen || !dropdownRef.current || activeHighlightedIndex === null) return;

    const highlightedElement = itemsRef.current[activeHighlightedIndex];
    if (!highlightedElement) return;

    const dropdownRect = dropdownRef.current.getBoundingClientRect();
    const elementRect = highlightedElement.getBoundingClientRect();

    if (elementRect.bottom > dropdownRect.bottom) {
      highlightedElement.scrollIntoView({ block: 'end', behavior: 'smooth' });
    } else if (elementRect.top < dropdownRect.top) {
      highlightedElement.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  }, [activeHighlightedIndex, isOpen, itemsRef]);

  if (!isOpen) return null;

  return (
    <ul 
      ref={dropdownRef}
      className={`dropdown-list ${className}`}
      role="listbox"
      onKeyDown={handleKeyDown}
    >
      {items.map((item, index) => (
        <li
          key={index}
          ref={(el) => {
            if (el) itemsRef.current[index] = el;
          }}
          onClick={() => onSelect(item, index)}
          className={`dropdown-item ${index === activeHighlightedIndex && !activeIsInputFocused ? 'highlighted' : ''}`}
          role="option"
          tabIndex={index === activeHighlightedIndex && !activeIsInputFocused ? 0 : -1}
        >
          {renderItem(item, index === activeHighlightedIndex)}
        </li>
      ))}

      {hasMore && (
        <li
          ref={(el) => {
            if (el) itemsRef.current[items.length] = el;
          }}
          onClick={onLoadMore}
          className={`load-more ${items.length === activeHighlightedIndex ? 'highlighted' : ''}`}
          role="option"
          tabIndex={items.length === activeHighlightedIndex ? 0 : -1}
        >
          Load more...
        </li>
      )}
    </ul>
  );
}