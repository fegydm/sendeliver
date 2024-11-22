// ./front/src/components/navbars/nav-left-group.component.tsx
import { type FC, useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import NavHamburger from "./nav-hamburger.component";
import NavBreadcrumb from "./nav-breadcrumb.component";

interface NavLeftGroupProps {
  showBreadcrumbs: boolean;
  onBreadcrumbsToggle: () => void;
  onShowAbout: () => void;
}

const NavLeftGroup: FC<NavLeftGroupProps> = ({
  showBreadcrumbs,
  onBreadcrumbsToggle,
  onShowAbout,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="flex items-center space-x-4">
      {/* Menu toggle */}
      <div>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="hidden max-lg:flex items-center"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
        {isMenuOpen && (
          <NavHamburger
            isOpen={isMenuOpen}
            onLoginClick={() => console.log("Login modal opened")}
            onRegisterClick={() => console.log("Register modal opened")}
            onShowAbout={onShowAbout}
          />
        )}
      </div>

      {/* Logo container */}
      <div className="relative h-5">
        <img
          src="/pics/logo.png"
          alt="SenDeliver Logo"
          className="h-5 w-auto"
        />
        <Link
          to="/"
          className="absolute top-0 left-0 w-full h-[75%]"
          aria-label="Go to homepage"
        ></Link>
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
      <button onClick={onShowAbout} className="group relative hidden md:block">
        <span className="text-base font-semibold">SenDeliver</span>
        <span className="absolute left-1/2 right-1/2 bottom-0 h-0.5 bg-current transition-all duration-300 group-hover:left-0 group-hover:right-0" />
      </button>

      {/* Breadcrumb */}
      {showBreadcrumbs && (
        <div
          className="absolute left-1/2 transform -translate-x-1/2 z-[40]"
          style={{
            top: "calc(var(--navbar-height) + 4px)",
          }}
        >
          <NavBreadcrumb />
        </div>
      )}
    </div>
  );
};

export default NavLeftGroup;
