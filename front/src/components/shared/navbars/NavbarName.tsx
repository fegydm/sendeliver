// ./front/src/components/navbars/NavbarName.tsx
import { FC } from "react";

interface NavbarNameProps {
 onShowAbout: () => void;
}

const NavbarName: FC<NavbarNameProps> = ({ onShowAbout }) => {
 return (
   <button onClick={onShowAbout} className="navbar-name">
     <span>SenDeliver</span>
     <span className="navbar-name-underline" />
   </button>
 );
};

export default NavbarName;