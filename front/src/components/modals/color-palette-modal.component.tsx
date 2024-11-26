// front/src/components/modals/color-palette-modal.component.tsx
import React, { useState } from "react";

interface CircularPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function generateShadesFromColor(color: string): string[] {
  const baseHue = parseInt(color.slice(1), 16) % 360; // Výpočet Hue z HEX
  return Array.from({ length: 10 }, (_, i) => {
    const lightness = 10 + i * 9; // Rozsah svetlosti od 10% po 100%
    return `hsl(${baseHue}, 70%, ${lightness}%)`;
  });
}

const CircularPaletteModal: React.FC<CircularPaletteModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedColor, setSelectedColor] = useState("#ff5733"); // Defaultná farba
  const shades = generateShadesFromColor(selectedColor);

  if (!isOpen) return null;

  const handleColorPick = (hue: number) => {
    setSelectedColor(`hsl(${hue}, 70%, 50%)`);
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
              &times;
            </button>

            {/* Modal title */}
            <h2 className="text-modal-title font-bold mb-modal-gap">
              Choose Color
            </h2>

            {/* Circular Palette */}
            <div className="relative w-64 h-64 mx-auto">
              {Array.from({ length: 360 }, (_, i) => (
                <div
                  key={i}
                  className="absolute w-3 h-3 rounded-full cursor-pointer"
                  style={{
                    backgroundColor: `hsl(${i}, 70%, 50%)`,
                    transform: `translate(-50%, -50%) rotate(${i}deg) translate(120px)`,
                    transformOrigin: "center",
                  }}
                  onClick={() => handleColorPick(i)}
                ></div>
              ))}
            </div>

            {/* Zobrazenie vybranej farby */}
            <div
              className="mt-4 w-40 h-40 mx-auto rounded shadow-lg border"
              style={{ backgroundColor: selectedColor }}
            ></div>

            {/* Shades Grid */}
            <div className="grid grid-cols-10 gap-2 mt-4">
              {shades.map((shade, index) => (
                <div
                  key={index}
                  className="w-10 h-10 rounded border shadow"
                  style={{ backgroundColor: shade }}
                ></div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-modal-gap mt-4">
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

export default CircularPaletteModal;
