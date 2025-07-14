// File: front/src/components/shared/modals/AvatarModal.tsx
// Last action: Refactored to handle both guest and authenticated user logic.

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import GeneralModal from './general.modal';
import { Button } from '../ui/button.ui';
import './AvatarModal.css';

interface AvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  isGuestMode?: boolean;
  cookiesAllowed?: boolean;
}

type AvatarGroup = 'photos' | 'zodiac' | 'fantasy';

const AVATAR_DATA = {
  photos: Array.from({ length: 5 }, (_, i) => ({ id: `photo-${i + 1}`, label: `Photo ${i + 1}` })),
  zodiac: ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"].map(s => ({ id: s.toLowerCase(), label: s })),
  fantasy: ["Warrior", "Mage", "Archer", "Rogue", "Knight", "Wizard", "Paladin", "Monk"].map(c => ({ id: c.toLowerCase(), label: c })),
};

const setCookie = (name: string, value: string, days: number) => {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

const AvatarModal: React.FC<AvatarModalProps> = ({ isOpen, onClose, onLogout, isGuestMode = false, cookiesAllowed = false }) => {
  const { user } = useAuth();
  const [activeGroup, setActiveGroup] = useState<AvatarGroup>('zodiac');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);

  const handleSave = () => {
    if (!selectedAvatar) {
      alert("Najprv si vyberte avatara.");
      return;
    }

    if (isGuestMode) {
      if (cookiesAllowed) {
        setCookie('guestAvatar', selectedAvatar, 30);
        console.log(`Ukladám avatara pre hosťa do cookie: ${selectedAvatar}`);
      } else {
        console.log("Cookies nie sú povolené, voľba sa neuloží.");
      }
    } else {
      // TODO: Implement API call to update user's avatar
      console.log(`Ukladám avatara: ${selectedAvatar} pre používateľa: ${user?.name}`);
    }
    onClose();
  };

  const handleLogoutClick = () => {
    onLogout();
  };

  const modalTitle = isGuestMode ? "Vyberte si Avatara" : `Profil: ${user?.name || 'Používateľ'}`;
  const modalDescription = isGuestMode ? "Vaša voľba sa uloží, ak ste povolili cookies." : "Vyberte si svojho nového avatara alebo sa odhláste.";

  return (
    <GeneralModal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      description={modalDescription}
    >
      <div className="avatar-modal">
        <div className="avatar-modal__tabs">
          {Object.keys(AVATAR_DATA).map(group => (
            <button
              key={group}
              className={`avatar-modal__tab ${activeGroup === group ? 'avatar-modal__tab--active' : ''}`}
              onClick={() => setActiveGroup(group as AvatarGroup)}
            >
              {group.charAt(0).toUpperCase() + group.slice(1)}
            </button>
          ))}
        </div>

        <div className="avatar-modal__grid">
          {AVATAR_DATA[activeGroup].map(avatar => (
            <button
              key={avatar.id}
              className={`avatar-modal__item ${selectedAvatar === avatar.id ? 'avatar-modal__item--selected' : ''}`}
              onClick={() => setSelectedAvatar(avatar.id)}
            >
              <span className="avatar-modal__item-label">{avatar.label}</span>
            </button>
          ))}
        </div>

        <div className="avatar-modal__actions">
          {isGuestMode ? (
             <div></div> 
          ) : (
            <Button variant="danger" onClick={handleLogoutClick}>Odhlásiť sa</Button>
          )}
          <div className="avatar-modal__actions-group--right">
            <Button variant="cancel" onClick={onClose}>Zrušiť</Button>
            <Button variant="primary" onClick={handleSave}>Uložiť zmeny</Button>
          </div>
        </div>
      </div>
    </GeneralModal>
  );
};

export default AvatarModal;
