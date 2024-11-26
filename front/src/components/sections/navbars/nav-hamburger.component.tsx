// ./front/src/components/navbars/nav-hamburger.component.tsx
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

// Vyextrahovaný MenuItem komponent pre lepšiu znovupoužiteľnosť
const MenuItem: FC<MenuItemProps> = ({ onClick, children }) => (
  <button
    onClick={onClick}
    className="w-full inline-flex items-center px-4 py-3 
             text-navbar-light-text dark:text-navbar-dark-text 
             hover:bg-navbar-light-hover dark:hover:bg-navbar-dark-hover 
             transition-colors"
  >
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
    setIsOpen(prev => !prev);
  }, []);

  const handleItemClick = useCallback((handler: () => void) => {
    handler();
    setIsOpen(false);
  }, []);

  return (
    <div className="lg:hidden">
      <button
        onClick={toggleMenu}
        className="flex items-center hover:opacity-80 transition-opacity"
        aria-label="Toggle menu"
        aria-expanded={isOpen}
        title={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {isOpen && (
        <div
          className="absolute left-0 right-0 bg-navbar-light-bg dark:bg-navbar-dark-bg 
                    shadow-dropdown border-t border-navbar-light-hover 
                    dark:border-navbar-dark-hover z-dropdown"
          style={{
            top: "calc(var(--navbar-height) + 4px)",
          }}
        >
          <div 
            className="max-w-screen-xl mx-auto divide-y divide-navbar-light-hover dark:divide-navbar-dark-hover"
            role="menu"
          >
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