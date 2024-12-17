// ./front/src/components/navbars/NavbarGroupLeft.tsx
import { FC } from "react";
import { Link } from "react-router-dom";
import NavHamburger from "./NavbarHamburger";
import NavBreadcrumb from "./NavbarBreadcrumb";

// Props interface for the left navigation group
interface NavLeftGroupProps {
  showBreadcrumbs: boolean;
  onBreadcrumbsToggle: () => void;
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onShowAbout: () => void;
}

const NavLeftGroup: FC<NavLeftGroupProps> = ({
  showBreadcrumbs,
  onBreadcrumbsToggle,
  onLoginClick,
  onRegisterClick,
  onShowAbout,
}) => {
  return (
    <div className="nav-left-group">
      {/* Hamburger menu for mobile devices */}
      <div className="nav-hamburger">
        <NavHamburger
          onLoginClick={onLoginClick}
          onRegisterClick={onRegisterClick}
          onShowAbout={onShowAbout}
        />
      </div>

      {/* Logo and breadcrumb toggle */}
      <div className="nav-logo-container">
        <img src="/pics/logo.png" alt="SenDeliver Logo" className="nav-logo" />
        <Link to="/" className="nav-logo-link" aria-label="Go to homepage" />
        <button
          onClick={onBreadcrumbsToggle}
          className="nav-breadcrumb-toggle"
          aria-label="Toggle navigation path"
          title="Show/hide navigation path"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className={`nav-breadcrumb-icon ${
              showBreadcrumbs ? "rotated" : ""
            }`}
          >
            <path
              d="M7 10l5 5 5-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Company name - visible only on desktop */}
      <button onClick={onShowAbout} className="nav-company-name">
        <span>SenDeliver</span>
        <span className="nav-company-name-underline" />
      </button>

      {/* Breadcrumb */}
      {showBreadcrumbs && <NavBreadcrumb />}
    </div>
  );
};

export default NavLeftGroup;
