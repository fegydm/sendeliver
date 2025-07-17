// File: front/src/components/shared/navbars/NavbarLogin.tsx
// Last action: Cleaned up and verified for new auth system.

import { FC } from "react";
import "./NavbarLogin.css";

interface NavbarLoginProps {
  onOpen: () => void;
}

const NavbarLogin: FC<NavbarLoginProps> = ({ onOpen }) => {
  return (
    <button onClick={onOpen} className="navbar-login">
      <span>Log In</span>
    </button>
  );
};

export default NavbarLogin;
