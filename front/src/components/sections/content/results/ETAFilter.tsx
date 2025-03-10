// File: src/components/sections/content/results/ETAFilter.tsx
// Description: Component for filtering ETA with animated dropdown arrow using BEM methodology

import React, { useState } from "react";
import BaseDropdown from "@/components/elements/BaseDropdown";
import { getAnimatedArrow } from "@/utils/animateArrow";

const etaFilterOptions = [
  { value: "all", label: "All" },
  { value: "1", label: "up to 1 hr" },
  { value: "2", label: "up to 2 hrs" },
  { value: "5", label: "up to 5 hrs" },
];

const ETAFilter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedETA, setSelectedETA] = useState("all");

  // Render each dropdown item using BEM class
  const renderETAItem = (item: any, meta: { isHighlighted: boolean }) => (
    <div className="dropdown-eta__item" style={{ padding: "8px 12px" }}>
      <span>{item.label}</span>
    </div>
  );

  const toggleDropdown = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <div className="dropdown-eta">
      <button
        onClick={toggleDropdown}
        className="dropdown-eta__toggle"
        style={{ display: "flex", alignItems: "center" }}
      >
        {selectedETA === "all" 
          ? "All" 
          : etaFilterOptions.find(opt => opt.value === selectedETA)?.label}
        {getAnimatedArrow(isOpen)}
      </button>
      {isOpen && (
        <BaseDropdown
          items={etaFilterOptions}
          isOpen={isOpen}
          onSelect={(item) => {
            setSelectedETA(item.value);
            setIsOpen(false);
          }}
          renderItem={renderETAItem}
        />
      )}
    </div>
  );
};

export default ETAFilter;
