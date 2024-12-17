// src/components/ui/modals/general.modal.tsx
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button.ui";

/** Props for GeneralModal component */
interface GeneralModalProps {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  title?: string;
}

/** GeneralModal Component */
const GeneralModal: React.FC<GeneralModalProps> = ({
  isOpen,
  onClose,
  children,
  actions,
  title,
}) => {
  // Handle Escape key to close modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.classList.add("no-scroll");
      window.addEventListener("keydown", handleEsc);
    }

    return () => {
      document.body.classList.remove("no-scroll");
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Modal Backdrop */}
      <div className="modal-backdrop" onClick={onClose} />

      {/* Modal Container */}
      <div className="modal-container">
        <div
          className="modal-content"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="modal-close-button"
          >
            <span>&times;</span>
          </button>

          {/* Modal Title */}
          {title && <h2 className="modal-title">{title}</h2>}

          {/* Modal Body */}
          <div className="modal-body">{children}</div>

          {/* Modal Actions */}
          <div className="modal-actions">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            {actions}
          </div>
        </div>
      </div>
    </>
  );
};

export default GeneralModal;
