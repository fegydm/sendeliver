// File: front/src/components/shared/modals/AvatarModal.tsx
// Last action: Refactored to use GeneralModal, AuthContext, and BEM styles.

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import GeneralModal from './general.modal';
import { Button } from '../ui/button.ui';
import './AvatarModal.css';

interface AvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

type AvatarGroup = 'photos' | 'zodiac' | 'fantasy';

const AVATAR_DATA = {
  photos: Array.from({ length: 5 }, (_, i) => ({ id: `photo-${i + 1}`, label: `Photo ${i + 1}` })),
  zodiac: ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"].map(s => ({ id: s.toLowerCase(), label: s })),
  fantasy: ["Warrior", "Mage", "Archer", "Rogue", "Knight", "Wizard", "Paladin", "Monk"].map(c => ({ id: c.toLowerCase(), label: c })),
};

const AvatarModal: React.FC<AvatarModalProps> = ({ isOpen, onClose, onLogout }) => {
  const { user } = useAuth();
  const [activeGroup, setActiveGroup] = useState<AvatarGroup>('photos');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);

  const handleSave = () => {
    if (!selectedAvatar) {
      alert("Najprv si vyberte avatara.");
      return;
    }
    // TODO: Implement API call to update user's avatar
    console.log(`Ukladám avatara: ${selectedAvatar} pre používateľa: ${user?.name}`);
    onClose();
  };

  const handleLogoutClick = () => {
    onLogout();
    onClose();
  };

  return (
    <GeneralModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Profil: ${user?.name || 'Používateľ'}`}
      description="Vyberte si svojho nového avatara alebo sa odhláste."
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
          <Button variant="danger" onClick={handleLogoutClick}>Odhlásiť sa</Button>
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