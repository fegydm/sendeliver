// File: front/src/components/shared/navbars/NavbarRegister.tsx
// Last action: Cleaned up and verified for new auth system.

import { FC } from "react";
import "./register.navbar.css";

interface NavbarRegisterProps {
  onOpen: () => void;
}

const NavbarRegister: FC<NavbarRegisterProps> = ({ onOpen }) => {
  return (
    <button onClick={onOpen} className="navbar-register">
      Create account
    </button>
  );
};

export default NavbarRegister;
