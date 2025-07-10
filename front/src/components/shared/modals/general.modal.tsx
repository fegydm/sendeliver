// File: front/src/components/shared/modals/general.modal.tsx
// Last action: Verified BEM class names to match the final CSS.

import React, { useEffect } from "react";
import { Button } from "@/components/shared/ui/button.ui";
import "./general.modal.css";

interface GeneralModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string | React.ReactNode;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

const GeneralModal: React.FC<GeneralModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  actions,
  className,
}) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener("keydown", handleEsc);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className="modal__backdrop" onClick={onClose} />
      <div className="modal__container">
        <div className={`modal__content ${className || ""}`}>
          <div className="modal__header">
            {title && <h2 className="modal__title">{title}</h2>}
            <Button
              variant="close"
              size="icon"
              onClick={onClose}
              aria-label="Close modal"
              className="modal__close"
            >
              ×
            </Button>
          </div>
          {description && <p className="modal__description">{description}</p>}
          <div className="modal__body">{children}</div>
        </div>
      </div>
    </>
  );
};

export default GeneralModal;