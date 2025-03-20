// File: .front/src/components/modals/AboutModal.tsx
import React from "react";
import { Button } from "@/components/ui/button.ui";
import GeneralModal from "@/components/modals/general.modal";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  // Handler for creating an account and opening register modal
  const handleCreateAccount = () => {
    onClose();
    document.dispatchEvent(new CustomEvent("openRegisterModal"));
  };

  return (
    <GeneralModal
      isOpen={isOpen}
      onClose={onClose}
      title="About SenDeliver"
      variant="info"
      actions={
        // Only Create Account button remains in actions
        <Button variant="primary" onClick={handleCreateAccount}>
          Create Account
        </Button>
      }
    >
      <div className="about-modal">
        <section className="about-modal__section">
          <h3 className="about-modal__subtitle">Who We Are</h3>
          <p className="about-modal__paragraph">
            SenDeliver is your trusted partner in logistics and delivery solutions. We connect clients,
            forwarders, and carriers to create a seamless delivery experience.
          </p>
        </section>

        <section className="about-modal__section">
          <h3 className="about-modal__subtitle">Our Mission</h3>
          <p className="about-modal__paragraph">
            To revolutionize the delivery industry by providing innovative, efficient, and sustainable solutions that
            benefit all stakeholders in the delivery chain.
          </p>
        </section>

        <section className="about-modal__section">
          <h3 className="about-modal__subtitle">Get Started</h3>
          <p className="about-modal__paragraph">
            Join our platform today to experience the future of delivery services.
          </p>
        </section>
      </div>
    </GeneralModal>
  );
};

export default AboutModal;