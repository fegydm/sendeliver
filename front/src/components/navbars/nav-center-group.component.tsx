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
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-6">
      {/* Login - S podčiarknutím */}
      <button onClick={onLoginClick} className="relative group">
        <span className="text-base font-semibold">Log In</span>
        <span className="absolute left-1/2 right-1/2 bottom-0 h-0.5 bg-current transition-all duration-300 group-hover:left-0 group-hover:right-0" />
      </button>

      {/* Avatar - Presne na stred navbaru */}
      <button
        onClick={onAvatarClick}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-[44px] w-[44px] rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
        aria-label="Open avatar menu"
      >
        <span className="text-base font-medium">A</span>
      </button>

      {/* Register tlačidlo */}
      <button
        onClick={onRegisterClick}
        className="text-base font-semibold whitespace-nowrap px-4 py-2 bg-navbar-light-button-bg dark:bg-navbar-dark-button-bg text-navbar-light-button-text dark:text-navbar-dark-button-text rounded-md"
      >
        Register
      </button>
    </div>
  );
};

export default NavCenterGroup;
