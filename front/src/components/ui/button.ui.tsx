import React from "react";
import "./button.ui.css";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "close" | "ghost";
  size?: "default" | "small" | "large" | "icon";
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "default",
  fullWidth = false,
  className = "",
  children,
  ...props
}) => {
  return (
    <button
      className={`
        btn
        btn-${variant}
        btn-${size}
        ${fullWidth ? "btn-full-width" : ""}
        ${className}
      `
        .trim()
        .replace(/\s+/g, " ")}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
