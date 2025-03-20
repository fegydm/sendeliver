// ./components/ui/input.ui.tsx
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
      const cursorPosition = inputRef.current?.selectionStart || 0;

      if (variant === "floating-enter" && isSymbolActive && e.key === "Enter") {
        e.preventDefault();
        console.log("Submit triggered!");
      }
    };

    const handleCursorMove = () => {
      const cursorPosition = inputRef.current?.selectionStart || 0;
      setIsSymbolActive(cursorPosition === props.value?.toString().length);
    };

    return (
      <div className="input-container">
        {label && <label className="input-label">{label}</label>}
        <div className="input-wrapper">
          <input
            ref={(el) => {
              if (typeof ref === "function") ref(el);
              inputRef.current = el;
            }}
            className={`input 
              ${variant === "search" ? "input--search" : ""} 
              ${variant === "floating-enter" ? "input--floating-enter" : ""} 
              ${state === "error" ? "input--error" : ""} 
              ${state === "success" ? "input--success" : ""} 
              ${className}`}
            onKeyDown={handleKeyDown}
            onClick={handleCursorMove}
            onKeyUp={handleCursorMove}
            {...props}
          />
          {variant === "floating-enter" && (
            <span
              className={`input-enter-symbol ${
                isSymbolActive ? "input-enter-symbol--active" : ""
              }`}
            >
              ↵
            </span>
          )}
        </div>
        {error && <p className="input-error-message">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;