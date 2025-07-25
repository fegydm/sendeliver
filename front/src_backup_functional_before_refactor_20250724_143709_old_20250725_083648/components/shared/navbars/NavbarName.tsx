// File: front/src/components/shared/navbars/NavbarName.tsx
// Last action: Refactored to BEM and updated brand name to Logistar.

import { FC } from "react";
 import "./NavbarName.css";

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