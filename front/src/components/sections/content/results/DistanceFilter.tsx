import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { getAnimatedArrow } from "@/utils/animateArrow";
import { SenderResultData } from "./result-table.component";

interface DistanceFilterProps {
  data: SenderResultData[];
  onFilter: (filtered: SenderResultData[]) => void;
}

const distanceFilterOptions = [
  { value: "all", label: "all ..." },
  { value: "20", label: "up to 20km" },
  { value: "50", label: "up to 50km" },
  { value: "100", label: "up to 100km" },
  { value: "200", label: "up to 200km" },
];

const DistanceFilter = forwardRef<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }, DistanceFilterProps>(
  ({ data, onFilter }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDistance, setSelectedDistance] = useState("all");

    // Filter data based on selected distance
    const filterData = () => {
      if (selectedDistance === "all") return data;
      const threshold = parseFloat(selectedDistance);
      return data.filter(record => {
        const distanceNum = parseFloat(record.distance);
        return !isNaN(distanceNum) && distanceNum < threshold;
      });
    };

    useEffect(() => {
      const filtered = filterData();
      onFilter(filtered);
    }, [data, selectedDistance]);

    useImperativeHandle(ref, () => ({
      reset: () => setIsOpen(false), // Only closes dropdown, keeps selection
      isOpen: () => isOpen,
      isFiltered: () => selectedDistance !== "all",
    }));

    return (
      <div className="dropdown-distance">
        <div
          className="dropdown-distance__toggle"
          onClick={() => setIsOpen(prev => !prev)}
        >
          <span>
            {selectedDistance === "all"
              ? "Distance"
              : distanceFilterOptions.find(opt => opt.value === selectedDistance)?.label}
          </span>
          {getAnimatedArrow(isOpen)}
        </div>
        {isOpen && (
          <div className="dropdown-distance__content">
            {distanceFilterOptions.map((item, index) => (
              <div
                key={item.value}
                className={`dropdown-distance__item ${index === 0 ? "dropdown__item--grey" : ""}`}
                onClick={() => {
                  setSelectedDistance(item.value);
                  setIsOpen(false);
                }}
              >
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

DistanceFilter.displayName = "DistanceFilter";

export default DistanceFilter;