// ./components/ui/input/input.ui.tsx
import React, { useState, useRef } from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  variant?: "default" | "search" | "floating-enter";
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
    const [isSymbolActive, setIsSymbolActive] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      const cursorPosition =
        inputRef.current?.selectionStart || 0;

      // If symbol is active
      if (variant === "floating-enter" && isSymbolActive && e.key === "Enter") {
        e.preventDefault();
        console.log("Submit triggered!");
      }
    };

    const handleCursorMove = () => {
      const cursorPosition =
        inputRef.current?.selectionStart || 0;

      // Activating enter symbol
      setIsSymbolActive(cursorPosition === props.value?.toString().length);
    };

    return (
      <div className="w-full input-container">
        {/* Label */}
        {label && <label className="input-label">{label}</label>}

        {/* Input Field */}
        <div className="relative">
          <input
            ref={(el) => {
              if (typeof ref === "function") ref(el);
              inputRef.current = el;
            }}
            className={`input ${
              variant === "search" ? "input--search" : ""
            } ${variant === "floating-enter" ? "input--floating-enter" : ""} ${
              state === "error" ? "input--error" : ""
            } ${state === "success" ? "input--success" : ""} ${className}`}
            onKeyDown={handleKeyDown}
            onClick={handleCursorMove}
            onKeyUp={handleCursorMove}
            {...props}
          />

          {/* Enter Symbol */}
          {variant === "floating-enter" && (
            <span
              className={`absolute right-4 top-1/2 transform -translate-y-1/2 ${
                isSymbolActive ? "text-black font-bold" : "text-gray-400"
              }`}
            >
              ↵
            </span>
          )}
        </div>

        {/* Error Message */}
        {error && <p className="input-error-message">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
