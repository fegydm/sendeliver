// File: src/components/sections/content/results/BaseFilter.tsx

import { forwardRef, useImperativeHandle, useRef, useEffect, useState } from "react";
import { getAnimatedArrow } from "@/utils/animateArrow";
import { getAnimatedTriangle } from "@/utils/animateTriangle";

interface BaseFilterProps<T> {
  data: T[];
  label: string;
  options?: { value: string; label: string; icon?: string | null }[];
  selected: string;
  sortDirection: "asc" | "desc" | "none";
  isOpen: boolean;
  onSortClick: (e: React.MouseEvent) => void;
  onToggleClick: (e: React.MouseEvent) => void;
  onFilter: (filtered: T[]) => void;
  onOptionSelect: (value: string) => void;
  filterFn?: (data: T[], selected: string) => T[];
}

const BaseFilter = forwardRef<
  { reset: () => void; isOpen: () => boolean; isFiltered: () => boolean },
  BaseFilterProps<any>
>(({ data, label, options = [], selected, sortDirection, isOpen, onSortClick, onToggleClick, onFilter, onOptionSelect, filterFn }, ref) => {
  const selectedLabel = options.find(opt => opt.value === selected)?.label || "all ...";
  const headerRef = useRef<HTMLDivElement>(null);
  const dropdownIdRef = useRef(`dropdown-${label.replace(/\s+/g, '-').toLowerCase()}-${Math.random().toString(36).substring(2, 9)}`);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: '0px',
    left: '0px',
    width: '120px',
    display: 'none',
  });

  useImperativeHandle(ref, () => ({
    reset: () => onFilter(data),
    isOpen: () => isOpen,
    isFiltered: () => selected !== "all",
  }));

  const handleOptionSelect = (value: string) => {
    if (value === "all") {
      onFilter(data);
    } else if (filterFn) {
      const filtered = filterFn(data, value);
      onFilter(filtered);
    }
    onOptionSelect(value);
  };

  // Create and manage container for all dropdowns
  useEffect(() => {
    // Make sure we have a container for our dropdowns
    let container = document.getElementById('filter-dropdowns-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'filter-dropdowns-container';
      document.body.appendChild(container);
    }
    
    // No cleanup needed for the container - it stays for the life of the app
  }, []);

  // Handle position update when dropdown opens/closes
  useEffect(() => {
    if (isOpen && headerRef.current) {
      const rect = headerRef.current.getBoundingClientRect();
      const width = Math.max(rect.width, 120);
      
      // Handle potential overflow to the right
      const viewportWidth = window.innerWidth;
      let left = rect.left;
      if (left + width > viewportWidth) {
        left = Math.max(0, viewportWidth - width - 10);
      }
      
      setDropdownPosition({
        top: `${rect.bottom}px`,
        left: `${left}px`,
        width: `${width}px`,
        display: 'block',
      });
    } else {
      setDropdownPosition(prev => ({
        ...prev,
        display: 'none'
      }));
    }
  }, [isOpen]);

  // Create/update/remove dropdown element in DOM
  useEffect(() => {
    const dropdownId = dropdownIdRef.current;
    const container = document.getElementById('filter-dropdowns-container');
    
    // Create new dropdown element
    let dropdownElement = document.getElementById(dropdownId);
    if (!dropdownElement && container) {
      dropdownElement = document.createElement('div');
      dropdownElement.id = dropdownId;
      dropdownElement.className = 'dropfilter__content';
      
      // Set initial styles
      Object.assign(dropdownElement.style, {
        position: 'fixed',
        zIndex: '9999',
        display: 'none',
        backgroundColor: '#fff',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        border: '1px solid #ddd',
        borderRadius: '4px',
        maxHeight: '300px',
        overflowY: 'auto'
      });
      
      container.appendChild(dropdownElement);
    }
    
    // Update dropdown content and position
    if (dropdownElement) {
      // Update position
      Object.assign(dropdownElement.style, {
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        width: dropdownPosition.width,
        display: dropdownPosition.display
      });
      
      // Only update content if dropdown is visible
      if (isOpen) {
        // Clear current content
        dropdownElement.innerHTML = '';
        
        // Add new options
        options.forEach((option, index) => {
          const item = document.createElement('div');
          item.className = `dropfilter__item ${index === 0 ? "dropfilter__item--grey" : ""}`;
          
          if (option.icon) {
            const iconContainer = document.createElement('div');
            iconContainer.className = 'dropfilter__item-with-icon';
            
            const icon = document.createElement('img');
            icon.src = option.icon;
            icon.alt = '';
            icon.className = 'dropfilter__item-icon';
            iconContainer.appendChild(icon);
            
            if (option.label.includes("(")) {
              const spanElement = document.createElement('span');
              const greyPart = document.createElement('span');
              greyPart.style.color = 'grey';
              greyPart.textContent = option.label.substring(0, option.label.indexOf(")") + 1);
              
              const remainingText = document.createTextNode(
                option.label.substring(option.label.indexOf(")") + 1)
              );
              
              spanElement.appendChild(greyPart);
              spanElement.appendChild(remainingText);
              iconContainer.appendChild(spanElement);
            } else {
              const textNode = document.createTextNode(option.label);
              const span = document.createElement('span');
              span.appendChild(textNode);
              iconContainer.appendChild(span);
            }
            
            item.appendChild(iconContainer);
          } else {
            item.textContent = option.label;
          }
          
          // Use closure to capture current option value
          const optionValue = option.value;
          item.addEventListener('click', function() {
            handleOptionSelect(optionValue);
          });
          
          dropdownElement.appendChild(item);
        });
        
        // Add click outside handler
        const handleOutsideClick = (e: MouseEvent) => {
          if (
            dropdownElement && 
            !dropdownElement.contains(e.target as Node) &&
            headerRef.current && 
            !headerRef.current.contains(e.target as Node)
          ) {
            onToggleClick(e as unknown as React.MouseEvent);
          }
        };
        
        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
          document.removeEventListener('mousedown', handleOutsideClick);
        };
      }
    }
    
    // Cleanup function when component unmounts
    return () => {
      const container = document.getElementById('filter-dropdowns-container');
      const dropdownElement = document.getElementById(dropdownId);
      
      if (container && dropdownElement && container.contains(dropdownElement)) {
        try {
          container.removeChild(dropdownElement);
        } catch (error) {
          console.log('Dropdown already removed:', dropdownId);
        }
      }
    };
  }, [isOpen, options, dropdownPosition, handleOptionSelect, onToggleClick]);

  return (
    <>
      <div className="header-cell__first-row" ref={headerRef}>
        {getAnimatedTriangle(sortDirection, "sort-icon", onSortClick)}
        <span className="column-label">{label}</span>
        {options.length > 0 && (
          <div className="drop-icon-wrapper">
            {getAnimatedArrow(isOpen, "drop-icon", onToggleClick)}
          </div>
        )}
      </div>
      {selected !== "all" && (
        <div className="header-cell__second-row">
          <span className="filter-value">{selectedLabel}</span>
        </div>
      )}
    </>
  );
});

BaseFilter.displayName = "BaseFilter";

export default BaseFilter;