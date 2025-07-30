// File: front/src/shared/ui/button.ui.tsx
// Last action: Added 'link' variant to the component props.

import React from "react";
import './button.ui.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "cancel" | "close" | "ghost" | "floating" | "link";
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
  className,
  type = "button",
  children,
  ...props
}) => {
  const buttonClasses = [
    "button",
    variant && `button--${variant}`,
    size !== "default" && `button--${size}`,
    fullWidth && "button--full-width",
    role && `button--${role}`,
    position && `button--${position}`,
    !active && "button--inactive",
    className,
  ]
  .filter(Boolean)
  .join(" ");

  return (
    <button type={type} className={buttonClasses} {...props}>
      {children}
    </button>
  );
};

export default Button;
