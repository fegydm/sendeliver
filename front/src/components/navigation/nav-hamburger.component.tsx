// ./front/src/components/navigation/nav-hamburger.component.tsx

import React from "react";

interface MobileMenuProps {
  isOpen: boolean;
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onLoginClick,
  onRegisterClick,
}) => {
  if (!isOpen) return null;

  return (
    <div>
      <button onClick={onLoginClick}>Log In</button>
      <button onClick={onRegisterClick}>Create account</button>
    </div>
  );
};

export default MobileMenu;
