// File: front/src/components/shared/navbars/NavbarRegister.tsx
// Last action: Converted to a declarative Link component for robust navigation.

import { FC } from "react";
import { Link } from "react-router-dom";
import "./NavbarRegister.css";

const NavbarRegister: FC = () => {
  return (
    <Link to="/register" className="navbar-register">
      Create account
    </Link>
  );
};

export default NavbarRegister;
