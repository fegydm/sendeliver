// File: src/shared/components/ui/modals/shared.lconfirm-llogout-lmodal.comp.tsx
// Last change: Initial creation of the logout confirmation modal.

import react from 'react';
import generalmodal from './general.modal';
import { Button } from '../ui/button.ui';
import './shared.lconfirm-llogout-lmodal.css';

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
      <div className="confirm-logout-modal__actions">
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
