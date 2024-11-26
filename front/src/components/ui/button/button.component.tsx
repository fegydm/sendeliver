// components/ui/button/button.component.tsx
import React from "react";
import { ButtonVariant, ButtonSize, getButtonClasses } from "./button.variants";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "primary", size = "default", className, children, ...props },
    ref
  ) => {
    return (
      <button ref={ref} className={getButtonClasses(variant, size)} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
