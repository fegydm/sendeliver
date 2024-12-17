// ./front/src/components/navbars/NavbarHamburger.tsx
import { type FC, useState, useCallback } from "react";
import { FaBars, FaTimes } from "react-icons/fa";

interface NavHamburgerProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onShowAbout: () => void;
}

interface MenuItemProps {
  onClick: () => void;
  children: React.ReactNode;
}

// Extracted MenuItem component for reusability
const MenuItem: FC<MenuItemProps> = ({ onClick, children }) => (
  <button onClick={onClick} className="nav-hamburger-item">
    {children}
  </button>
);

const NavHamburger: FC<NavHamburgerProps> = ({
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
    <div className="nav-hamburger">
      <button
        onClick={toggleMenu}
        className="nav-hamburger-toggle"
        aria-label="Toggle menu"
        aria-expanded={isOpen}
        title={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {isOpen && (
        <div className="nav-hamburger-menu" role="menu">
          <div className="nav-hamburger-content">
            <MenuItem onClick={() => handleItemClick(onShowAbout)}>
              About
            </MenuItem>
            <MenuItem onClick={() => handleItemClick(onLoginClick)}>
              Log In
            </MenuItem>
            <MenuItem onClick={() => handleItemClick(onRegisterClick)}>
              Create Account
            </MenuItem>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavHamburger;
