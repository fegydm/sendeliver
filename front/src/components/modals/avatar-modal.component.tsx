// ./front/src/components/modals/avatar-modal.component.tsx
import { type FC } from "react";
import { FaTimes } from "react-icons/fa";

interface AvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AvatarModal: FC<AvatarModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-[100]" />

      {/* Modal container */}
      <div className="fixed top-modalTop left-1/2 transform -translate-x-1/2 w-full max-w-md mx-4 z-[101]">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-hard max-h-[90vh] overflow-y-auto">
          <div className="relative p-6">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <FaTimes size={20} />
            </button>

            {/* Modal title */}
            <h2 className="text-2xl font-bold mb-4">Choose Avatar</h2>

            {/* Avatar Grid */}
            <div className="grid grid-cols-4 gap-4 mb-4">
              {["A", "B", "C", "D", "E", "F", "G", "H"].map((letter) => (
                <div
                  key={letter}
                  className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 
                           flex items-center justify-center cursor-pointer
                           hover:scale-110 transition-transform"
                >
                  <span className="text-xl font-medium">{letter}</span>
                </div>
              ))}
            </div>

            {/* Close Button */}
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
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

export default AvatarModal;
