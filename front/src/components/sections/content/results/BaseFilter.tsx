// File: src/components/sections/content/results/BaseFilter.tsx
// Last modified: March 13, 2025 - Added icon support in dropdown items

import { forwardRef, useImperativeHandle } from "react";
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

  return (
    <>
      <div className="header-cell__first-row">
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
      {isOpen && options.length > 0 && (
        <div className="dropfilter__content">
          {options.map((option, index) => (
            <div
              key={option.value}
              className={`dropfilter__item ${index === 0 ? "dropfilter__item--grey" : ""}`}
              onClick={() => handleOptionSelect(option.value)}
            >
              {option.icon ? (
                <div className="dropfilter__item-with-icon">
                  <img src={option.icon} alt="" className="dropfilter__item-icon" />
                  {option.label.includes("(") ? (
                    <span>
                      <span style={{ color: "grey" }}>{option.label.substring(0, option.label.indexOf(")") + 1)}</span>
                      {option.label.substring(option.label.indexOf(")") + 1)}
                    </span>
                  ) : (
                    <span>{option.label}</span>
                  )}
                </div>
              ) : (
                option.label
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
});

BaseFilter.displayName = "BaseFilter";

export default BaseFilter;