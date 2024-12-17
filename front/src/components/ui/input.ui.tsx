// ./components/ui/input/input.ui.tsx

import React from "react";
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  variant?: "default" | "search";
  state?: "normal" | "error" | "success";
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      variant = "default",
      state = "normal",
      error,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full">
        {/* Label */}
        {label && <label className="input-label">{label}</label>}

        {/* Input Field */}
        <input
          ref={ref}
          className={`input ${variant === "search" ? "input--search" : ""} ${
            state === "error" ? "input--error" : ""
          } ${state === "success" ? "input--success" : ""} ${className}`}
          {...props}
        />

        {/* Error Message */}
        {error && <p className="input-error-message">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
