// File: .front/src/components/ui/button.ui.tsx
// Last change: Added support for button type attribute (submit, button, reset)

import React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "cancel" | "close" | "ghost" | "floating";
  size?: "default" | "small" | "large" | "icon";
  fullWidth?: boolean;
  role?: "sender" | "hauler"; 
  active?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset"; 
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "default",
  fullWidth = false,
  role,
  active = true,
  className = "",
  type = "button", 
  children,
  ...props
}) => {
  // Build an array of CSS classes based on the provided props.
  const classes = ["button"];

  if (variant === "floating") {
    classes.push("button--floating");
  } else if (variant !== "primary") {
    classes.push(`button-${variant}`);
  }

  if (size !== "default") {
    classes.push(`button-${size}`);
  }

  if (fullWidth) {
    classes.push("button-full-width");
  }

  if (role) {
    classes.push(`button--${role}`);
  }

  if (!active) {
    classes.push("inactive");
  }

  if (className) {
    classes.push(className);
  }

  const buttonClasses = classes.filter(Boolean).join(" ");

  return (
    <button type={type} className={buttonClasses} {...props}>
      {children}
    </button>
  );
};

export default Button;