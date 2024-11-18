// ./front/src/components/navigation/nav-center-group.component.tsx

import React from "react";

interface NavCenterGroupProps {
  onAvatarClick: () => void;
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

const NavCenterGroup: React.FC<NavCenterGroupProps> = ({
  onAvatarClick,
  onLoginClick,
  onRegisterClick,
}) => {
  return (
    <>
      {/* 6 bodiek */}
      <div>
        <div>
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
        </div>
      </div>

      {/* Avatar */}
      <div onClick={onAvatarClick}>
        <div>
          <span>A</span>
        </div>
      </div>

      {/* Login/register */}
      <div>
        <div>
          <button onClick={onLoginClick}>Log In</button>
          <button onClick={onRegisterClick}>Create account</button>
        </div>
      </div>
    </>
  );
};

export default NavCenterGroup;
