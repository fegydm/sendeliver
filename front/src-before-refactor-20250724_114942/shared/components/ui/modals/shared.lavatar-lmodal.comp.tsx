// File: src/shared/components/ui/modals/shared.lavatar-lmodal.comp.tsx
// Last change: Cleaned up, translated to English, and verified for new auth system

import React, { useState, useEffect } from 'react';
import { useAuth } from '@shared/contexts/AuthContext';
import GeneralModal from './general.modal';
import { Button } from '../ui/button.ui';
import './shared.lavatar-lmodal.css';

interface AvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onSave: (avatarId: string) => void;
  isGuestMode?: boolean;
  cookiesAllowed?: boolean;
  initialAvatar?: string | null;
}

type AvatarGroup = 'photos' | 'zodiac' | 'fantasy';

const AVATAR_DATA = {
  photos: Array.from({ length: 5 }, (_, i) => ({ id: `photo-${i + 1}`, label: `Photo ${i + 1}` })),
  zodiac: ["aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"].map(s => ({ id: s, label: s.charAt(0).toUpperCase() + s.slice(1) })),
  fantasy: ["Warrior", "Mage", "Archer", "Rogue", "Knight", "Wizard", "Paladin", "Monk"].map(c => ({ id: c.toLowerCase(), label: c })),
};

const AvatarModal: React.FC<AvatarModalProps> = ({ isOpen, onClose, onLogout, onSave, isGuestMode = false, initialAvatar = null }) => {
  const { user } = useAuth();
  const [activeGroup, setActiveGroup] = useState<AvatarGroup>('zodiac');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(initialAvatar);

  useEffect(() => {
    if (isOpen) {
      let initialId = null;
      if (initialAvatar) {
        if (initialAvatar.includes('/')) {
          const parts = initialAvatar.split('/');
          initialId = parts[parts.length - 1].replace('.png', '');
        } else {
          initialId = initialAvatar;
        }
      }
      setSelectedAvatar(initialId);
    }
  }, [isOpen, initialAvatar]);

  const handleSave = () => {
    if (!selectedAvatar) {
      alert("Please select an avatar first.");
      return;
    }
    onSave(selectedAvatar);
  };

  const handleLogoutClick = () => {
    onLogout();
  };

  const modalTitle = isGuestMode ? "Choose Your Avatar" : `Profile: ${user?.name || 'User'}`;
  const modalDescription = isGuestMode ? "Your choice will be saved if you've allowed cookies." : "Choose your new avatar or log out.";

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
              title={avatar.label}
            >
              <img 
                src={`/avatars/zodiac/${avatar.id}.png`} 
                alt={avatar.label}
                className="avatar-modal__item-image"
              />
            </button>
          ))}
        </div>

        <div className="avatar-modal__actions">
          {isGuestMode ? (
             <div /> 
          ) : (
            <Button variant="danger" onClick={handleLogoutClick}>Log Out</>
          )}
          <div className="avatar-modal__actions-group--right">
            <Button variant="cancel" onClick={onClose}>Cancel</>
            <Button variant="primary" onClick={handleSave}>Save Changes</>
          </div>
        </div>
      </div>
    </>
  );
};

export default AvatarModal;