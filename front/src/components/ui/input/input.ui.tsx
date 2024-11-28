// ./components/ui/input/input.ui.tsx
// This file defines the Input component using both theme and logic configurations.

import React from "react";
import themeConfig from "@/configs/theme-config.json";
import logicConfig from "@/configs/logic-config.json";

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
    // Fetch styles from theme config
    const baseStyles = themeConfig.input.base;
    const variantStyles = themeConfig.input.variants[variant] || {};
    const stateStyles = themeConfig.input.states[state] || {};
    const hoverEnabled = logicConfig.input.hoverEnabled;

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label
            style={{
              color: themeConfig.input.labelColor,
            }}
            className="block mb-2"
          >
            {label}
          </label>
        )}

        {/* Input Field */}
        <input
          ref={ref}
          style={{
            ...baseStyles,
            ...variantStyles,
            ...stateStyles,
          }}
          className={`w-full rounded-lg transition-colors duration-modal ${className}`}
          {...props}
        />

        {/* Error Message */}
        {error && (
          <p
            style={{
              color: themeConfig.input.errorColor,
            }}
            className="mt-1 text-sm"
          >
            {error}
          </p>
        )}

        {/* Hover Styles */}
        {hoverEnabled && (
          <style>{`
            input:hover {
              background-color: ${themeConfig.input.hoverBackground};
            }
          `}</style>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
