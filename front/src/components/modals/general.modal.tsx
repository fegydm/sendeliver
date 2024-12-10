import React from "react";
import { Button } from "@/components/ui/button.ui";
import "./general.modal.css";

interface GeneralModalProps {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  title?: string;
}

const GeneralModal: React.FC<GeneralModalProps> = ({
  isOpen,
  onClose,
  children,
  actions,
  title,
}) => {
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      }
    };

    if (isOpen) {
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEsc);
    }

    return () => {
      document.body.style.paddingRight = "";
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-backdrop" />
      <div
        style={{ top: "var(--modal-top-offset)" }}
        className="modal-container"
      >
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="modal-close-button"
          >
            <span className="modal-close-icon">&times;</span>
          </button>

          {title && <h2 className="modal-title">{title}</h2>}

          <div className="modal-body">{children}</div>

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
