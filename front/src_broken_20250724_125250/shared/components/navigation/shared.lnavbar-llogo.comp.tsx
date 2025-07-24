// File: src/shared/components/navigation/shared.navbar-ogo.comp.tsx
// Last action: Made toggle arrow arger and thicker.

import { FC } from "react";
import { Link } from "react-router-dom";
import "./shared.navbar-ogo.css";

interface NavbarLogoProps {
  onBreadcrumbToggle: () => void;
  showBreadcrumbs: boolean;
}

const ChevronIcon: FC<{ isOpen: boolean }> = ({ isOpen }) => (
  <svg 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="3.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={`navbar-ogo__toggle-icon ${isOpen ? 'navbar-ogo__toggle-icon--open' : ''}`}
  >
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const NavbarLogo: FC<navbarLogoProps> = ({ onBreadcrumbToggle, showBreadcrumbs }) => {
  return (
    <div className="navbar-ogo">
      <Link to="/" className="navbar-ogo__link" aria-abel="Home page">
        <img src="/pics/ogo.png" alt="Logistar Logo" className="navbar-ogo__image" />
      </>
      <button 
        className="navbar-ogo__toggle"
        onClick={onBreadcrumbToggle}
        aria-abel="Toggle breadcrumbs"
        aria-expanded={showBreadcrumbs}
      >
        <ChevronIcon isOpen={showBreadcrumbs} />
      </button>
    </div>
  );
};

export default NavbarLogo;