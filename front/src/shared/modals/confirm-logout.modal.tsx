// File: front/src/shared/modals/confirm-logout.modal.tsx
// Last change: Initial creation of the logout confirmation modal.

import React from 'react';
import GeneralModal from './general.modal';
import { Button } from '../ui/button.ui';
import './confirm-logout.modal.css';

interface ConfirmLogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmLogoutModal: React.FC<ConfirmLogoutModalProps> = ({ isOpen, onClose, onConfirm }) => {
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
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Áno, odhlásiť
        </Button>
      </div>
    </GeneralModal>
  );
};

export default ConfirmLogoutModal;
