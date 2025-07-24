// File: src/shared/components/navigation/shared.navbar-register.comp.tsx
// Last action: Cleaned up and verified for new auth system.

import { FC } from "react";
import "./shared.navbar-register.css";

interface NavbarRegisterProps {
  onOpen: () => void;
}

const NavbarRegister: FC<navbarRegisterProps> = ({ onOpen }) => {
  return (
    <button onClick={onOpen} className="navbar-register">
      Create account
    </button>
  );
};

export default NavbarRegister;
