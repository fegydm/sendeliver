// ./src/components/navigation/nav-left-group.component.tsx
import React from "react";
import { Link } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";

interface NavLeftGroupProps {
  isMenuOpen: boolean;
  showBreadcrumbs: boolean;
  onMenuToggle: () => void;
  onBreadcrumbsToggle: () => void;
  onShowAbout: () => void;
}

const NavLeftGroup: React.FC<NavLeftGroupProps> = ({
  isMenuOpen,
  showBreadcrumbs,
  onMenuToggle,
  onBreadcrumbsToggle,
  onShowAbout,
}) => {
  return (
    <div className="flex items-center space-x-4">
      {/* Menu toggle button with hamburger/close icon */}
      <button
        onClick={onMenuToggle}
        className="hover:text-hauler-primary-600 transition-colors"
        aria-label="Toggle menu"
      >
        {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Logo and breadcrumb container */}
      <div className="relative flex flex-col items-center">
        {/* Logo with home link */}
        <Link to="/" className="mb-1 hover:opacity-80 transition-opacity">
          <img
            src="/pics/logo.png"
            alt="SenDeliver Logo"
            className="h-8 w-auto object-contain"
            aria-label="Home"
          />
        </Link>

        {/* Breadcrumb toggle button with animation */}
        <button
          onClick={onBreadcrumbsToggle}
          className="hover:text-hauler-primary-600 transition-colors"
          aria-label="Toggle breadcrumbs"
        >
          <ChevronDown
            size={16}
            className={`
              transform 
              transition-transform duration-200 
              ${showBreadcrumbs ? "rotate-180" : ""}
            `}
          />
        </button>
      </div>

      {/* About link - visible only on screens wider than 620px */}
      <button
        onClick={onShowAbout}
        className="
          hidden min-[620px]:block 
          hover:text-hauler-primary-600 
          transition-colors 
          cursor-pointer
        "
        aria-label="About SenDeliver"
      >
        SenDeliver
      </button>
    </div>
  );
};

export default NavLeftGroup;
