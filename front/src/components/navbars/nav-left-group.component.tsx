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
    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center">
      {/* Menu toggle */}
      <button
        onClick={onMenuToggle}
        className="hidden max-lg:flex mr-4 items-center"
        aria-label="Toggle menu"
      >
        {isMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* Logo container */}
      <div className="relative h-5">
        {/* Logo */}
        <img
          src="/pics/logo.png"
          alt="SenDeliver Logo"
          className="h-5 w-auto"
        />

        {/* Klikacia plocha pre homepage */}
        <Link
          to="/"
          className="absolute top-0 left-0 w-full h-[75%]"
          aria-label="Go to homepage"
        ></Link>

        {/* Chevron tlačidlo */}
        <button
          onClick={onBreadcrumbsToggle}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[25%] w-full"
          aria-label="Toggle breadcrumbs"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className={`w-6 h-6 transform ${
              showBreadcrumbs ? "rotate-180" : ""
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

      {/* Name with animated underline */}
      <button
        onClick={onShowAbout}
        className="ml-5 group relative hidden md:block"
      >
        <span className="text-base font-semibold">SenDeliver</span>
        <span className="absolute left-1/2 right-1/2 bottom-0 h-0.5 bg-current transition-all duration-300 group-hover:left-0 group-hover:right-0" />
      </button>
    </div>
  );
};

export default NavLeftGroup;
