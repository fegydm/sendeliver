// File: src/components/sections/content/results/DistanceFilter.tsx
// Description: Component for filtering distance with animated dropdown arrow using BEM methodology.
// It filters records so that "up to 20km" returns records with distance less than 20 km.

import React, { useState, useEffect } from "react";
import BaseDropdown from "@/components/elements/BaseDropdown";
import { getAnimatedArrow } from "@/utils/animateArrow";

// Filter options for distance
const distanceFilterOptions = [
  { value: "all", label: "All" },
  { value: "20", label: "up to 20km" },
  { value: "50", label: "up to 50km" },
  { value: "100", label: "up to 100km" },
  { value: "200", label: "up to 200km" },
];

// Define the minimal interface for a record containing distance
interface RecordData {
  distance: string; // e.g., "15.4 km"
  // other properties can be added here
}

interface DistanceFilterProps {
  data: RecordData[]; // Full set of records to filter
  onFilter: (filtered: RecordData[]) => void; // Callback returning filtered records
}

const DistanceFilter: React.FC<DistanceFilterProps> = ({ data, onFilter }) => {
  const [isOpen, setIsOpen] = useState(false);
  // 'selectedDistance' stores the selected filter value, default "all" means no filter applied
  const [selectedDistance, setSelectedDistance] = useState("all");

  // Filtering logic: if "all", return all records; otherwise, filter those with distance < threshold
  const filterData = () => {
    if (selectedDistance === "all") {
      return data;
    }
    const threshold = parseFloat(selectedDistance);
    return data.filter(record => {
      // Assuming record.distance is like "15.4 km"
      const distanceNum = parseFloat(record.distance);
      return distanceNum < threshold;
    });
  };

  // Call onFilter whenever selectedDistance or data changes
  useEffect(() => {
    const filtered = filterData();
    onFilter(filtered);
  }, [selectedDistance, data]);

  // Function to render each dropdown item using BEM classes
  const renderDistanceItem = (item: any, meta: { isHighlighted: boolean }) => (
    <div className="dropdown-distance__item" style={{ padding: "8px 12px" }}>
      <span>{item.label}</span>
    </div>
  );

  // Toggle dropdown open state
  const toggleDropdown = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <div className="dropdown-distance">
      <button
        onClick={toggleDropdown}
        className="dropdown-distance__toggle"
        style={{ display: "flex", alignItems: "center" }}
      >
        {selectedDistance === "all" 
          ? "All" 
          : distanceFilterOptions.find(opt => opt.value === selectedDistance)?.label}
        {getAnimatedArrow(isOpen)}
      </button>
      {isOpen && (
        <BaseDropdown
          items={distanceFilterOptions}
          isOpen={isOpen}
          onSelect={(item) => {
            setSelectedDistance(item.value);
            setIsOpen(false);
          }}
          renderItem={renderDistanceItem}
        />
      )}
    </div>
  );
};

export default DistanceFilter;
