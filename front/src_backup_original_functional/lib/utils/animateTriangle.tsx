// File: src/utils/animateTriangle.tsx
// Last modified: March 13, 2025
import React from "react";

// Function to render an animated triangle SVG based on sort direction
export const getAnimatedTriangle = (
  direction: "asc" | "desc" | "none",
  className?: string,
  onClick?: (e: React.MouseEvent) => void
): JSX.Element => {
  return (
    <svg
      className={className}
      onClick={onClick}
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {direction === "asc" && <path d="M6 2L10 8H2L6 2Z" fill="currentColor" />}
      {direction === "desc" && <path d="M6 10L2 4H10L6 10Z" fill="currentColor" />}
      {direction === "none" && (
        <>
          {/* Upper triangle (larger, pointing up, positioned higher) */}
          <path d="M6 2L9 5H3L6 2Z" fill="gray" />
          {/* Lower triangle (larger, pointing down, positioned lower) */}
          <path d="M6 10L3 7H9L6 10Z" fill="gray" />
        </>
      )}
    </svg>
  );
};