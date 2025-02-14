// File: src/components/sections/content/search-forms/BaseDropdown.tsx
// Last change: Improved focus handling and translation of comments

import React, { useRef, useEffect, useCallback } from "react";
import { useUINavigation } from "@/hooks/useUINavigation";
import { useDropdownPagination } from "@/hooks/useDropdownPagination";

export type DropdownType = "country" | "location";
export type LocationType = "pickup" | "delivery";

interface BaseDropdownProps<T> {
 items: T[];
 isOpen: boolean;
 onSelect: (item: T, index: number) => void;
 onClose: () => void;
 inputRef: React.RefObject<HTMLInputElement>;
 onNextFieldFocus?: () => void;  // Callback to focus next input field
 onLoadMore?: (lastItem: T | null) => void;
 renderItem: (item: T, meta: { isHighlighted: boolean; isSelected: boolean }) => React.ReactNode;
 dropdownType: DropdownType;
 locationType: LocationType;
 getItemKey?: (item: T, index: number) => string | number;
 selectedItem?: T | null;
 loadMoreText?: string;
 totalItems?: number;
 pageSize?: number;
 onNoResults?: () => React.ReactNode;
 ariaLabel?: string;
}

export function BaseDropdown<T>({
 items,
 isOpen,
 onSelect,
 onClose,
 inputRef,
 onNextFieldFocus,  // Callback to move focus to next input
 onLoadMore,
 renderItem,
 dropdownType,
 locationType,
 getItemKey = (_: T, index: number) => index,
 selectedItem,
 loadMoreText = "Load more...",
 totalItems = 0,
 pageSize = 10,
 onNoResults,
 ariaLabel = "Dropdown Options",
}: BaseDropdownProps<T>) {
 // Reference to dropdown container
 const dropdownRef = useRef<HTMLDivElement>(null);

 // Use custom navigation hook for dropdown interactions
 const { 
   highlightedIndex, 
   handleKeyDown: originalHandleKeyDown, 
   handleItemMouseEnter,
   handleItemClick
 } = useUINavigation({
   items,
   isOpen,
   onSelect: (item, index) => {
     onSelect(item, index);
     onClose();
     // Trigger focus on next field after selection
     onNextFieldFocus?.();
   },
   inputRef,
   pageSize,
 });

 // Custom key down handler to manage TAB and focus
 const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
   // Intercept TAB key to move focus to next input
   if (e.key === 'Tab') {
     e.preventDefault();
     onNextFieldFocus?.();
     return;
   }

   // Use original key down handler for other interactions
   originalHandleKeyDown(e);
 }, [originalHandleKeyDown, onNextFieldFocus]);

 // Pagination hook for loading more items
 const { hasMore, loadMoreData } = useDropdownPagination({
   totalItems,
   items,
   onLoadMore,
 });

 // Handle clicks outside the dropdown
 const handleClickOutside = useCallback((event: MouseEvent) => {
   if (
     dropdownRef.current &&
     !dropdownRef.current.contains(event.target as Node) &&
     !inputRef?.current?.contains(event.target as Node)
   ) {
     onClose();
   }
 }, [onClose, inputRef]);

 // Add/remove click outside listener
 useEffect(() => {
   if (!isOpen) return;

   document.addEventListener("mousedown", handleClickOutside);
   return () => document.removeEventListener("mousedown", handleClickOutside);
 }, [isOpen, handleClickOutside]);

 // Do not render if dropdown is closed
 if (!isOpen) return null;

 // Debug logging for dropdown rendering
 console.log('Rendering dropdown:', {
   items: items.length,
   hasMore,
   highlightedIndex,
   locationType,
   dropdownType
 });

 return (
   <div 
     ref={dropdownRef}
     className={`dd-list dd-list-${locationType}-${dropdownType}`}
     role="listbox"
     onKeyDown={handleKeyDown}
     aria-label={ariaLabel}
     tabIndex={-1}
   >
     {items.length === 0 ? (
       // Render no results state if no items
       onNoResults && (
         <div className="item-suggestion no-results" role="option">
           {onNoResults()}
         </div>
       )
     ) : (
       <>
         {items.map((item, index) => (
           <div
             key={getItemKey(item, index)}
             id={`item-${index}`}
             onClick={() => {
               handleItemClick(index);
               onNextFieldFocus?.();
             }}
             onMouseEnter={() => handleItemMouseEnter(index)}
             className={`item-suggestion ${index === highlightedIndex ? "highlighted" : ""}`}
             role="option"
             aria-selected={selectedItem === item}
             tabIndex={-1}
           >
             {renderItem(item, {
               isHighlighted: index === highlightedIndex,
               isSelected: selectedItem === item,
             })}
           </div>
         ))}

         {hasMore && (
           <div
             onClick={loadMoreData}
             className={`dd-load-more ${highlightedIndex === items.length ? "highlighted" : ""}`}
             role="option"
             aria-label={loadMoreText}
             tabIndex={-1}
           >
             {loadMoreText}
           </div>
         )}
       </>
     )}
   </div>
 );
}