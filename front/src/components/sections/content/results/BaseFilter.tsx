import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { getAnimatedArrow } from "@/utils/animateArrow";

interface BaseFilterProps<T> {
  data: T[];
  onFilter: (filtered: T[]) => void;
  label: string;
  options: { value: string; label: string }[];
  filterFn: (data: T[], selected: string) => T[];
}

const BaseFilter = forwardRef<
  { reset: () => void; isOpen: () => boolean; isFiltered: () => boolean },
  BaseFilterProps<any>
>(({ data, onFilter, label, options, filterFn }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("all");

  useEffect(() => {
    const filtered = filterFn(data, selected);
    onFilter(filtered);
  }, [data, selected, filterFn, onFilter]);

  useImperativeHandle(ref, () => ({
    reset: () => setIsOpen(false),
    isOpen: () => isOpen,
    isFiltered: () => selected !== "all",
  }));

  return (
    <div className={`dropdown-${label.toLowerCase()}`}>
      <div
        className={`dropdown-${label.toLowerCase()}__toggle`}
        onClick={() => setIsOpen(prev => !prev)}
      >
        <span>{selected === "all" ? label : options.find(opt => opt.value === selected)?.label || label}</span>
        {getAnimatedArrow(isOpen)}
      </div>
      {isOpen && (
        <div className={`dropdown-${label.toLowerCase()}__content`}>
          {options.map((option, index) => (
            <div
              key={option.value}
              className={`dropdown-${label.toLowerCase()}__item ${index === 0 ? "dropdown__item--grey" : ""}`}
              onClick={() => {
                setSelected(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

BaseFilter.displayName = "BaseFilter";

export default BaseFilter;