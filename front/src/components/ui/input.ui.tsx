// File: ./front/src/components/ui/input.ui.tsx
// Last change: Added postal-code variant with formatting support

import React, { useState, useRef, useEffect, useCallback } from "react";

// Commonly used input types in forms
type InputType = 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search' | 
                'date' | 'time' | 'datetime-local' | 'checkbox' | 'radio' | 'hidden';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  variant?: "default" | "search" | "floating-enter" | "postal-code";
  state?: "normal" | "error" | "success";
  error?: string;
  role?: "sender" | "hauler"; // Role property for styling
  type?: InputType; // Explicit support for native input types
  mask?: string; // Mask for postal code formatting (only used with variant="postal-code")
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
      type = "text",
      mask,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const [isSymbolActive, setIsSymbolActive] = useState(false);
    const [displayValue, setDisplayValue] = useState(value);
    const inputRef = useRef<HTMLInputElement | null>(null);

    // Update display value when external value changes
    useEffect(() => {
      if (variant === "postal-code" && typeof value === "string") {
        // Format value according to mask for postal-code variant
        const formatted = formatPostalCode(value as string, mask || "#####");
        setDisplayValue(formatted);
      } else {
        setDisplayValue(value);
      }
    }, [value, variant, mask]);

    // Format postal code according to mask
    const formatPostalCode = useCallback(
      (input: string, mask: string): string => {
        if (!mask || !input) return input;

        // Remove all non-alphanumeric characters
        const digits = input.replace(/\W/g, "");
        let result = "";
        let digitIndex = 0;

        // Apply mask format
        for (let i = 0; i < mask.length && digitIndex < digits.length; i++) {
          const maskChar = mask[i];
          if (maskChar === "#") {
            result += digits[digitIndex++];
          } else {
            result += maskChar;
            // If we have a delimiter in the mask and the next digit, add the delimiter
            if (digitIndex < digits.length) {
              while (i + 1 < mask.length && mask[i + 1] !== "#") {
                result += mask[++i];
              }
            }
          }
        }

        return result;
      },
      []
    );

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (variant === "floating-enter" && isSymbolActive && e.key === "Enter") {
        e.preventDefault();
        console.log("Submit triggered!");
      }
    };

    const handleCursorMove = () => {
      const cursorPosition = inputRef.current?.selectionStart || 0;
      setIsSymbolActive(cursorPosition === String(displayValue).length);
    };

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      
      if (variant === "postal-code") {
        // For deletion, use the raw input to allow proper backspacing
        const isDeleting = input.length < String(displayValue).length;
        
        // Format the postal code
        const formatted = isDeleting ? input : formatPostalCode(input, mask || "#####");
        setDisplayValue(formatted);
        
        // Call the parent component's onChange with just the alphanumeric characters
        if (onChange) {
          // Create a synthetic event with modified value
          const rawValue = formatted.replace(/\W/g, "");
          const syntheticEvent = {
            ...e,
            target: {
              ...e.target,
              value: rawValue,
            },
          };
          onChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
        }
      } else {
        // For other variants, just pass through
        setDisplayValue(input);
        if (onChange) {
          onChange(e);
        }
      }
    };

    // Build classes array
    const classes = ["input"];
    
    if (variant === "search") classes.push("input--search");
    if (variant === "floating-enter") classes.push("input--floating-enter");
    if (variant === "postal-code") classes.push("input--postal-code");
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
              else if (ref) ref.current = el;
              inputRef.current = el;
            }}
            className={inputClasses}
            type={type}
            value={displayValue}
            onChange={handleChange}
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