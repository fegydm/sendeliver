// File: .front/src/components/ui/button.ui.tsx
// This component creates a button with configurable variant, size, fullWidth, and role.
// The "role" property (sender/hauler) is used to apply role-specific styling.
import React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "cancel" | "close" | "ghost" | "floating";
  size?: "default" | "small" | "large" | "icon";
  fullWidth?: boolean;
  role?: "sender" | "hauler"; // New property: defines role for additional styling
  active?: boolean; // true means button is active (fully opaque), false means inactive (will get lower opacity)
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "default",
  fullWidth = false,
  role,
  active = true,
  className = "",
  children,
  ...props
}) => {
  // Build an array of CSS classes based on the provided props.
  // We avoid adding "primary" and "default" classes if they are set as defaults.
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

  // Instead of using the name "position", we use "role" to avoid conflicts.
  if (role) {
    classes.push(`button--${role}`);
  }

  // If the button is not active, add the "inactive" class.
  if (!active) {
    classes.push("inactive");
  }

  if (className) {
    classes.push(className);
  }

  const buttonClasses = classes.filter(Boolean).join(" ");

  return (
    <button className={buttonClasses} {...props}>
      {children}
    </button>
  );
};

export default Button;
