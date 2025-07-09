// File: front/src/components/shared/navbars/NavbarHamburger.tsx
// Last action: Refactored component to use BEM class names.

import { type FC, useState, useCallback } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import "./NavbarHamburger.css";

interface NavbarHamburgerProps {
 onLoginClick: () => void;
 onRegisterClick: () => void;
 onShowAbout: () => void;
}

interface NavbarHamburgerItemProps {
 onClick: () => void;
 children: React.ReactNode;
}

const NavbarHamburgerItem: FC<NavbarHamburgerItemProps> = ({ onClick, children }) => (
 <button onClick={onClick} className="navbar-hamburger__item">
   {children}
 </button>
);

const NavbarHamburger: FC<NavbarHamburgerProps> = ({
 onLoginClick,
 onRegisterClick,
 onShowAbout,
}) => {
 const [isOpen, setIsOpen] = useState(false);

 const toggleMenu = useCallback(() => {
   setIsOpen((prev) => !prev);
 }, []);

 const handleItemClick = useCallback((handler: () => void) => {
   handler();
   setIsOpen(false);
 }, []);

 return (
   <div className="navbar-hamburger">
     <button
       onClick={toggleMenu}
       className="navbar-hamburger__toggle"
       aria-label="Toggle menu"
       aria-expanded={isOpen}
     >
       {isOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
     </button>

     {isOpen && (
       <div className="navbar-hamburger__menu" role="menu">
         <div className="navbar-hamburger__content">
           <NavbarHamburgerItem onClick={() => handleItemClick(onShowAbout)}>
             About
           </NavbarHamburgerItem>
           <NavbarHamburgerItem onClick={() => handleItemClick(onLoginClick)}>
             Log In
           </NavbarHamburgerItem>
           <NavbarHamburgerItem onClick={() => handleItemClick(onRegisterClick)}>
             Create Account
           </NavbarHamburgerItem>
         </div>
       </div>
     )}
   </div>
 );
};

export default NavbarHamburger;