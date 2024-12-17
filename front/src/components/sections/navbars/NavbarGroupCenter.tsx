// ./front/src/components/navbars/NavbarGroupCenter.tsx
import { type FC } from "react";
import type { NavCenterGroupProps } from "../../../types/dots";
import NavDots from "./nav-dots.component";
import "@/styles/components/_navbar.css"; // Import unified CSS styles

const NavCenterGroup: FC<NavCenterGroupProps> = ({
  onAvatarClick,
  onDotsClick,
  onLoginClick,
  onRegisterClick,
  topDots,
  bottomDots,
}) => {
  return (
    <div className="navbar-group center">
      <div className="navbar-center-container">
        {/* Avatar Button */}
        <button
          onClick={onAvatarClick}
          className="avatar-button"
          aria-label="Open avatar menu"
        >
          <span className="avatar-initial">A</span>
        </button>

        {/* Dots */}
        <NavDots
          topDots={topDots}
          bottomDots={bottomDots}
          onClick={onDotsClick}
        />

        {/* Login & Register Buttons */}
        <div className="auth-buttons">
          <button onClick={onLoginClick} className="login-button">
            <span>Log&nbsp;In</span>
            <span className="button-underline" />
          </button>

          <button onClick={onRegisterClick} className="register-button">
            Create account
          </button>
        </div>
      </div>
    </div>
  );
};

export default NavCenterGroup;
