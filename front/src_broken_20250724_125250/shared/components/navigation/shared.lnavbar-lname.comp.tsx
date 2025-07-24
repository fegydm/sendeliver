// File: src/shared/components/navigation/shared.navbar-name.comp.tsx
// Last action: Refactored to BEM and updated brand name to Logistar.

import { FC } from "react";
 import "./shared.navbar-name.css";

interface NavbarNameProps {
  onShowAbout: () => void;
}

const NavbarName: FC<navbarNameProps> = ({ onShowAbout }) => {
  return (
    <button onClick={onShowAbout} className="navbar-name">
      <span className="navbar-name__text">Sendeliver</span>
      <span className="navbar-name__underline" />
    </button>
  );
};

export default NavbarName;