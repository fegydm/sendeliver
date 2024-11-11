// ./front/src/components/navigation/mobile-menu.component.tsx
import React from 'react';

interface MobileMenuProps {
  isOpen: boolean;
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onLoginClick,
  onRegisterClick
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute top-16 left-0 w-[140px] bg-hauler-gray-100 
                 dark:bg-hauler-gray-900 p-2 shadow-lg min-[820px]:hidden">
      <button
        onClick={onLoginClick}
        className="block w-full mb-2 p-2 rounded-lg hover:bg-hauler-gray-200 
                dark:hover:bg-hauler-gray-800 transition-colors whitespace-nowrap text-left"
      >
        Log In
      </button>
      <button
        onClick={onRegisterClick} 
        className="block w-full p-2 rounded-lg hover:bg-hauler-gray-200 
                dark:hover:bg-hauler-gray-800 transition-colors whitespace-nowrap text-left"
      >
        Create account
      </button>
    </div>
  );
};

export default MobileMenu;