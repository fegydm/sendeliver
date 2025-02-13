// File: src/components/sections/content/search-forms/BaseDropdown.tsx
// Last change: Fixed dropdown rendering and styles

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
 const dropdownRef = useRef<HTMLDivElement>(null);

 const { highlightedIndex, handleKeyDown } = useUINavigation({
   items,
   isOpen,
   onSelect,
   inputRef,
   pageSize,
 });

 const { hasMore, loadMoreData } = useDropdownPagination({
   totalItems,
   items,
   onLoadMore,
 });

 const handleClickOutside = useCallback((event: MouseEvent) => {
   if (
     dropdownRef.current &&
     !dropdownRef.current.contains(event.target as Node) &&
     !inputRef?.current?.contains(event.target as Node)
   ) {
     onClose();
   }
 }, [onClose, inputRef]);

 useEffect(() => {
   if (!isOpen) return;

   document.addEventListener("mousedown", handleClickOutside);
   return () => document.removeEventListener("mousedown", handleClickOutside);
 }, [isOpen, handleClickOutside]);

 const handleItemClick = useCallback((item: T, index: number) => {
   onSelect(item, index);
   onClose();
 }, [onSelect, onClose]);

 if (!isOpen) return null;

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
   >
     {items.length === 0 ? (
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
             onClick={() => handleItemClick(item, index)}
             className={`item-suggestion ${index === highlightedIndex ? "highlighted" : ""}`}
             role="option"
             aria-selected={selectedItem === item}
             tabIndex={index === highlightedIndex ? 0 : -1}
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
             tabIndex={highlightedIndex === items.length ? 0 : -1}
           >
             {loadMoreText}
           </div>
         )}
       </>
     )}
   </div>
 );
}