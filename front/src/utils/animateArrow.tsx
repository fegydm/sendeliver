// File: src/utils/animateArrow.tsx
// Description: External function to render an animated dropdown arrow

import React from "react";

// Returns an SVG arrow element with animated rotation based on the open state.
// The arrow is larger (16px) but with minimal left margin to take up less space next to the header text.
export const getAnimatedArrow = (isOpen: boolean) => {
  const style = {
    display: "inline-block",
    transition: "transform 0.3s ease",
    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
    marginLeft: "0px", // minimal left margin
  };

  return (
    <svg style={style} width="16px" height="16px" viewBox="0 0 24 24">
      <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};
