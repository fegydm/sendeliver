// File: front/src/components/shared/navbars/NavbarAvatar.tsx
// Last action: Implemented guest avatar logic based on cookie state.

import { FC, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import './NavbarAvatar.css';

const ZODIAC_SIGNS = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];

const getCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match) return match[2];
  return null;
};

interface NavbarAvatarProps {
  onUserClick: () => void;
  onGuestClick: () => void;
  cookiesAllowed: boolean;
}

const NavbarAvatar: FC<NavbarAvatarProps> = ({ onUserClick, onGuestClick, cookiesAllowed }) => {
  const { isAuthenticated, user } = useAuth();
  const [guestIcon, setGuestIcon] = useState(ZODIAC_SIGNS[0]);

  useEffect(() => {
    if (isAuthenticated) return;

    let selectedAvatar: string | null = null;
    if (cookiesAllowed) {
      selectedAvatar = getCookie('guestAvatar');
    }
    
    if (selectedAvatar && ZODIAC_SIGNS.includes(selectedAvatar)) {
      setGuestIcon(selectedAvatar);
      return; 
    }

    const intervalId = setInterval(() => {
      setGuestIcon(prevSign => ZODIAC_SIGNS[(ZODIAC_SIGNS.indexOf(prevSign) + 1) % ZODIAC_SIGNS.length]);
    }, 2500);

    return () => clearInterval(intervalId);
  }, [isAuthenticated, cookiesAllowed]);

  const getInitials = (name: string) => {
    const names = name.split(' ');
    const initials = names.map(n => n.charAt(0)).join('').toUpperCase();
    return initials.slice(0, 2);
  };

  if (!isAuthenticated) {
    const guestAvatarSrc = `/assets/avatars/zodiac/${guestIcon}.svg`;
    return (
      <button onClick={onGuestClick} className="navbar-avatar navbar-avatar--guest" title="Zmeniť avatara">
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
