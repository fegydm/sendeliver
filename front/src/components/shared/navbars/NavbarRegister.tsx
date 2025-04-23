// ./front/src/components/navbars/NavbarRegister.tsx
import { FC } from "react";

interface NavbarRegisterProps {
 onRegisterClick: () => void;
}

const NavbarRegister: FC<NavbarRegisterProps> = ({ onRegisterClick }) => {
 return (
   <button onClick={onRegisterClick} className="navbar-register">
     Create account
   </button>
 );
};

export default NavbarRegister;