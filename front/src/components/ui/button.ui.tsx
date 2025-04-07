// File: src/components/ui/button.ui.tsx
import React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "cancel" | "close" | "ghost" | "floating";
  size?: "default" | "small" | "large" | "icon";
  fullWidth?: boolean;
  position?: "left" | "right" | "sender" | "hauler";
  active?: boolean; // Indicates if the button is in an active state
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "default",
  fullWidth = false,
  position,
  active = false,
  className = "",
  children,
  ...props
}) => {
  // Determine button classes based on variant.
  // If variant is "floating", use a specific class.
  const buttonClasses = [
    "button", // Base class
    variant === "floating" ? "button--floating" : `button-${variant}`,
    `button-${size}`,
    fullWidth ? "button-full-width" : "",
    position ? `button--${position}` : "",
    active ? "active" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={buttonClasses} {...props}>
      {children}
    </button>
  );
};

export default Button;
