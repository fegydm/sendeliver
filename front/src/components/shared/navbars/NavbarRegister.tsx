// File: front/src/components/shared/navbars/NavbarRegister.tsx
// Last action: Implemented logic to auto-hide when authenticated.

import { FC } from "react";
import { useAuth } from "@/contexts/AuthContext";
import "./NavbarRegister.css";

interface NavbarRegisterProps {
  onRegisterClick: () => void;
}

const NavbarRegister: FC<NavbarRegisterProps> = ({ onRegisterClick }) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return null;
  }
  
  return (
    <button onClick={onRegisterClick} className="navbar-register">
      Create account
    </button>
  );
};

export default NavbarRegister;