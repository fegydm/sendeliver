// components/ui/wrapper/wrapper.component.tsx
import React, { useEffect } from "react";
import { WrapperVariant, getWrapperClasses } from "./wrapper.variants";

export interface WrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: WrapperVariant;
  children: React.ReactNode;
  onClose?: () => void; // Optional close handler
  closeOnOutsideClick?: boolean; // Optional control for outside clicks
}

export const Wrapper: React.FC<WrapperProps> = ({
  variant = "modal",
  children,
  onClose,
  closeOnOutsideClick = true,
  ...rest
}) => {
  const classes = getWrapperClasses(variant);

  // Lock body scroll and add ESC key listener
  useEffect(() => {
    if (onClose) {
      const originalOverflow = getComputedStyle(document.body).overflow; // Získanie pôvodnej hodnoty
      document.body.style.overflow = "hidden";

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      };

      window.addEventListener("keydown", handleKeyDown);

      return () => {
        document.body.style.overflow = originalOverflow; // Obnova pôvodnej hodnoty
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [onClose]);

  const handleOutsideClick = (e: React.MouseEvent) => {
    if (
      closeOnOutsideClick &&
      onClose &&
      e.target instanceof HTMLElement &&
      e.target === e.currentTarget
    ) {
      onClose();
    }
  };

  return (
    <div
      className={classes.outer}
      onClick={handleOutsideClick}
      role="dialog"
      aria-labelledby="modal-title"
      {...rest}
    >
      <div className={classes.inner}>
        {children}
      </div>
    </div>
  );
};
