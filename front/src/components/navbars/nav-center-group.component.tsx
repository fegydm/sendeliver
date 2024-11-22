// ./front/src/components/navbars/nav-center-group.component.tsx
import { type FC } from "react";

interface NavCenterGroupProps {
  onAvatarClick: () => void;
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

const NavCenterGroup: FC<NavCenterGroupProps> = ({
  onAvatarClick,
  onLoginClick,
  onRegisterClick,
}) => {
  return (
    <div className="w-full max-w-content mx-auto">
      {/* Centered Avatar */}
      <button
        onClick={onAvatarClick}
        className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 h-[44px] aspect-square rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:opacity-80 transition-opacity"
        aria-label="Open avatar menu"
      >
        <span className="text-base font-medium">A</span>
      </button>

      {/* 6 dots container - relative to avatar */}
      <div className="absolute right-[calc(50%+2.5rem)] top-1/2 -translate-y-1/2">
        <div className="p-2 flex flex-col gap-1">
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={`top-${i}`}
                className="w-1.5 h-1.5 rounded-full bg-current opacity-60"
              />
            ))}
          </div>
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={`bottom-${i}`}
                className="w-1.5 h-1.5 rounded-full bg-current opacity-60"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Login/Register container - relative to avatar */}
      <div className="absolute left-[calc(50%+2.5rem)] top-1/2 -translate-y-1/2 hidden lg:flex items-center space-x-4">
        {/* Log In with underline effect */}
        <button onClick={onLoginClick} className="group relative">
          <span className="text-base font-semibold whitespace-nowrap">
            Log&nbsp;In
          </span>
          <span className="absolute left-1/2 right-1/2 bottom-0 h-0.5 bg-current transition-all duration-300 group-hover:left-0 group-hover:right-0" />
        </button>

        {/* Create account button */}
        <button
          onClick={onRegisterClick}
          className="px-4 py-1.5 rounded-md bg-navbar-light-button-bg dark:bg-navbar-dark-button-bg text-navbar-light-button-text dark:text-navbar-dark-button-text hover:opacity-80 transition-opacity text-sm font-medium whitespace-nowrap"
        >
          Create account
        </button>
      </div>
    </div>
  );
};

export default NavCenterGroup;
