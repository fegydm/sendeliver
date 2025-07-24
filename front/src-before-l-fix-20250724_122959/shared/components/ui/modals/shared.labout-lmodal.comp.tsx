// File: src/shared/components/ui/modals/shared.labout-lmodal.comp.tsx
// Last action: Reverted brand name to working title 'SenDeliver' for beta testing phase.

import react from "react";
import { Button } from "@/components/shared/ui/button.ui";
import generalmodal from "@/components/shared/modals/general.modal";
import "./shared.labout-lmodal.css";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToRegister: () => void;
}

const AboutModal: React.FC<aboutModalProps> = ({ isOpen, onClose, onNavigateToRegister }) => {
  
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
          </>
        </div>
      </div>
    </>
  );
};

export default AboutModal;