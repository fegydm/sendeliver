// File: src/shared/components/ui/modals/shared.ldemo-lwelcome-lmodal.comp.tsx
// Last action: Changed policy link to a button to handle navigation and close correctly.

import React from 'react';
import GeneralModal from './general.modal';
import { Button } from '../ui/button.ui';
import './shared.ldemo-lwelcome-lmodal.css';

interface DemoWelcomeModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
  onAcceptAndRegister: () => void;
  onNavigateToPolicy: () => void;
}

const DemoWelcomeModal: React.FC<DemoWelcomeModalProps> = ({ isOpen, onAccept, onDecline, onAcceptAndRegister, onNavigateToPolicy }) => {
  return (
    <GeneralModal
      isOpen={isOpen}
      onClose={onDecline}
      title="Welcome to the SenDeliver Demo!"
    >
      <div className="demo-welcome-modal">
        <p className="demo-welcome-modal__text">
          You're currently exploring with mock data. To save your settings (like your chosen avatar) for your next visit, we use a single functional cookie. For more details, please see our <button onClick={onNavigateToPolicy} className="demo-welcome-modal__link">Cookie Policy</button>.
        </p>
        <div className="demo-welcome-modal__actions">
          <Button variant="secondary" onClick={onDecline}>Continue as Guest</>
          <Button variant="primary" onClick={onAccept}>Accept & Save Demo</>
        </div>
        <div className="demo-welcome-modal__shortcut">
          <p>
            Or, <button onClick={onAcceptAndRegister} className="demo-welcome-modal__link">Accept & Register Now</button> to unlock the full experience and disable demo data.
          </p>
        </div>
      </div>
    </>
  );
};

export default DemoWelcomeModal;
