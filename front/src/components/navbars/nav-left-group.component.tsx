// ./front/src/components/navbars/nav-left-group.component.tsx
import { FC } from "react";
import { Link } from "react-router-dom";
import NavHamburger from "./nav-hamburger.component";
import NavBreadcrumb from "./nav-breadcrumb.component";

// Interface pre props ľavej skupiny
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
    <div className="flex items-center h-full">
      {/* Hamburger pre mobilné zariadenia */}
      <div className="lg:hidden">
        <NavHamburger 
          onLoginClick={onLoginClick}
          onRegisterClick={onRegisterClick}
          onShowAbout={onShowAbout}
        />
      </div>

      {/* Logo a breadcrumb toggle */}
      <div className="relative h-5 mx-6 group">
        <img
          src="/pics/logo.png"
          alt="SenDeliver Logo"
          className="h-5 w-auto"
        />
        <Link
          to="/"
          className="absolute top-0 left-0 w-full h-[75%]"
          aria-label="Go to homepage"
        />
        <button
          onClick={onBreadcrumbsToggle}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[25%] w-full 
                   opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Toggle navigation path"
          title="Show/hide navigation path"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className={`w-6 h-6 transform transition-transform duration-200 ${
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

      {/* Názov spoločnosti - desktop only */}
      <button 
        onClick={onShowAbout} 
        className="group relative hidden md:block"
      >
        <span className="text-base font-semibold">SenDeliver</span>
        <span className="absolute left-1/2 right-1/2 bottom-0 h-0.5 bg-current 
                      transition-all duration-300 group-hover:left-0 group-hover:right-0" />
      </button>

      {/* Breadcrumb */}
      {showBreadcrumbs && <NavBreadcrumb />}
    </div>
  );
};

export default NavLeftGroup;