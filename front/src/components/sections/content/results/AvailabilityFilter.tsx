// File: src/components/sections/content/results/AvailabilityFilter.tsx
// Description: Component for filtering availability with animated dropdown arrow using BEM methodology

import React, { useState } from "react";
import BaseDropdown from "@/components/elements/BaseDropdown";
import { getAnimatedArrow } from "@/utils/animateArrow";

const availabilityFilterOptions = [
  { value: "all", label: "All" },
  { value: "passed", label: "passed" },
  { value: "today", label: "today" },
  { value: "tomorrow", label: "tomorrow" },
];

const AvailabilityFilter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAvailability, setSelectedAvailability] = useState("all");

  // Function to render each dropdown item
  const renderAvailabilityItem = (item: any, meta: { isHighlighted: boolean }) => (
    <div className="dropdown-availability__item" style={{ padding: "8px 12px" }}>
      <span>{item.label}</span>
    </div>
  );

  // Toggle dropdown open state
  const toggleDropdown = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <div className="dropdown-availability">
      <button
        onClick={toggleDropdown}
        className="dropdown-availability__toggle"
        style={{ display: "flex", alignItems: "center" }}
      >
        {selectedAvailability === "all"
          ? "All"
          : availabilityFilterOptions.find(opt => opt.value === selectedAvailability)?.label}
        {getAnimatedArrow(isOpen)}
      </button>
      {isOpen && (
        <BaseDropdown
          items={availabilityFilterOptions}
          isOpen={isOpen}
          onSelect={(item) => {
            setSelectedAvailability(item.value);
            setIsOpen(false);
          }}
          renderItem={renderAvailabilityItem}
        />
      )}
    </div>
  );
};

export default AvailabilityFilter;
