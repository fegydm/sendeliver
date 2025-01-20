// File: src/components/ui/modals/general.modal.tsx
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button.ui";

interface GeneralModalProps {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  title?: string;
  variant?: "default" | "danger" | "info"; // Optional style variants
  closeOnBackdropClick?: boolean; // Optional backdrop behavior
}

const GeneralModal: React.FC<GeneralModalProps> = ({
  isOpen,
  onClose,
  children,
  actions,
  title,
  variant = "default",
  closeOnBackdropClick = true,
}) => {
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
      <div
        className="modal__backdrop"
        onClick={closeOnBackdropClick ? onClose : undefined}
      />
      <div className={`modal__container modal__container--${variant}`}>
        <div
          className="modal__content"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          {/* Modal Header */}
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="modal__close-button"
          >
            <span>&times;</span>
          </button>
          {title && <h2 className="modal__title">{title}</h2>}

          {/* Modal Body */}
          <div className="modal__body">{children}</div>

          {/* Modal Actions */}
          <div className="modal__actions">
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
