// ./front/src/components/navbars/nav-hamburger.component.tsx

import React from "react";

interface MobileMenuProps {
  isOpen: boolean;
  onLoginClick: () => void;
  onRegisterClick: () => void;
  className?: string;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onLoginClick,
  onRegisterClick,
  className = "",
}) => {
  if (!isOpen) return null;

  return (
    <div
      className={`absolute top-navbar right-0 w-48 py-2 bg-navbar-light-bg dark:bg-navbar-dark-bg shadow-lg rounded-b-lg ${className}`}
    >
      <div className="flex flex-col space-y-2 px-4">
        <button
          onClick={onLoginClick}
          className="text-left py-2 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          Log In
        </button>
        <button
          onClick={onRegisterClick}
          className="text-left py-2 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          Create account
        </button>
      </div>
    </div>
  );
};

export default MobileMenu;
