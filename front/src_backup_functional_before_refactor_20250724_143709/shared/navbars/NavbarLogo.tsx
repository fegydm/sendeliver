// File: front/src/components/shared/navbars/NavbarLogo.tsx
// Last action: Made toggle arrow larger and thicker.

import { FC } from "react";
import { Link } from "react-router-dom";
import "./NavbarLogo.css";

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
    className={`navbar-logo__toggle-icon ${isOpen ? 'navbar-logo__toggle-icon--open' : ''}`}
  >
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const NavbarLogo: FC<NavbarLogoProps> = ({ onBreadcrumbToggle, showBreadcrumbs }) => {
  return (
    <div className="navbar-logo">
      <Link to="/" className="navbar-logo__link" aria-label="Home page">
        <img src="/pics/logo.png" alt="Logistar Logo" className="navbar-logo__image" />
      </Link>
      <button 
        className="navbar-logo__toggle"
        onClick={onBreadcrumbToggle}
        aria-label="Toggle breadcrumbs"
        aria-expanded={showBreadcrumbs}
      >
        <ChevronIcon isOpen={showBreadcrumbs} />
      </button>
    </div>
  );
};

export default NavbarLogo;