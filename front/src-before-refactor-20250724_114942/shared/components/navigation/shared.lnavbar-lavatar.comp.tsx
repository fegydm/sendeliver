// File: src/shared/components/navigation/shared.lnavbar-lavatar.comp.tsx
// Last action: Cleaned up and verified for new auth system.

import { FC } from 'react';
import { useAuth } from '@shared/contexts/AuthContext';
import './shared.lnavbar-lavatar.css';

interface NavbarAvatarProps {
  onUserClick: () => void;
  onGuestClick: () => void;
  cookiesAllowed: boolean;
  guestAvatar: string;
}

const NavbarAvatar: FC<NavbarAvatarProps> = ({ onUserClick, onGuestClick, guestAvatar }) => {
  const { isAuthenticated, user } = useAuth();

  const getInitials = (name: string) => {
    const names = name.split(' ');
    const initials = names.map(n => n.charAt(0)).join('').toUpperCase();
    return initials.slice(0, 2);
  };

  if (!isAuthenticated) {
    const guestAvatarSrc = `/avatars/zodiac/${guestAvatar}.png`;
    return (
      <button onClick={onGuestClick} className="navbar-avatar navbar-avatar--guest" title="Change Avatar">
        <img 
          src={guestAvatarSrc} 
          alt="Guest Avatar" 
          className="navbar-avatar__icon"
        />
      </button>
    );
  }
  
  return (
    <button onClick={onUserClick} className="navbar-avatar" aria-label="Profile">
      {user?.imageUrl ? (
        <img src={user.imageUrl} alt={user.name} className="navbar-avatar__image" />
      ) : (
        <span className="navbar-avatar__initials">{getInitials(user?.name || '??')}</span>
      )}
    </button>
  );
};

export default NavbarAvatar;
