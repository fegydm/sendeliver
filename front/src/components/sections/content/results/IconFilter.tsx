// File: src/components/sections/content/results/IconFilter.tsx
// Description: Component for Icon filter dropdown options using BEM methodology.
// It renders three options:
// - Green: displays a green circle, grey text "(green)" and black text "available now"
// - Yellow: displays a yellow circle, grey text "(yellow)" and black text "available on time"
// - Orange: displays an orange circle, grey text "(orange)" and black text "available after loading time"

import React from "react";

export interface IconFilterOption {
  value: string; // "G", "Y", "O"
  label: string;
}

interface IconFilterProps {
  onSelect: (value: string) => void;
}

const IconFilter: React.FC<IconFilterProps> = ({ onSelect }) => {
  const options = [
    {
      value: "G",
      circleColor: "green",
      grayText: "(green)",
      description: "available now",
    },
    {
      value: "Y",
      circleColor: "yellow",
      grayText: "(yellow)",
      description: "available on time",
    },
    {
      value: "O",
      circleColor: "orange",
      grayText: "(orange)",
      description: "available after loading time",
    },
  ];

  return (
    <div className="dropdown-icon__content">
      {options.map((option) => (
        <div
          key={option.value}
          className="dropdown-icon__item"
          onClick={() => onSelect(option.value)}
          style={{
            display: "flex",
            alignItems: "center",
            padding: "8px 12px",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              backgroundColor: option.circleColor,
              marginRight: "8px",
            }}
          />
          <span style={{ color: "grey", marginRight: "4px" }}>
            {option.grayText}
          </span>
          <span style={{ color: "black" }}>{option.description}</span>
        </div>
      ))}
    </div>
  );
};

export default IconFilter;
