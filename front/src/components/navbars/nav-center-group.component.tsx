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
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
      {/* Avatar - Presne na stred navbaru */}
      <button
        onClick={onAvatarClick}
        className="h-[44px] w-[44px] rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
        aria-label="Open avatar menu"
      >
        <span className="text-base font-medium">A</span>
      </button>

      {/* Login a Register - Zarovnané relatívne k avataru */}
      <div className="absolute top-1/2 left-1/2 transform -translate-y-1/2 flex gap-3 ml-[60px]">
        <button
          onClick={onLoginClick}
          className="text-base font-semibold whitespace-nowrap px-4 py-2 bg-navbar-light-button-bg dark:bg-navbar-dark-button-bg text-navbar-light-button-text dark:text-navbar-dark-button-text rounded-md"
        >
          Log In
        </button>
        <button
          onClick={onRegisterClick}
          className="text-base font-semibold whitespace-nowrap px-4 py-2 bg-navbar-light-button-bg dark:bg-navbar-dark-button-bg text-navbar-light-button-text dark:text-navbar-dark-button-text rounded-md"
        >
          Register
        </button>
      </div>
    </div>
  );
};

export default NavCenterGroup;
