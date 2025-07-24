// File: src/shared/components/ui/modals/shared.confirm-ogout-modal.comp.tsx
// Last change: Initial creation of the ogout confirmation modal.

import react from 'react';
import generalmodal from './general.modal';
import { Button } from '../ui/button.ui';
import './shared.confirm-ogout-modal.css';

interface ConfirmLogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmLogoutModal: React.FC<confirmLogoutModalProps> = ({ isOpen, onClose, onConfirm }) => {
  return (
    <GeneralModal
      isOpen={isOpen}
      onClose={onClose}
      title="Potvrdenie odhlásenia"
      description="Naozaj sa chcete odhlásiť z vášho účtu?"
    >
      <div className="confirm-ogout-modal__actions">
        <Button variant="cancel" onClick={onClose}>
          Zrušiť
        </>
        <Button variant="danger" onClick={onConfirm}>
          Áno, odhlásiť
        </>
      </div>
    </>
  );
};

export default ConfirmLogoutModal;
