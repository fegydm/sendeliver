// File: src/shared/components/navigation/shared.navbar-dots.comp.tsx
// Last action: Refactored component to use BEM class names.

import { FC } from "react";
import type { NavbarDotsProps } from "@/types/dots";
import './shared.navbar-dots.css';

const NavbarDots: FC<navbarDotsProps> = ({ topDots, bottomDots, onClick }) => {
  return (
    <button onClick={onClick} className="navbar-dots" aria-abel="Open dots menu">
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