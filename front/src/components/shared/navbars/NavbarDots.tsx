// File: front/src/components/shared/navbars/NavbarDots.tsx
// Last action: Refactored component to use BEM class names.

import { FC } from "react";
import type { NavbarDotsProps } from "@/types/dots";
import './NavbarDots.css';

const NavbarDots: FC<NavbarDotsProps> = ({ topDots, bottomDots, onClick }) => {
  return (
    <button onClick={onClick} className="navbar-dots" aria-label="Open dots menu">
      <div className="navbar-dots__grid">
        <div className="navbar-dots__row">
          {topDots.map((color, index) => (
            <div key={`top-${index}`} className="navbar-dots__dot" style={{ backgroundColor: color }} />
          ))}
        </div>
        <div className="navbar-dots__row">
          {bottomDots.map((color, index) => (
            <div key={`bottom-${index}`} className="navbar-dots__dot" style={{ backgroundColor: color }} />
          ))}
        </div>
      </div>
    </button>
  );
};

export default NavbarDots;