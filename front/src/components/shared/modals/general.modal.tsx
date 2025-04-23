// File: ./front/src/components/modals/general.modal.tsx
import React, { useEffect } from "react";
import { Button } from "@/components/shared/ui/button.ui";
// import "./general.modal.css";

interface GeneralModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string | React.ReactNode;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  variant?: "default" | "danger" | "info" | "success" | "warning";
  className?: string;
}

const GeneralModal: React.FC<GeneralModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  actions,
  variant = "default",
  className,
}) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();

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
      <div className="modal__backdrop" onClick={onClose} />
      <div className={`modal__container modal__container--${variant}`}>
        <div className={`modal__content ${className || ""}`}>
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
          {description && <p className="modal__description">{description}</p>}
          <div className="modal__body">{children}</div>
          {actions && <div className="modal__actions">{actions}</div>}
        </div>
      </div>
    </>
  );
};

export default GeneralModal;