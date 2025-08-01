// File: front/src/shared/modals/logout.modal.tsx
// Last change: Refactored to use GeneralModal base with custom styling

import React from 'react';
import GeneralModal from './general.modal';
import { Button } from '@/shared/ui/button.ui';
import './logout.modal.css';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTabCount: number;
  onLogoutCurrent: () => void;
  onLogoutAll: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({
  isOpen,
  onClose,
  activeTabCount,
  onLogoutCurrent,
  onLogoutAll
}) => {
  const isSingleTab = activeTabCount <= 1;

  const modalActions = (
    <div className="logout-modal__actions">
      <Button
        variant="secondary"
        onClick={onClose}
        className="logout-modal__cancel"
      >
        Cancel
      </Button>
    </div>
  );

  return (
    <GeneralModal
      isOpen={isOpen}
      onClose={onClose}
      title="Logout Options"
      className="logout-modal"
      actions={modalActions}
    >
      <div className="logout-modal__content">
        <div className="logout-modal__icon">⚠️</div>
        
        {isSingleTab ? (
          <p className="logout-modal__description">
            Are you sure you want to log out?
          </p>
        ) : (
          <div className="logout-modal__multi-tab-info">
            <p className="logout-modal__tab-count">
              You have <strong>{activeTabCount} tabs</strong> open with Sendeliver.
            </p>
            <p className="logout-modal__instruction">
              Choose how you want to logout:
            </p>
          </div>
        )}

        <div className="logout-modal__options">
          {!isSingleTab && (
            <>
              <button
                onClick={onLogoutCurrent}
                className="logout-modal__option logout-modal__option--current"
              >
                <div className="logout-modal__option-icon">📄</div>
                <div className="logout-modal__option-content">
                  <div className="logout-modal__option-title">
                    Logout from this tab only
                  </div>
                  <div className="logout-modal__option-subtitle">
                    Other tabs will stay logged in
                  </div>
                </div>
              </button>

              <button
                onClick={onLogoutAll}
                className="logout-modal__option logout-modal__option--all"
              >
                <div className="logout-modal__option-icon">🚪</div>
                <div className="logout-modal__option-content">
                  <div className="logout-modal__option-title">
                    Logout from all tabs
                  </div>
                  <div className="logout-modal__option-subtitle">
                    Close session in all {activeTabCount} tabs
                  </div>
                </div>
              </button>
            </>
          )}

          {isSingleTab && (
            <button
              onClick={onLogoutCurrent}
              className="logout-modal__option logout-modal__option--single"
            >
              <div className="logout-modal__option-icon">🚪</div>
              <div className="logout-modal__option-content">
                <div className="logout-modal__option-title">
                  Logout
                </div>
              </div>
            </button>
          )}
        </div>
      </div>
    </GeneralModal>
  );
};

export default LogoutModal;