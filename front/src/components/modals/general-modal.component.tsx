// components/modals/general-modal.component.tsx
import React, { useEffect, useRef } from "react";
import { Wrapper } from "@/components/ui/wrapper";

interface GeneralModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  topOffsetVariable?: string; // Externá premenná pre odsadenie zhora
}

const GeneralModal: React.FC<GeneralModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  topOffsetVariable = "--modal-top-offset", // Default premenná
}) => {
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Uloženie posledného fokusu
      lastFocusedElementRef.current = document.activeElement as HTMLElement;

      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;

      // Zablokuj scrollovanie a pridaj padding
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;

      // Funkcia pre zatvorenie cez ESC
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      };

      window.addEventListener("keydown", handleKeyDown);

      return () => {
        // Obnova pôvodného stavu
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;

        // Obnova fokusu na predchádzajúci prvok
        if (lastFocusedElementRef.current) {
          lastFocusedElementRef.current.focus();
        }
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <Wrapper
      variant="modal"
      role="dialog"
      aria-labelledby="modal-title"
      style={{
        top: `var(${topOffsetVariable})`, 
        position: "absolute", 
        border: "2px solid black", 
        padding: "16px", 
      }}
    >
      <div style={{ border: "1px solid black", padding: "8px" }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          style={{
            border: "1px solid black",
            padding: "4px",
            cursor: "pointer",
            background: "none",
          }}
        >
          X
        </button>

        {/* Title */}
        <h2 id="modal-title" style={{ margin: "8px 0", borderBottom: "1px solid black" }}>
          {title}
        </h2>

        {/* Content */}
        <div>{children}</div>
      </div>
    </Wrapper>
  );
};

export default GeneralModal;
