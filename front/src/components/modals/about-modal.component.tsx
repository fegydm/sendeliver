// ./front/src/components/modals/about-modal.component.tsx
import React from 'react';
import { FaTimes } from 'react-icons/fa';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
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
              <FaTimes size={20} />
            </button>
            <h2 className="text-2xl font-bold mb-4">About SenDeliver</h2>
            <p className="mb-4">
              SenDeliver is a comprehensive logistics platform designed to connect carriers 
              with clients efficiently. Our platform streamlines the delivery process, 
              making it easier for both parties to manage their operations.
            </p>
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

export default AboutModal;
