// ./components/ui/wrapper/wrapper.component.tsx
import React from "react";
import { WrapperVariant, getWrapperClasses } from "@/components/ui/index";

export interface WrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: WrapperVariant;
  children: React.ReactNode;
  onClose?: () => void;
  closeOnOutsideClick?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export const Wrapper: React.FC<WrapperProps> = ({
  variant = "modal",
  children,
  onClose,
  closeOnOutsideClick = true,
  style,
  className,
}) => {
  const classes = getWrapperClasses(variant);

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
      className={`${classes.outer} ${className || ""}`}
      onClick={handleOutsideClick}
      role="dialog"
      aria-labelledby={variant === "modal" ? "modal-title" : undefined}
      style={style}
    >
      <div className={classes.inner}>{children}</div>
    </div>
  );
};

export default Wrapper;
