// File: src/components/sections/content/results/BaseFilter.tsx
// Last modified: March 12, 2025
import { forwardRef, useImperativeHandle } from "react";
import { getAnimatedArrow } from "@/utils/animateArrow";
import { getAnimatedTriangle } from "@/utils/animateTriangle";

interface BaseFilterProps<T> {
  data: T[];
  label: string;
  options?: { value: string; label: string }[];
  selected: string;
  sortDirection: "asc" | "desc" | "none";
  isOpen: boolean;
  onSortClick: (e: React.MouseEvent) => void;
  onToggleClick: () => void;
  onOptionSelect: (value: string) => void;
}

const BaseFilter = forwardRef<
  { reset: () => void; isOpen: () => boolean; isFiltered: () => boolean },
  BaseFilterProps<any>
>(({ data, label, options = [], selected, sortDirection, isOpen, onSortClick, onToggleClick, onOptionSelect }, ref) => {
  const selectedLabel = options.find(opt => opt.value === selected)?.label || "all ...";

  useImperativeHandle(ref, () => ({
    reset: () => {}, // Rodič to spravuje
    isOpen: () => isOpen,
    isFiltered: () => selected !== "all",
  }));

  return (
    <>
      {getAnimatedTriangle(sortDirection, "sort-icon", onSortClick)}
      <span className="column-label">{label}</span>
      {options.length > 0 && getAnimatedArrow(isOpen, "drop-icon")}
      {selected !== "all" && <span className="filter-value">{selectedLabel}</span>}
      {isOpen && options.length > 0 && (
        <div className="dropfilter__content">
          {options.map((option, index) => (
            <div
              key={option.value}
              className={`dropfilter__item ${index === 0 ? "dropfilter__item--grey" : ""}`}
              onClick={() => onOptionSelect(option.value)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </>
  );
});

BaseFilter.displayName = "BaseFilter";

export default BaseFilter;