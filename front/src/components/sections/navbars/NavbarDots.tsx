// ./front/src/components/navbars/NavbarDots.tsx
import { FC } from "react";
import type { NavbarDotsProps } from "@/types/dots";

const NavbarDots: FC<NavbarDotsProps> = ({ topDots, bottomDots, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="navbar-dots"
      aria-label="Open dots menu"
      title="Dot"
    >
      D {/* Visible text for the button */}
      <div className="navbar-dots-container">
        <div className="navbar-dots-row">
          {topDots.map((color, index) => (
            <div
              key={`top-${index}`}
              className="navbar-dots-item"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <div className="navbar-dots-row">
          {bottomDots.map((color, index) => (
            <div
              key={`bottom-${index}`}
              className="navbar-dots-item"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </button>
  );
};

export default NavbarDots;
