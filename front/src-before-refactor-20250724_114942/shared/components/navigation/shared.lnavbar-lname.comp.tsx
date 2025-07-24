// File: src/shared/components/navigation/shared.lnavbar-lname.comp.tsx
// Last action: Refactored to BEM and updated brand name to Logistar.

import { FC } from "react";
 import "./shared.lnavbar-lname.css";

interface NavbarNameProps {
  onShowAbout: () => void;
}

const NavbarName: FC<NavbarNameProps> = ({ onShowAbout }) => {
  return (
    <button onClick={onShowAbout} className="navbar-name">
      <span className="navbar-name__text">Sendeliver</span>
      <span className="navbar-name__underline" />
    </button>
  );
};

export default NavbarName;