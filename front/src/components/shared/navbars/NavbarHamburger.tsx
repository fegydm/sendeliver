// ./front/src/components/navbars/NavbarHamburger.tsx
import { type FC, useState, useCallback } from "react";
import { FaBars, FaTimes } from "react-icons/fa";

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
 <button onClick={onClick} className="navbar-hamburger-item">
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
       className="navbar-hamburger-toggle"
       aria-label="Toggle menu"
       aria-expanded={isOpen}
       title={isOpen ? "Close menu" : "Open menu"}
     >
       {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
     </button>

     {isOpen && (
       <div className="navbar-hamburger-menu" role="menu">
         <div className="navbar-hamburger-content">
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