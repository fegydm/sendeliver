// File: src/domains/orders/components/app.lbase-lfilter.comp.tsx
// Last modified: Updated to correctly position dropdowns in local container

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
  getSelectedLabel?: (value: string) => string; // Custom formatter for selected value display
}

const BaseFilter = forwardRef<
  { reset: () => void; isOpen: () => boolean; isFiltered: () => boolean },
  BaseFilterProps<any>
>(
  (
    {
      data,
      label,
      options = [],
      selected,
      sortDirection,
      isOpen,
      onSortClick,
      onToggleClick,
      onFilter,
      onOptionSelect,
      filterFn,
      getSelectedLabel,
    },
    ref
  ) => {
    // Use custom formatted label if provided, otherwise find from options
    const selectedLabel = getSelectedLabel
      ? getSelectedLabel(selected)
      : options.find((opt) => opt.value === selected)?.label || "all ...";

    const headerRef = useRef<HTMLDivElement>(null);
    const dropdownIdRef = useRef(
      `dropdown-${label.replace(/\s+/g, "-").toLowerCase()}-${Math.random()
        .toString(36)
        .substring(2, 9)}`
    );
    const [dropdownPosition, setDropdownPosition] = useState({
      top: "0px",
      left: "0px",
      width: "180px", // Default wider width
      display: "none",
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

    // Calculate the width needed for the widest option
    const calculateMaxWidth = () => {
      // Create a temporary span to measure text width
      const tempSpan = document.createElement("span");
      tempSpan.style.visibility = "hidden";
      tempSpan.style.position = "absolute";
      tempSpan.style.whiteSpace = "nowrap";
      tempSpan.style.font = "14px Arial, sans-serif"; // Match your dropdown font
      tempSpan.style.padding = "8px 12px"; // Match your dropdown padding

      document.body.appendChild(tempSpan);

      let maxWidth = 120; // Minimum width

      options.forEach((option) => {
        tempSpan.textContent = option.label;
        const width = tempSpan.offsetWidth;

        // Add extra width for icons if present
        const iconWidth = option.icon ? 28 : 0; // icon width + margin

        maxWidth = Math.max(maxWidth, width + iconWidth);
      });

      document.body.removeChild(tempSpan);

      // Add some padding to prevent a tight fit
      return `${maxWidth + 20}px`;
    };

    // Check if the dropdown container exists
    useEffect(() => {
      const container = document.getElementById("result-table-dropdown-container");
      if (!container) {
        console.warn(
          'Dropdown container (#result-table-dropdown-container) not found. Please add it in ResultTable component.'
        );
      }
    }, []);

    // Update the dropdown position when it opens
    useEffect(() => {
      if (isOpen && headerRef.current) {
        // Get dropdown container element
        const container = document.getElementById("result-table-dropdown-container");
        if (!container) {
          console.warn("[BaseFilter] Dropdown container not found. Make sure it exists in the DOM.");
          return;
        }

        // Get header position relative to the viewport
        const headerRect = headerRef.current.getBoundingClientRect();
        
        // Get container position relative to the viewport
        const containerRect = container.getBoundingClientRect();
        
        // Calculate relative position of dropdown within the container
        const top = headerRect.bottom - containerRect.top;
        
        // Calculate left position aligned with the header
        let left = headerRect.left - containerRect.left;
        
        // Get calculated width
        const calculatedWidth = calculateMaxWidth();
        const numericWidth = parseInt(calculatedWidth, 10);
        
        // Ensure the dropdown doesn't go off-screen on the right
        const viewportWidth = window.innerWidth;
        if (headerRect.left + numericWidth > viewportWidth) {
          left = Math.max(0, viewportWidth - containerRect.left - numericWidth - 10);
        }
        
        // Set the position of the dropdown
        setDropdownPosition({
          top: `${top}px`,
          left: `${left}px`,
          width: calculatedWidth,
          display: "block",
        });
      } else {
        setDropdownPosition((prev) => ({
          ...prev,
          display: "none",
        }));
      }
    }, [isOpen, options]);

    // Create, update, or remove the dropdown element in the DOM
    useEffect(() => {
      const dropdownId = dropdownIdRef.current;
      const container = document.getElementById("result-table-dropdown-container");
      if (!container) {
        console.warn("[BaseFilter] Dropdown container not found for filter:", label);
        return;
      }

      // If the filter is not open, remove the dropdown element if it exists
      if (!isOpen) {
        const existingDropdown = document.getElementById(dropdownId);
        if (existingDropdown) {
          container.removeChild(existingDropdown);
        }
        return;
      }

      // If open and the dropdown element doesn't exist, create it
      let dropdownElement = document.getElementById(dropdownId);
      if (!dropdownElement) {
        dropdownElement = document.createElement("div");
        dropdownElement.id = dropdownId;
        dropdownElement.className = "dropfilter__content";

        // Set initial styles with absolute positioning
        Object.assign(dropdownElement.style, {
          position: "absolute",
          zIndex: "3000",
          display: "block",
          backgroundColor: "#fff",
          boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
          border: "1px solid #ddd",
          borderRadius: "4px",
          maxHeight: "300px",
          overflowY: "auto",
        });

        container.appendChild(dropdownElement);
      }

      // Update dropdown element's position and display style based on state
      Object.assign(dropdownElement.style, {
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        width: dropdownPosition.width,
        display: dropdownPosition.display,
      });

      // If filter is open, update the content of the dropdown
      if (isOpen) {
        dropdownElement.innerHTML = "";
        options.forEach((option, index) => {
          const item = document.createElement("div");
          item.className = `dropfilter__item ${
            index === 0 ? "dropfilter__item--grey" : ""
          }`;

          if (option.icon) {
            const iconContainer = document.createElement("div");
            iconContainer.className = "dropfilter__item-with-icon";

            const icon = document.createElement("img");
            icon.src = option.icon;
            icon.alt = "";
            icon.className = "dropfilter__item-icon";
            icon.style.height = "18px";
            icon.style.width = "auto";
            icon.style.verticalAlign = "middle";
            iconContainer.appendChild(icon);

            if (option.label.includes("(")) {
              const spanElement = document.createElement("span");
              const greyPart = document.createElement("span");
              greyPart.style.color = "grey";
              greyPart.textContent = option.label.substring(0, option.label.indexOf(")") + 1);

              const remainingText = document.createTextNode(
                option.label.substring(option.label.indexOf(")") + 1)
              );

              spanElement.appendChild(greyPart);
              spanElement.appendChild(remainingText);
              iconContainer.appendChild(spanElement);
            } else {
              const textNode = document.createTextNode(option.label);
              const span = document.createElement("span");
              span.appendChild(textNode);
              iconContainer.appendChild(span);
            }

            item.appendChild(iconContainer);
          } else {
            item.textContent = option.label;
          }

          // Capture current option value and add click event handler
          const optionValue = option.value;
          item.addEventListener("click", function () {
            handleOptionSelect(optionValue);
          });

          dropdownElement.appendChild(item);
        });

        // Add click-outside handler to close the dropdown
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

        document.addEventListener("mousedown", handleOutsideClick);
        return () => {
          document.removeEventListener("mousedown", handleOutsideClick);
        };
      }
      
      // Cleanup: remove our dropdown element when component unmounts
      return () => {
        if (container) {
          const existingDropdown = document.getElementById(dropdownId);
          if (existingDropdown && container.contains(existingDropdown)) {
            try {
              container.removeChild(existingDropdown);
            } catch (error) {
              console.log("Dropdown already removed:", dropdownId);
            }
          }
        }
      };
    }, [isOpen, options, dropdownPosition, handleOptionSelect, onToggleClick, label]);

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
  }
);

BaseFilter.displayName = "BaseFilter";

export default BaseFilter;