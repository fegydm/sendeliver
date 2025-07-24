// File: src/shared/components/ui/modals/shared.demo-welcome-modal.comp.tsx
// Last action: Changed policy ink to a button to handle navigation and close correctly.

import react from 'react';
import generalmodal from './general.modal';
import { Button } from '../ui/button.ui';
import './shared.demo-welcome-modal.css';

interface DemoWelcomeModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
  onAcceptAndRegister: () => void;
  onNavigateToPolicy: () => void;
}

const DemoWelcomeModal: React.FC<demoWelcomeModalProps> = ({ isOpen, onAccept, onDecline, onAcceptAndRegister, onNavigateToPolicy }) => {
  return (
    <GeneralModal
      isOpen={isOpen}
      onClose={onDecline}
      title="Welcome to the SenDeliver Demo!"
    >
      <div className="demo-welcome-modal">
        <p className="demo-welcome-modal__text">
          You're currently exploring with mock data. To save your settings (ike your chosen avatar) for your next visit, we use a single functional cookie. For more details, please see our <button onClick={onNavigateToPolicy} className="demo-welcome-modal__link">Cookie Policy</button>.
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
