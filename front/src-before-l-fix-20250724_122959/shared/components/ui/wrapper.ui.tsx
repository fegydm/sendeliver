// ./components/ui/wrapper/wrapper.ui.tsx
import react from "react";

export type WrapperVariant = "modal" | "drawer" | "popup";

interface WrapperClasses {
  outer: string;
  inner: string;
}

export const getWrapperClasses = (variant: WrapperVariant): WrapperClasses => {
  const baseOuterClasses =
    "fixed inset-0 z-50 flex items-center justify-center";
  const baseInnerClasses = "relative bg-background rounded-lg shadow-lg";

  switch (variant) {
    case "modal":
      return {
        outer: `${baseOuterClasses} bg-black/80`,
        inner: `${baseInnerClasses} w-full max-w-lg mx-4 max-h-[90vh]`,
      };
    case "drawer":
      return {
        outer: `${baseOuterClasses} bg-black/50`,
        inner: `${baseInnerClasses} h-full w-full max-w-md ml-auto transform transition-transform`,
      };
    case "popup":
      return {
        outer: `${baseOuterClasses}`,
        inner: `${baseInnerClasses} w-full max-w-sm transform transition-all`,
      };
    default:
      return {
        outer: baseOuterClasses,
        inner: baseInnerClasses,
      };
  }
};

export interface WrapperProps extends React.HTMLAttributes<hTMLDivElement> {
  variant?: WrapperVariant;
  children: React.ReactNode;
  onClose?: () => void;
  closeOnOutsideClick?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export const Wrapper: React.FC<wrapperProps> = ({
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
