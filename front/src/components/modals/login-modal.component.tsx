// ./front/src/components/modals/login-modal.component.tsx
import React from 'react';
<<<<<<< HEAD
import { FaTimes } from 'react-icons/fa';
=======
import { X } from 'lucide-react';
>>>>>>> 5430219 (up css)

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <>
<<<<<<< HEAD
      {/* Overlay higher z-index */}
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-[100]" />
      
      {/* Modal container s max-height scroll */}
=======
      {/* Overlay s vyšším z-indexom */}
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-[100]" />
      
      {/* Modal container s max-height a scrollom */}
>>>>>>> 5430219 (up css)
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
            <h2 className="text-2xl font-bold mb-4">Login</h2>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border rounded-lg dark:bg-hauler-gray-700 
                          dark:border-hauler-gray-600"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block mb-2">Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border rounded-lg dark:bg-hauler-gray-700 
                          dark:border-hauler-gray-600"
                  placeholder="••••••••"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 hover:bg-hauler-gray-100 dark:hover:bg-hauler-gray-700 
                          rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg 
                          transition-colors"
                >
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

<<<<<<< HEAD
export default LoginModal;
=======
export default LoginModal;
>>>>>>> 5430219 (up css)
