// ./front/src/components/modals/avatar-modal.component.tsx
import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";

interface AvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AvatarModal: React.FC<AvatarModalProps> = ({ isOpen, onClose }) => {
  const [activeGroup, setActiveGroup] = useState<
    "photos" | "zodiac" | "fantasy"
  >("photos");

  if (!isOpen) return null;

  const avatarGroups = {
    photos: Array.from({ length: 5 }, (_, i) => ({
      id: `photo-${i + 1}`,
      label: `Photo ${i + 1}`,
    })),
    zodiac: [
      "Aries",
      "Taurus",
      "Gemini",
      "Cancer",
      "Leo",
      "Virgo",
      "Libra",
      "Scorpio",
      "Sagittarius",
      "Capricorn",
      "Aquarius",
      "Pisces",
    ].map((sign) => ({
      id: sign.toLowerCase(),
      label: sign,
    })),
    fantasy: [
      "Warrior",
      "Mage",
      "Archer",
      "Rogue",
      "Knight",
      "Wizard",
      "Paladin",
      "Monk",
    ].map((char) => ({
      id: char.toLowerCase(),
      label: char,
    })),
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-modal-backdrop backdrop-blur-modal z-modalBackdrop" />

      {/* Modal container */}
      <div
        style={{ top: "var(--modal-top-offset)" }}
        className="fixed left-1/2 transform -translate-x-1/2 w-full max-w-modal mx-modal-sides z-modal"
      >
        <div
          className="bg-modal-light-bg dark:bg-modal-dark-bg rounded-modal shadow-modal 
                   max-h-[90vh] overflow-y-auto"
        >
          <div className="relative p-6">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 hover:bg-modal-light-hover 
                        dark:hover:bg-modal-dark-hover rounded-lg transition-colors duration-modal"
              aria-label="Close modal"
            >
              <FaTimes size={20} />
            </button>

            {/* Modal title */}
            <h2 className="text-modal-title font-bold mb-modal-gap">
              Choose Avatar
            </h2>

            {/* Avatar Groups Tabs */}
            <div className="flex space-x-2 mb-modal-gap border-b border-modal-light-border dark:border-modal-dark-border">
              {["photos", "zodiac", "fantasy"].map((group) => (
                <button
                  key={group}
                  onClick={() => setActiveGroup(group as typeof activeGroup)}
                  className={`px-4 py-2 rounded-t-lg transition-colors duration-modal
                            ${
                              activeGroup === group
                                ? "bg-modal-light-hover dark:bg-modal-dark-hover border-b-2 border-navbar-light-button-bg dark:border-navbar-dark-button-bg"
                                : "hover:bg-modal-light-hover dark:hover:bg-modal-dark-hover"
                            }`}
                >
                  {group.charAt(0).toUpperCase() + group.slice(1)}
                </button>
              ))}
            </div>

            {/* Avatar Grid */}
            <div
              className={`grid gap-modal-gap mb-modal-gap
                         ${
                           activeGroup === "photos"
                             ? "grid-cols-5"
                             : activeGroup === "zodiac"
                               ? "grid-cols-4"
                               : "grid-cols-4"
                         }`}
            >
              {avatarGroups[activeGroup].map((avatar) => (
                <button
                  key={avatar.id}
                  className="aspect-square rounded-lg bg-modal-light-hover dark:bg-modal-dark-hover
                           hover:ring-2 ring-navbar-light-button-bg dark:ring-navbar-dark-button-bg
                           transition-all duration-modal flex items-center justify-center"
                >
                  <span className="text-sm font-medium">{avatar.label}</span>
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-modal-gap">
              <button
                onClick={onClose}
                className="px-4 py-2 hover:bg-modal-light-hover 
                         dark:hover:bg-modal-dark-hover rounded-lg 
                         transition-colors duration-modal"
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-navbar-light-button-bg hover:bg-navbar-light-button-hover 
                         text-navbar-light-button-text dark:bg-navbar-dark-button-bg 
                         dark:hover:bg-navbar-dark-button-hover dark:text-navbar-dark-button-text 
                         rounded-lg transition-colors duration-modal"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AvatarModal;
