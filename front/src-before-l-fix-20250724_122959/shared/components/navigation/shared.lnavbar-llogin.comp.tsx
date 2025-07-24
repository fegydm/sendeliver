// File: src/shared/components/navigation/shared.lnavbar-llogin.comp.tsx
// Last action: Cleaned up and verified for new auth system.

import { FC } from "react";
import "./shared.lnavbar-llogin.css";

interface NavbarLoginProps {
  onOpen: () => void;
}

const NavbarLogin: FC<navbarLoginProps> = ({ onOpen }) => {
  return (
    <button onClick={onOpen} className="navbar-login">
      <span>Log In</span>
    </button>
  );
};

export default NavbarLogin;
