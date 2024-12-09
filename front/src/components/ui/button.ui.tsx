// src/components/Button.tsx
import React from "react";
import "./button.ui.css";
import logicConfig from "@/configs/logic-config.json";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "close";
  size?: "default" | "small" | "large" | "icon";
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "default",
  className,
  children,
  ...props
}) => {
  // Apply logic-based properties if needed
  const isDisabled = logicConfig.modal.backdropOpacity === 0; // Example of using logicConfig

  return (
    <button
      disabled={isDisabled || props.disabled}
      className={`button ${variant} ${size} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
