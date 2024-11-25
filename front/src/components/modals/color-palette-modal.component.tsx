// front/src/components/modals/color-palette-modal.component.tsx
import React, { useState } from "react";
import { TAILWIND_COLORS } from "@constants/theme/colors";
import { FaTimes } from "react-icons/fa";
import Toast, { Toaster } from "react-hot-toast";

interface ColorPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ColorPaletteModal: React.FC<ColorPaletteModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const copyColorToClipboard = (color: string) => {
    navigator.clipboard.writeText(color);
    Toast.success(`Copied ${color} to clipboard!`);
  };

  return (
    <>
      <Toaster />
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
              Tailwind Color Palette
            </h2>

            {/* Color Grid */}
            <div className="grid grid-cols-6 gap-4 mb-modal-gap">
              {Object.keys(TAILWIND_COLORS).map((colorGroup) => (
                <div key={colorGroup} className="space-y-2">
                  <h3 className="font-medium text-sm">{colorGroup}</h3>
                  {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(
                    (shade) => (
                      <div
                        key={`${colorGroup}-${shade}`}
                        className={`w-full h-10 rounded cursor-pointer hover:opacity-80`}
                        style={{
                          backgroundColor: `var(--tw-color-${colorGroup}-${shade})`,
                        }}
                        onClick={() =>
                          copyColorToClipboard(
                            `var(--tw-color-${colorGroup}-${shade})`
                          )
                        }
                      >
                        <span className="sr-only">{`var(--tw-color-${colorGroup}-${shade})`}</span>
                      </div>
                    )
                  )}
                </div>
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
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ColorPaletteModal;
