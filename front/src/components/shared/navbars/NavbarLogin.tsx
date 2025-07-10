// File: front/src/components/shared/navbars/NavbarLogin.tsx
// Last action: Removed internal comments and added CSS import.

import { FC } from "react";
import { useAuth } from "@/contexts/AuthContext";
import "./NavbarLogin.css";

interface NavbarLoginProps {
  onLoginClick: () => void;
}

const NavbarLogin: FC<NavbarLoginProps> = ({ onLoginClick }) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return null;
  }

  return (
    <button onClick={onLoginClick} className="navbar-login">
      <span>Log In</span>
    </button>
  );
};

export default NavbarLogin;