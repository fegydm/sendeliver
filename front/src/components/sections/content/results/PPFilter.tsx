// File: src/components/sections/content/results/PPFilter.tsx
// Description: Component for filtering PP with animated dropdown arrow using BEM methodology

import React, { useState } from "react";
import BaseDropdown from "@/components/elements/BaseDropdown";
import { getAnimatedArrow } from "@/utils/animateArrow";

const ppFilterOptions = [
  { value: "all", label: "All" },
  { value: "verified", label: "verified" },
];

const PPFilter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPP, setSelectedPP] = useState("all");

  // Render each dropdown item using BEM class
  const renderPPItem = (item: any, meta: { isHighlighted: boolean }) => (
    <div className="dropdown-pp__item" style={{ padding: "8px 12px" }}>
      <span>{item.label}</span>
    </div>
  );

  const toggleDropdown = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <div className="dropdown-pp">
      <button
        onClick={toggleDropdown}
        className="dropdown-pp__toggle"
        style={{ display: "flex", alignItems: "center" }}
      >
        {selectedPP === "all" 
          ? "All" 
          : ppFilterOptions.find(opt => opt.value === selectedPP)?.label}
        {getAnimatedArrow(isOpen)}
      </button>
      {isOpen && (
        <BaseDropdown
          items={ppFilterOptions}
          isOpen={isOpen}
          onSelect={(item) => {
            setSelectedPP(item.value);
            setIsOpen(false);
          }}
          renderItem={renderPPItem}
        />
      )}
    </div>
  );
};

export default PPFilter;
