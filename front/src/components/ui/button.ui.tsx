// File: ./front/src/components/ui/button.ui.tsx
// Last change: Added position prop and fixed variant handling

import React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "cancel" | "close" | "ghost" | "floating";
  size?: "default" | "small" | "large" | "icon";
  fullWidth?: boolean;
  role?: "sender" | "hauler"; 
  position?: "left" | "right" | "center";
  active?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset"; 
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "default",
  fullWidth = false,
  role,
  position,
  active = true,
  className = "",
  type = "button", 
  children,
  ...props
}) => {
  // Build an array of CSS classes based on the provided props
  const classes = ["button"];

  // Handle variant
  if (variant) {
    classes.push(`button--${variant}`);
  }

  // Handle size
  if (size !== "default") {
    classes.push(`button--${size}`);
  }

  // Handle fullWidth
  if (fullWidth) {
    classes.push("button--full-width");
  }

  // Handle role (sender/hauler)
  if (role) {
    classes.push(`button--${role}`);
  }

  // Handle position
  if (position) {
    classes.push(`button--${position}`);
  }

  // Handle active state
  if (!active) {
    classes.push("button--inactive");
  }

  // Add custom className
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