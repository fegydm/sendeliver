// File: src/components/sections/content/results/RatingFilter.tsx
// Description: Component for filtering Rating with animated dropdown arrow using BEM methodology

import React, { useState } from "react";
import BaseDropdown from "@/components/elements/BaseDropdown";
import { getAnimatedArrow } from "@/utils/animateArrow";

const ratingFilterOptions = [
  { value: "4.5", label: "4,5 and more" },
  { value: "4.0", label: "4,0 and more" },
  { value: "3.5", label: "3,5 and more" },
];

const RatingFilter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  // When nothing je vybraté, zobrazíme placeholder text, napr. "Select Rating"
  const [selectedRating, setSelectedRating] = useState("");

  // Render each dropdown item using BEM class
  const renderRatingItem = (item: any, meta: { isHighlighted: boolean }) => (
    <div className="dropdown-rating__item" style={{ padding: "8px 12px" }}>
      <span>{item.label}</span>
    </div>
  );

  const toggleDropdown = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <div className="dropdown-rating">
      <button
        onClick={toggleDropdown}
        className="dropdown-rating__toggle"
        style={{ display: "flex", alignItems: "center" }}
      >
        {selectedRating === "" 
          ? "Select Rating" 
          : ratingFilterOptions.find(opt => opt.value === selectedRating)?.label}
        {getAnimatedArrow(isOpen)}
      </button>
      {isOpen && (
        <BaseDropdown
          items={ratingFilterOptions}
          isOpen={isOpen}
          onSelect={(item) => {
            setSelectedRating(item.value);
            setIsOpen(false);
          }}
          renderItem={renderRatingItem}
        />
      )}
    </div>
  );
};

export default RatingFilter;
