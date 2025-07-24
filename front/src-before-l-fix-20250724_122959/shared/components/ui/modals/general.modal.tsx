// File: front/src/components/shared/modals/general.modal.tsx

import React, { useEffect } from "react";
import { Button } from "@/components/shared/ui/button.ui";
import "./general.modal.css";

interface GeneralModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string | React.ReactNode;
  children?: React.ReactNode;
  actions?: React.ReactNode; // Napr. tlačidlá
  className?: string;
}

const GeneralModal: React.FC<generalModalProps> = ({
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
      {/* Pozadie modálu, ktoré po kliknutí zavrie okno */}
      <div className="modal__backdrop" onClick={onClose} />
      
      {/* Kontajner, ktorý centruje obsah */}
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
            </>
          </div>
          
          {description && <p className="modal__description">{description}</p>}
          
          <div className="modal__body">{children}</div>

          {/* === OPRAVA: Pridaná časť na zobrazenie akcií === */}
          {actions && (
            <div className="modal__footer">
              {actions}
            </div>
          )}
          {/* ============================================== */}

        </div>
      </div>
    </>
  );
};

export default GeneralModal;