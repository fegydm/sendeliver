// File: front/src/components/shared/navbars/NavbarLogin.tsx
// Last action: Converted to a declarative Link component for robust navigation.

import { FC } from "react";
import { Link } from "react-router-dom";
import "./NavbarLogin.css";

const NavbarLogin: FC = () => {
  return (
    <Link to="/login" className="navbar-login">
      <span>Log In</span>
    </Link>
  );
};

export default NavbarLogin;
