// File: src/shared/components/elements/shared.lbase-ldropdown.comp.tsx
// Last change: Added shouldRenderDivider prop and improved accessibility

import React, { useRef, useCallback, useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { useUINavigation } from "@/hooks/useUINavigation";

interface BaseDropdownProps<T> {
  items: T[];
  isOpen: boolean;
  onSelect: (item: T, index: number) => void;
  renderItem: (item: T, meta: { isHighlighted: boolean }) => React.ReactNode;
  variant?: string;
  position?: string;
  className?: string;
  classNamePrefix?: string;
  onLoadMore?: () => void;
  totalItems?: number;
  pageSize?: number;
  loadMoreText?: string;
  onNoResults?: () => React.ReactNode;
  noResultsText?: string;
  isEmptyItem?: (item: T) => boolean;
  ariaLabel?: string;
  getItemKey?: (item: T) => string | number;
  onKeyDown?: (event: React.KeyboardEvent<hTMLDivElement>) => void;
  autoFocusOnOpen?: boolean;
  focusOnHover?: boolean;
  scrollEdgeThreshold?: number;
  scrollSpeedBase?: number;
  onMouseEnter?: (event: React.MouseEvent<hTMLDivElement>) => void;
  onMouseLeave?: (event: React.MouseEvent<hTMLDivElement>) => void;
  shouldRenderDivider?: (index: number) => boolean; 
}

export const BaseDropdown = forwardRef<hTMLDivElement, BaseDropdownProps<any>>(
  <T,>({
    items,
    isOpen,
    onSelect,
    renderItem,
    variant,
    position,
    className = "",
    classNamePrefix = "dropdown",
    onLoadMore,
    totalItems = 0,
    pageSize = 10,
    loadMoreText = "Load more...",
    onNoResults,
    noResultsText = "No results found",
    isEmptyItem,
    ariaLabel = "Dropdown options",
    getItemKey,
    onKeyDown,
    autoFocusOnOpen = true,
    focusOnHover = true,
    scrollEdgeThreshold = 0.15,
    scrollSpeedBase = 12,
    onMouseEnter,
    onMouseLeave,
    shouldRenderDivider,
  }: BaseDropdownProps<T>, ref: React.Ref<hTMLDivElement>) => {
    const dropdownRef = useRef<hTMLDivElement>(null);
    const itemsRef = useRef<(HTMLElement | null)[]>([]);
    const hoverTimeoutRef = useRef<nodeJS.Timeout | null>(null);
    const scrollIntervalRef = useRef<number | null>(null);

    useImperativeHandle(ref, () => dropdownRef.current as HTMLDivElement);

    const [isHovered, setIsHovered] = useState(false);
    const [lastHoveredIndex, setLastHoveredIndex] = useState<number | null>(null);

    const defaultGetItemKey = useCallback(
      (item: T, index: number) => (getItemKey ? getItemKey(item) : index),
      [getItemKey]
    );

    const { highlightedIndex, setHighlightedIndex, handleKeyDown: handleUINavigationKeyDown, handleItemClick } =
      useUINavigation({ items, isOpen, onSelect, pageSize, onLoadMore });

    const hasMore = onLoadMore && items.length < totalItems;
    const prevItemsLengthRef = useRef(items.length);

    const scrollToHighlightedItem = useCallback(() => {
      if (!dropdownRef.current || highlightedIndex === null || !itemsRef.current[highlightedIndex]) return;

      const dropdown = dropdownRef.current;
      const item = itemsRef.current[highlightedIndex];
      const dropdownRect = dropdown.getBoundingClientRect();
      const itemRect = item.getBoundingClientRect();

      const buffer = 20;
      const visibleTop = dropdownRect.top + buffer;
      const visibleBottom = dropdownRect.bottom - buffer;

      const isAboveView = itemRect.top < visibleTop;
      const isBelowView = itemRect.bottom > visibleBottom;

      if (isAboveView) {
        dropdown.scrollTop -= (visibleTop - itemRect.top);
      } else if (isBelowView) {
        dropdown.scrollTop += (itemRect.bottom - visibleBottom);
      }
    }, [highlightedIndex]);

    const handleDropdownMouseEnter = useCallback((event: React.MouseEvent<hTMLDivElement>) => {
      setIsHovered(true);
      if (lastHoveredIndex !== null && lastHoveredIndex < items.length) {
        setHighlightedIndex(lastHoveredIndex);
      }
      if (onMouseEnter) onMouseEnter(event);
    }, [lastHoveredIndex, items.length, setHighlightedIndex, onMouseEnter]);

    const handleDropdownMouseMove = useCallback(
      (event: React.MouseEvent<hTMLDivElement>) => {
        event.stopPropagation();
        if (!isHovered || !dropdownRef.current) return;
        const dropdownRect = dropdownRef.current.getBoundingClientRect();
        const mouseY = event.clientY;
        const topEdge = dropdownRect.top + dropdownRect.height * scrollEdgeThreshold;
        const bottomEdge = dropdownRect.bottom - dropdownRect.height * scrollEdgeThreshold;
        if (scrollIntervalRef.current) {
          window.clearInterval(scrollIntervalRef.current);
          scrollIntervalRef.current = null;
        }
        if (mouseY < topEdge) {
          const distanceFromEdge = mouseY - dropdownRect.top;
          const percent = Math.min(1, Math.max(0, distanceFromEdge / (dropdownRect.height * scrollEdgeThreshold)));
          const scrollSpeed = Math.max(1, scrollSpeedBase * (1 - percent));
          scrollIntervalRef.current = window.setInterval(() => {
            if (dropdownRef.current) dropdownRef.current.scrollTop -= scrollSpeed;
          }, 8);
        } else if (mouseY > bottomEdge) {
          const distanceFromEdge = dropdownRect.bottom - mouseY;
          const percent = Math.min(1, Math.max(0, distanceFromEdge / (dropdownRect.height * scrollEdgeThreshold)));
          const scrollSpeed = Math.max(1, scrollSpeedBase * (1 - percent));
          scrollIntervalRef.current = window.setInterval(() => {
            if (dropdownRef.current) dropdownRef.current.scrollTop += scrollSpeed;
          }, 8);
        }
      },
      [isHovered, scrollEdgeThreshold, scrollSpeedBase]
    );

    const handleDropdownMouseLeave = useCallback((event: React.MouseEvent<hTMLDivElement>) => {
      setIsHovered(false);
      if (highlightedIndex !== null) setLastHoveredIndex(highlightedIndex);
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
      if (onMouseLeave) onMouseLeave(event);
    }, [highlightedIndex, onMouseLeave]);

    const handleItemMouseEnter = useCallback(
      (index: number, event?: React.MouseEvent) => {
        if (event) event.stopPropagation();
        if (isHovered) {
          if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
          setHighlightedIndex(index);
          setLastHoveredIndex(index);
          if (focusOnHover && itemsRef.current[index]) itemsRef.current[index].focus();
        }
      },
      [isHovered, setHighlightedIndex, focusOnHover]
    );

    const handleDropdownFocus = useCallback(() => {
      if (isOpen && items.length > 0 && autoFocusOnOpen) {
        if (lastHoveredIndex !== null && lastHoveredIndex < items.length) {
          setHighlightedIndex(lastHoveredIndex);
          if (itemsRef.current[lastHoveredIndex]) itemsRef.current[lastHoveredIndex].focus();
        } else if (highlightedIndex === null) {
          setHighlightedIndex(0);
          if (itemsRef.current[0]) itemsRef.current[0].focus();
        }
      }
    }, [isOpen, items.length, highlightedIndex, setHighlightedIndex, lastHoveredIndex, autoFocusOnOpen]);

    const handleCombinedKeyDown = useCallback(
      (event: React.KeyboardEvent<hTMLDivElement>) => {
        if (document.activeElement === dropdownRef.current) {
          if (event.key === "ArrowUp" || event.key === "ArrowDown") {
            event.preventDefault();
          }
          event.stopPropagation();
          handleUINavigationKeyDown(event);
          if (highlightedIndex !== null) setLastHoveredIndex(highlightedIndex);
          if (onKeyDown) onKeyDown(event);
          requestAnimationFrame(scrollToHighlightedItem);
        }
      },
      [handleUINavigationKeyDown, onKeyDown, highlightedIndex, scrollToHighlightedItem]
    );

    useEffect(() => {
      return () => {
        if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
      };
    }, []);

    useEffect(() => {
      if (!isOpen) {
        setLastHoveredIndex(null);
      }
    }, [isOpen]);

    useEffect(() => {
      const prevLength = prevItemsLengthRef.current;
      const currentLength = items.length;
      if (currentLength > prevLength && prevLength > 0 && document.activeElement === dropdownRef.current) {
        const newIndex = prevLength;
        setHighlightedIndex(newIndex);
        setLastHoveredIndex(newIndex);
        if (itemsRef.current[newIndex]) itemsRef.current[newIndex].focus();
      }
      prevItemsLengthRef.current = currentLength;
    }, [items.length, setHighlightedIndex]);

    useEffect(() => {
      if (!isOpen || !dropdownRef.current) return;
      const dropdown = dropdownRef.current;
      const updateScrollIndicators = () => {
        const canScrollUp = dropdown.scrollTop > 0;
        const canScrollDown = dropdown.scrollTop < (dropdown.scrollHeight - dropdown.clientHeight);
        dropdown.classList.toggle("can-scroll-up", canScrollUp);
        dropdown.classList.toggle("can-scroll-down", canScrollDown);
      };
      updateScrollIndicators();
      dropdown.addEventListener("scroll", updateScrollIndicators);
      return () => dropdown.removeEventListener("scroll", updateScrollIndicators);
    }, [isOpen]);

    const prefix = classNamePrefix || "dropdown";
    const dropdownClassName = `${prefix} ${variant ? `${prefix}--${variant}` : ""} ${position ? `${prefix}--${position}` : ""} ${className}`.trim();
    const isNoResults = items.length === 0 || (isEmptyItem && items.every(isEmptyItem));
    const noResultsContent = onNoResults ? onNoResults() : noResultsText;

    if (!isOpen) return null;

    return (
      <div
        ref={dropdownRef}
        className={`${dropdownClassName} ${highlightedIndex !== null ? `${prefix}--has-highlight` : ""}`}
        role="listbox"
        aria-activedescendant={highlightedIndex !== null ? `dropdown-item-${highlightedIndex}` : undefined}
        onKeyDown={handleCombinedKeyDown}
        onFocus={handleDropdownFocus}
        onMouseEnter={handleDropdownMouseEnter}
        onMouseLeave={handleDropdownMouseLeave}
        onMouseMove={handleDropdownMouseMove}
        aria-label={ariaLabel}
        tabIndex={-1}
      >
        {isNoResults ? (
          <div className={`${prefix}__no-results`} role="option">
            {noResultsContent}
          </div>
        ) : (
          <>
            {items.map((item, index) => (
              <React.Fragment key={defaultGetItemKey(item, index)}>
                {shouldRenderDivider && index > 0 && shouldRenderDivider(index - 1) && (
                  <div className={`${prefix}__divider`} role="separator" />
                )}
                <div
                  id={`dropdown-item-${index}`}
                  ref={(el) => (itemsRef.current[index] = el)}
                  onClick={() => handleItemClick(index)}
                  onMouseEnter={(e) => handleItemMouseEnter(index, e)}
                  className={`${prefix}__item ${index === highlightedIndex ? `${prefix}--highlighted` : ""}`}
                  data-highlighted={index === highlightedIndex ? "true" : "false"}
                  role="option"
                  tabIndex={-1}
                >
                  {renderItem(item, { isHighlighted: index === highlightedIndex })}
                </div>
              </React.Fragment>
            ))}
            {hasMore && (
              <div
                onClick={onLoadMore}
                onMouseEnter={(e) => handleItemMouseEnter(items.length, e)}
                className={`${prefix}__load-more ${highlightedIndex === items.length ? `${prefix}--highlighted` : ""}`}
                role="option"
                aria-label={loadMoreText}
                tabIndex={-1}
                ref={(el) => el && (itemsRef.current[items.length] = el)}
              >
                {loadMoreText}
              </div>
            )}
          </>
        )}
      </div>
    );
  }
);

export default BaseDropdown;