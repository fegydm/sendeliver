import React, { useRef, useEffect } from 'react';
import { useUINavigation } from '@/hooks/useUINavigation';
import { useDropdownPagination } from '@/hooks/useDropdownPagination';

interface BaseDropdownProps<T> {
  items: T[];
  isOpen: boolean;
  onSelect: (item: T, index: number) => void;
  onClose: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
  onLoadMore?: () => void;
  renderItem: (item: T, meta: { isHighlighted: boolean; isSelected: boolean }) => React.ReactNode;
  className?: string;
  getItemKey?: (item: T, index: number) => string | number;
  selectedItem?: T | null;
  loadMoreText?: string;
  totalItems?: number;
  isSinglePage?: boolean;
}

export function BaseDropdown<T>({
  items,
  isOpen,
  onSelect,
  onClose,
  inputRef,
  onLoadMore,
  renderItem,
  className = '',
  getItemKey = (_: T, index: number) => index,
  selectedItem,
  loadMoreText = 'Load more...',
  totalItems = 0,
  isSinglePage = false
}: BaseDropdownProps<T>) {
  const dropdownRef = useRef<HTMLUListElement>(null);

  // Navigation hook – handles keyboard navigation within the dropdown
  const {
    highlightedIndex,
    isInputFocused,
    handleKeyDown,
    itemsRef
  } = useUINavigation({
    items,
    isOpen,
    onSelect,
    inputRef
  });

  // Pagination hook – determines whether there are more items to load
  const { hasMore, loadMoreData } = useDropdownPagination({
    isSinglePage,
    onLoadMore,
    totalItems
  });

  // Effect to close the dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) && 
        !inputRef?.current?.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, inputRef]);

  if (!isOpen) return null;

  return (
    <ul 
      ref={dropdownRef}
      className={`dropdown-list ${className}`}
      role="listbox"
      onKeyDown={handleKeyDown}
      aria-expanded={isOpen}
      aria-activedescendant={highlightedIndex !== null ? `item-${highlightedIndex}` : undefined}
    >
      {items.map((item, index) => (
        <li
          key={getItemKey(item, index)}
          ref={(el) => {
            if (el) itemsRef.current[index] = el;
          }}
          id={`item-${index}`}
          onClick={() => onSelect(item, index)}
          className={`dropdown-item ${index === highlightedIndex && !isInputFocused ? 'highlighted' : ''}`}
          role="option"
          aria-selected={selectedItem === item}
          tabIndex={index === highlightedIndex && !isInputFocused ? 0 : -1}
        >
          {renderItem(item, {
            isHighlighted: index === highlightedIndex,
            isSelected: selectedItem === item
          })}
        </li>
      ))}

      {hasMore && (
        <li
          ref={(el) => {
            if (el) itemsRef.current[items.length] = el;
          }}
          onClick={loadMoreData}
          className={`load-more ${highlightedIndex === items.length ? 'highlighted' : ''}`}
          role="option"
          aria-label={loadMoreText}
          tabIndex={highlightedIndex === items.length ? 0 : -1}
        >
          {loadMoreText}
        </li>
      )}
    </ul>
  );
}
