// File: .front/src/components/modals/general.modal.tsx
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button.ui";
import "./general.modal.css";

interface GeneralModalProps {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  title?: string;
  variant?: "default" | "danger" | "info" | "success" | "warning";
  closeOnBackdropClick?: boolean;
  className?: string; // Pridané className
}

const GeneralModal: React.FC<GeneralModalProps> = ({
  isOpen,
  onClose,
  children,
  actions,
  title,
  variant = "default",
  closeOnBackdropClick = true,
  className, // Pridané do destrukturovania
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
          className={`modal__content ${className || ""}`} // Použitie className
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          <Button
            variant="close"
            size="icon"
            onClick={onClose}
            aria-label="Close modal"
            className="modal__close"
          >
            ×
          </Button>
          {title && <h2 className="modal__title">{title}</h2>}
          <div className="modal__body">{children}</div>
          {actions && <div className="modal__actions">{actions}</div>}
        </div>
      </div>
    </>
  );
};

export default GeneralModal;