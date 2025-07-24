// File: src/shared/components/navigation/shared.navbar-ogin.comp.tsx
// Last action: Cleaned up and verified for new auth system.

import { FC } from "react";
import "./shared.navbar-ogin.css";

interface NavbarLoginProps {
  onOpen: () => void;
}

const NavbarLogin: FC<navbarLoginProps> = ({ onOpen }) => {
  return (
    <button onClick={onOpen} className="navbar-ogin">
      <span>Log In</span>
    </button>
  );
};

export default NavbarLogin;
