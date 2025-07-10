// File: front/src/components/shared/navbars/NavbarAvatar.tsx
// Last action: Fixed User type issue and re-implemented zodiac guest avatars.

import { FC, useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import './NavbarAvatar.css';

const ZODIAC_SIGNS = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio'];

interface NavbarAvatarProps {
  onGuestClick: () => void;
  onUserClick: () => void;
}

const NavbarAvatar: FC<NavbarAvatarProps> = ({ onGuestClick, onUserClick }) => {
  const { isAuthenticated, user } = useAuth();
  const [guestIcon, setGuestIcon] = useState(ZODIAC_SIGNS[0]);

  useEffect(() => {
    if (isAuthenticated) return;

    const intervalId = setInterval(() => {
      setGuestIcon(prevSign => ZODIAC_SIGNS[(ZODIAC_SIGNS.indexOf(prevSign) + 1) % ZODIAC_SIGNS.length]);
    }, 2500);

    return () => clearInterval(intervalId);
  }, [isAuthenticated]);

  const getInitials = (name: string) => {
    const names = name.split(' ');
    const initials = names.map(n => n.charAt(0)).join('').toUpperCase();
    return initials.slice(0, 2);
  };

  if (!isAuthenticated) {
    const guestAvatarSrc = `/assets/avatars/zodiac/${guestIcon}.svg`;
    return (
      <button onClick={onGuestClick} className="navbar-avatar navbar-avatar--guest" title="Prihlásiť sa">
        <img src={guestAvatarSrc} alt="Guest Avatar" className="navbar-avatar__icon" />
      </button>
    );
  }
  
  return (
    <button onClick={onUserClick} className="navbar-avatar" aria-label="Profil">
      {user?.image ? (
        <img src={user.image} alt={user.name} className="navbar-avatar__image" />
      ) : (
        <span className="navbar-avatar__initials">{getInitials(user?.name || '??')}</span>
      )}
    </button>
  );
};

export default NavbarAvatar;