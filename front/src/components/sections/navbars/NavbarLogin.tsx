// ./front/src/components/navbars/NavbarLogin.tsx
import { FC } from "react";

interface NavbarLoginProps {
 onLoginClick: () => void;
}

const NavbarLogin: FC<NavbarLoginProps> = ({ onLoginClick }) => {
 return (
   <button onClick={onLoginClick} className="navbar-login">
     <span>Log&nbsp;In</span>
     <span className="navbar-login-underline" />
   </button>
 );
};

export default NavbarLogin;