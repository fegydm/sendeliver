// ./front/src/components/navbars/nav-left-group.component.tsx
import { type FC } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

interface NavLeftGroupProps {
  isMenuOpen: boolean;
  showBreadcrumbs: boolean;
  onMenuToggle: () => void;
  onBreadcrumbsToggle: () => void;
  onShowAbout: () => void;
}

const NavLeftGroup: FC<NavLeftGroupProps> = ({
  isMenuOpen,
  showBreadcrumbs,
  onMenuToggle,
  onBreadcrumbsToggle,
  onShowAbout,
}) => {
  return (
    <div className="flex items-center">
      <button
        onClick={onMenuToggle}
        className="hidden max-lg:block mr-4"
        aria-label="Toggle menu"
      >
        {isMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* Logo container with chevron */}
      <div className="relative">
        <Link to="/" className="flex items-center">
          <img
            src="/pics/logo.png"
            alt="SenDeliver Logo"
            className="h-5 w-auto"
          />
        </Link>

        {/* Chevron below logo */}
        <button
          onClick={onBreadcrumbsToggle}
          className="absolute -bottom-2 left-1/2 -translate-x-1/2"
          aria-label="Toggle breadcrumbs"
        >
          <svg
            viewBox="0 0 24 24"
            className={`w-3 h-3 transform ${showBreadcrumbs ? "rotate-180" : ""}`}
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

      {/* Name with animated underline */}
      <button onClick={onShowAbout} className="ml-5 group relative">
        <span className="text-base font-semibold">SenDeliver</span>
        <span className="absolute left-1/2 right-1/2 bottom-0 h-0.5 bg-current transition-all duration-300 group-hover:left-0 group-hover:right-0" />
      </button>
    </div>
  );
};

export default NavLeftGroup;
