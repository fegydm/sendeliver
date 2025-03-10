// File: src/components/sections/content/results/TypeFilter.tsx
// Description: Component for filtering types with animated dropdown arrow

import React, { useState } from "react";
import BaseDropdown from "@/components/elements/BaseDropdown";
import { getAnimatedArrow } from "@/utils/animateArrow"; // external function for arrow animation
import truckIcon from "src/assets/truck1-1.svg"; // example image

// Map database values to display labels
// Database values: LKW, Sólo, Dodávka, Avia
// Mapped labels: truck 40t., rigid 12t., van 3,5t., lorry 7,5t.
const typeFilterOptions = [
  { value: "LKW", label: "truck 40t.", icon: truckIcon },
  { value: "Sólo", label: "rigid 12t.", icon: truckIcon },
  { value: "Dodávka", label: "van 3,5t.", icon: truckIcon },
  { value: "Avia", label: "lorry 7,5t.", icon: truckIcon },
];

const TypeFilter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  // 'selectedType' stores the database value (e.g., "LKW")
  const [selectedType, setSelectedType] = useState("all");

  // Function to render each dropdown item
  const renderTypeItem = (item: any, meta: { isHighlighted: boolean }) => (
    <div style={{ display: "flex", alignItems: "center" }}>
      {/* Display the icon with fixed width */}
      <img src={item.icon} alt={item.label} style={{ width: "24px", marginRight: "8px" }} />
      <span>{item.label}</span>
    </div>
  );

  // Toggle dropdown open state
  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div>
      <button
        onClick={toggleDropdown}
        style={{ display: "flex", alignItems: "center" }}
      >
        {selectedType === "all" ? "All Types" : selectedType} {/* Display selected filter */}
        {/* Use external function to render animated arrow */}
        {getAnimatedArrow(isOpen)}
      </button>
      {isOpen && (
        <BaseDropdown
          items={[{ value: "all", label: "All Types", icon: truckIcon }, ...typeFilterOptions]}
          isOpen={isOpen}
          onSelect={(item) => {
            setSelectedType(item.value);
            setIsOpen(false);
          }}
          renderItem={renderTypeItem}
        />
      )}
    </div>
  );
};

export default TypeFilter;
