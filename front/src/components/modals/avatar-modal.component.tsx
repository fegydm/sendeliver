// ./front/src/components/modals/avatar-modal.component.tsx
import React from 'react';
<<<<<<< HEAD
import { FaTimes } from 'react-icons/fa';
=======
import { X } from 'lucide-react';
>>>>>>> 5430219 (up css)

interface AvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AvatarModal: React.FC<AvatarModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-[100]" />
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                    w-full max-w-md mx-4 z-[101]">
        <div className="bg-white dark:bg-hauler-gray-800 rounded-xl shadow-hard
                      max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 hover:bg-hauler-gray-100 
                        dark:hover:bg-hauler-gray-700 rounded-lg transition-colors"
              aria-label="Close modal"
            >
<<<<<<< HEAD
              <FaTimes size={20} />
=======
              <X size={20} />
>>>>>>> 5430219 (up css)
            </button>
            <h2 className="text-2xl font-bold mb-4">Choose Avatar</h2>
            <div className="grid grid-cols-4 gap-4 mb-4">
              {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((letter) => (
                <div
                  key={letter}
                  className="w-16 h-16 rounded-full bg-hauler-gray-200 dark:bg-hauler-gray-700 
                          flex items-center justify-center cursor-pointer
                          hover:scale-110 transition-transform"
                >
                  <span className="text-xl font-medium">{letter}</span>
                </div>
              ))}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg 
                      transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

<<<<<<< HEAD
export default AvatarModal;
=======
export default AvatarModal;
>>>>>>> 5430219 (up css)
