// ./front/src/components/navbars/nav-center-group.component.tsx
import { type FC } from "react";
import type { NavCenterGroupProps } from "../../types/dots";
import NavDots from "./nav-dots.component";

const NavCenterGroup: FC<NavCenterGroupProps> = ({
  onAvatarClick,
  onDotsClick,
  onLoginClick,
  onRegisterClick,
  topDots,
  bottomDots,
}) => {
  return (
    <div className="relative flex justify-center items-center w-full h-navbar">
      <div className="relative h-full">
        {/* Avatar Button */}
        <button
          onClick={onAvatarClick}
          className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 
                   h-[calc(var(--navbar-height)*0.9)] aspect-square rounded-full 
                   bg-gray-200 dark:bg-gray-700 flex items-center justify-center 
                   hover:opacity-80 transition-opacity"
          aria-label="Open avatar menu"
        >
          <span className="text-base font-medium">A</span>
        </button>

        {/* Dots */}
        <NavDots
          topDots={topDots}
          bottomDots={bottomDots}
          onClick={onDotsClick}
        />

        {/* Login & Register Buttons */}
        <div className="absolute left-[60px] top-1/2 -translate-y-1/2 hidden lg:flex items-center space-x-4">
          <button onClick={onLoginClick} className="group relative">
            <span className="text-base font-semibold whitespace-nowrap">
              Log&nbsp;In
            </span>
            <span className="absolute left-1/2 right-1/2 bottom-0 h-0.5 bg-current transition-all duration-300 group-hover:left-0 group-hover:right-0" />
          </button>

          <button
            onClick={onRegisterClick}
            className="px-4 py-1.5 rounded-md bg-navbar-light-button-bg dark:bg-navbar-dark-button-bg text-navbar-light-button-text dark:text-navbar-dark-button-text hover:bg-navbar-light-button-hover dark:hover:bg-navbar-dark-button-hover transition-colors text-sm font-medium whitespace-nowrap"
          >
            Create account
          </button>
        </div>
      </div>
    </div>
  );
};

export default NavCenterGroup;
