// ./front/src/components/navbars/nav-hamburger.component.tsx
import { type FC } from "react";

interface NavHamburgerProps {
  isOpen: boolean;
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onShowAbout: () => void;
}

const NavHamburger: FC<NavHamburgerProps> = ({
  isOpen,
  onLoginClick,
  onRegisterClick,
  onShowAbout,
}) => {
  return (
    <div
      className={`absolute left-0 bg-navbar-light-bg dark:bg-navbar-dark-bg shadow-dropdown border-t border-navbar-light-hover dark:border-navbar-dark-hover z-dropdown transition-transform duration-200 ${
        isOpen ? "visible opacity-100" : "invisible opacity-0"
      }`}
      style={{
        top: "var(--navbar-height)", // Dynamické zarovnanie pod navbar
      }}
    >
      <div className="divide-y divide-navbar-light-hover dark:divide-navbar-dark-hover">
        <button
          onClick={onShowAbout}
          className="inline-flex items-center px-4 py-3 text-navbar-light-text dark:text-navbar-dark-text hover:bg-navbar-light-hover dark:hover:bg-navbar-dark-hover transition-colors"
        >
          SenDeliver
        </button>
        <button
          onClick={onLoginClick}
          className="inline-flex items-center px-4 py-3 text-navbar-light-text dark:text-navbar-dark-text hover:bg-navbar-light-hover dark:hover:bg-navbar-dark-hover transition-colors"
        >
          Log In
        </button>
        <button
          onClick={onRegisterClick}
          className="inline-flex items-center px-4 py-3 text-navbar-light-text dark:text-navbar-dark-text hover:bg-navbar-light-hover dark:hover:bg-navbar-dark-hover transition-colors"
        >
          Create account
        </button>
      </div>
    </div>
  );
};

export default NavHamburger;
