// ./front/src/components/navbars/NavbarAvatar.tsx
import { FC } from "react";

interface NavbarAvatarProps {
  onClick: () => void;
}

const NavbarAvatar: FC<NavbarAvatarProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="navbar-avatar"
      aria-label="Open avatar menu"
    >
      <span className="navbar-avatar-initial">A</span>
    </button>
  );
};

export default NavbarAvatar;