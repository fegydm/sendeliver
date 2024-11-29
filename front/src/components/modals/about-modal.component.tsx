// ./front/src/components/modals/about-modal.component.tsx
import React from "react";
import { FaTimes } from "react-icons/fa";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-modal-backdrop backdrop-blur-modal z-modalBackdrop" />

      <div
        style={{ top: "var(--modal-top-offset)" }}
        className="fixed left-1/2 transform -translate-x-1/2 w-full max-w-modal mx-modal-sides z-modal"
      >
        <div className="bg-modal-light-bg dark:bg-modal-dark-bg rounded-modal shadow-modal max-h-[90vh] overflow-y-auto">
          <div className="relative p-6">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 hover:bg-modal-light-hover dark:hover:bg-modal-dark-hover rounded-lg transition-colors duration-modal"
              aria-label="Close modal"
            >
              <FaTimes size={20} />
            </button>

            <h2 className="text-modal-title font-bold mb-modal-gap">
              About SenDeliver
            </h2>

            <div className="space-y-modal-gap">
              <div className="text-modal-text">
                <h3 className="font-semibold mb-2">Who We Are</h3>
                <p className="mb-4">
                  SenDeliver is your trusted partner in logistics and delivery
                  solutions. We connect clients, forwarders, and carriers to
                  create a seamless delivery experience.
                </p>

                <h3 className="font-semibold mb-2">Our Mission</h3>
                <p className="mb-4">
                  To revolutionize the delivery industry by providing
                  innovative, efficient, and sustainable solutions that benefit
                  all stakeholders in the delivery chain.
                </p>

                <h3 className="font-semibold mb-2">Get Started</h3>
                <p>
                  Join our platform today to experience the future of delivery
                  services.
                </p>
              </div>

              <div className="flex justify-end space-x-modal-gap">
                <button
                  onClick={onClose}
                  className="px-4 py-2 hover:bg-modal-light-hover dark:hover:bg-modal-dark-hover rounded-lg transition-colors duration-modal"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    onClose();
                    // opening Register modal
                    document.dispatchEvent(
                      new CustomEvent("openRegisterModal")
                    );
                  }}
                  className="px-4 py-2 bg-navbar-light-button-bg hover:bg-navbar-light-button-hover 
                           text-navbar-light-button-text dark:bg-navbar-dark-button-bg 
                           dark:hover:bg-navbar-dark-button-hover dark:text-navbar-dark-button-text 
                           rounded-lg transition-colors duration-modal"
                >
                  Create Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutModal;
