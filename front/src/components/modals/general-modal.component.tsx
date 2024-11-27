// ./components/modals/general-modal.component.tsx
import React from "react";
import { Button } from "@/components/ui";

interface GeneralModalProps {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}

const GeneralModal: React.FC<GeneralModalProps> = ({
  isOpen,
  onClose,
  children,
  actions,
}) => {
  React.useEffect(() => {
    if (isOpen) {
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.body.style.overflow = "hidden";

      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
          }
        }
      };

      window.addEventListener("keydown", handleEsc);

      return () => {
        document.body.style.paddingRight = "";
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleEsc);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
      <div
        style={{ top: "var(--modal-top-offset)" }}
        className="fixed left-1/2 transform -translate-x-1/2 w-full max-w-lg mx-4 z-50"
      >
        <div
          className="relative p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 w-10 h-10 rounded hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition"
          >
            <span className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              &times;
            </span>
          </button>

          <div className="mt-4">{children}</div>

          <div className="flex justify-end items-center mt-6 gap-4">
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
