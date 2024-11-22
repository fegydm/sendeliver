// ./front/src/components/modals/register-modal.component.tsx
import React from "react";
import { FaTimes } from "react-icons/fa";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose }) => {
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
            <h2 className="text-modal-title font-bold mb-modal-gap">
              Create Account
            </h2>

            {/* Register Form */}
            <form
              className="space-y-modal-gap"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="grid grid-cols-2 gap-modal-gap">
                <div>
                  <label className="block mb-2 text-modal-text">
                    First Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-modal-light-border 
                             dark:border-modal-dark-border rounded-lg 
                             bg-modal-light-bg dark:bg-modal-dark-bg"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-modal-text">
                    Last Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-modal-light-border 
                             dark:border-modal-dark-border rounded-lg 
                             bg-modal-light-bg dark:bg-modal-dark-bg"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-modal-text">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-modal-light-border 
                           dark:border-modal-dark-border rounded-lg 
                           bg-modal-light-bg dark:bg-modal-dark-bg"
                />
              </div>

              <div>
                <label className="block mb-2 text-modal-text">Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-modal-light-border 
                           dark:border-modal-dark-border rounded-lg 
                           bg-modal-light-bg dark:bg-modal-dark-bg"
                />
              </div>

              <div>
                <label className="block mb-2 text-modal-text">
                  Confirm Password
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-modal-light-border 
                           dark:border-modal-dark-border rounded-lg 
                           bg-modal-light-bg dark:bg-modal-dark-bg"
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
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterModal;
