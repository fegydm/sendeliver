// File: front/src/components/shared/modals/AboutModal.tsx
// Last action: Reverted brand name to working title 'SenDeliver' for beta testing phase.

import React from "react";
import { Button } from "@/components/shared/ui/button.ui";
import GeneralModal from "@/components/shared/modals/general.modal";
import "./AboutModal.css";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToRegister: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose, onNavigateToRegister }) => {
  
  const handleCreateAccount = () => {
    onClose(); 
    onNavigateToRegister();
  };

  return (
    <GeneralModal
      isOpen={isOpen}
      onClose={onClose}
      title="About SenDeliver"
      variant="info"
    >
      <div className="about-modal">
        <section className="about-modal__section">
          <h3 className="about-modal__subtitle">Kto Sme</h3>
          <p className="about-modal__paragraph">
            SenDeliver je váš dôveryhodný partner v logistike. Spájame klientov, 
            špeditérov a dopravcov, aby sme vytvorili plynulý a efektívny dopravný ekosystém.
          </p>
        </section>

        <section className="about-modal__section">
          <h3 className="about-modal__subtitle">Naša Misia</h3>
          <p className="about-modal__paragraph">
            Priniesť revolúciu do logistického odvetvia prostredníctvom inovatívnych, efektívnych a udržateľných riešení, ktoré prinášajú hodnotu všetkým zúčastneným stranám.
          </p>
        </section>

        <div className="about-modal__actions">
          <Button variant="primary" onClick={handleCreateAccount}>
            Vytvoriť Účet
          </Button>
        </div>
      </div>
    </GeneralModal>
  );
};

export default AboutModal;