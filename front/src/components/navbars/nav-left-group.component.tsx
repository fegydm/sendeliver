// ./front/src/components/navigation/nav-left-group.component.tsx
import { type FC } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import { IoChevronDown } from "react-icons/io5";

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
      {/* Menu toggle button - visible only below 820px */}
      <button
        onClick={onMenuToggle}
        className="hidden max-lg:block mr-4 hover:opacity-80 transition-opacity"
        aria-label="Toggle menu"
      >
        {isMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* Logo container with name */}
      <div className="flex items-center space-x-3">
        {/* Logo with breadcrumbs toggle */}
        <div className="relative">
          {/* Top half - logo */}
          <Link to="/" className="block hover:opacity-80 transition-opacity">
            <img
              src="/pics/logo.png"
              alt="SenDeliver Logo"
              className="h-5 w-auto object-contain"
            />
          </Link>

          {/* Chevron - positioned between bottom of logo and navbar bottom */}
          <button
            onClick={onBreadcrumbsToggle}
            className="absolute -bottom-1.5 left-0 right-0 flex justify-center"
            aria-label="Toggle breadcrumbs"
          >
            <IoChevronDown
              size={12}
              className={`transform transition-transform duration-200 ${
                showBreadcrumbs ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {/* SenDeliver text - hidden below 620px */}
        <button
          onClick={onShowAbout}
          className="hidden md:block group relative"
        >
          <span className="text-base font-semibold">
            SenDeliver
            <span className="absolute left-1/2 right-1/2 bottom-0 h-0.5 bg-current transition-all duration-300 group-hover:left-0 group-hover:right-0"></span>
          </span>
        </button>
      </div>
    </div>
  );
};

export default NavLeftGroup;
