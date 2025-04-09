// File: .front/src/components/ui/input.ui.tsx
// Last change: Added role and extended type support

import React, { useState, useRef } from "react";

// Commonly used input types in forms
type InputType = 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search' | 
                'date' | 'time' | 'datetime-local' | 'checkbox' | 'radio' | 'hidden';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  variant?: "default" | "search" | "floating-enter";
  state?: "normal" | "error" | "success";
  error?: string;
  role?: "sender" | "hauler"; // Role property for styling
  type?: InputType; // Explicit support for native input types
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      variant = "default",
      state = "normal",
      error,
      className,
      role,
      type = "text", // Default value
      ...props
    },
    ref
  ) => {
    const [isSymbolActive, setIsSymbolActive] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {

      if (variant === "floating-enter" && isSymbolActive && e.key === "Enter") {
        e.preventDefault();
        console.log("Submit triggered!");
      }
    };

    const handleCursorMove = () => {
      const cursorPosition = inputRef.current?.selectionStart || 0;
      setIsSymbolActive(cursorPosition === props.value?.toString().length);
    };

    // Build classes array
    const classes = ["input"];
    
    if (variant === "search") classes.push("input--search");
    if (variant === "floating-enter") classes.push("input--floating-enter");
    if (state === "error") classes.push("input--error");
    if (state === "success") classes.push("input--success");
    if (role) classes.push(`input--${role}`); // Add role-based class
    if (className) classes.push(className);

    const inputClasses = classes.join(" ");

    return (
      <div className="input-container">
        {label && <label className="input-label">{label}</label>}
        <div className="input-wrapper">
          <input
            ref={(el) => {
              if (typeof ref === "function") ref(el);
              inputRef.current = el;
            }}
            className={inputClasses}
            type={type}
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