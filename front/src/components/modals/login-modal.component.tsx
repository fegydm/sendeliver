// ./front/src/components/modals/login-modal.component.tsx
import React from "react";
import { FaTimes } from "react-icons/fa";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

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
            <h2 className="text-modal-title font-bold mb-modal-gap">Login</h2>

            {/* Login Form */}
            <form
              className="space-y-modal-gap"
              onSubmit={(e) => e.preventDefault()}
            >
              <div>
                <label className="block mb-2 text-modal-text">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-modal-light-border 
                           dark:border-modal-dark-border rounded-lg 
                           bg-modal-light-bg dark:bg-modal-dark-bg"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block mb-2 text-modal-text">Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-modal-light-border 
                           dark:border-modal-dark-border rounded-lg 
                           bg-modal-light-bg dark:bg-modal-dark-bg"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex justify-end space-x-modal-gap">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 hover:bg-modal-light-hover 
                           dark:hover:bg-modal-dark-hover rounded-lg 
                           transition-colors duration-modal"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-navbar-light-button-bg hover:bg-navbar-light-button-hover 
                           text-navbar-light-button-text dark:bg-navbar-dark-button-bg 
                           dark:hover:bg-navbar-dark-button-hover dark:text-navbar-dark-button-text 
                           rounded-lg transition-colors duration-modal"
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

export default LoginModal;
