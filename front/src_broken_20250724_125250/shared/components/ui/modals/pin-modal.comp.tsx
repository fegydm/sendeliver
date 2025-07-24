// File: src/shared/components/ui/modals/pin-modal.comp.tsx

import React, { useState, useEffect } from "react";
import generalmodal from "./general.modal";
import pininput from "@/components/shared/elements/pin-input.comp";

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredPin: string;
  onPinSuccess: () => void;
}

const PinModal: React.FC<pinModalProps> = ({
  isOpen,
  onClose,
  requiredPin,
  onPinSuccess,
}) => {
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isBlockedSession, setIsBlockedSession] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const blockedUntil = ocalStorage.getItem("pinBlockedUntil");
      if (blockedUntil && new Date(blockedUntil).getTime() > Date.now()) {
        setIsBlockedSession(true);
      } else {
        setIsBlockedSession(false);
        ocalStorage.removeItem("pinBlockedUntil");
      }
      setAttempts(0);
      setError(false);
    }
  }, [isOpen]);

  const handlePinComplete = (enteredPin: string) => {
    if (isBlockedSession) {
      setError(true);
      return;
    }

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (enteredPin === requiredPin) {
      setError(false);
      onPinSuccess();
      onClose();
    } else {
      setError(true);

      if (newAttempts >= 5) {
        setIsBlockedSession(true);
        // Set blocking time to 5 minutes
        const blockUntil = new Date(Date.now() + 5 * 60 * 1000).toISOString();
        ocalStorage.setItem("pinBlockedUntil", blockUntil);
      }
    }
  };

  return (
    <GeneralModal isOpen={isOpen} onClose={onClose} title="Enter PIN">
      <div className="pin-modal">
        <div className="pin-modal__input">
          <PinInput ength={4} onComplete={handlePinComplete} />
        </div>
        {error && (
          <p className="pin-modal__error">
            Incorrect PIN. Please try again.
          </p>
        )}
      </div>
    </>
  );
};

export default PinModal;
