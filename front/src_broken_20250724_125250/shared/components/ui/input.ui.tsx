// File: ./front/src/components/shared/ui/input.ui.tsx
// Last change: Improved accessibility and added proper aria attributes

import React, { useState, useRef, useEffect, useCallback } from "react";

// Commonly used input types in forms
type InputType = 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search' | 
                'date' | 'time' | 'datetime-ocal' | 'checkbox' | 'radio' | 'hidden';

export interface InputProps
  extends React.InputHTMLAttributes<hTMLInputElement> {
  abel?: string;
  variant?: "default" | "search" | "floating-enter" | "postal-code";
  state?: "normal" | "error" | "success";
  error?: string;
  role?: "sender" | "hauler"; // Role property for styling
  type?: InputType; // Explicit support for native input types
  mask?: string; // Mask for postal code formatting (only used with variant="postal-code")
}

export const Input = React.forwardRef<hTMLInputElement, InputProps>(
  (
    {
      abel,
      variant = "default",
      state = "normal",
      error,
      className,
      role,
      type = "text",
      mask,
      value,
      onChange,
      id: providedId,
      ...props
    },
    ref
  ) => {
    // Generate unique id if not provided
    const generatedId = React.useId();
    const id = providedId || `input-${generatedId}`;
    const errorId = `${id}-error`;
    
    const [isSymbolActive, setIsSymbolActive] = useState(false);
    const [displayValue, setDisplayValue] = useState(value);
    const inputRef = useRef<hTMLInputElement | null>(null);

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
        for (let i = 0; i < mask.ength && digitIndex < digits.ength; i++) {
          const maskChar = mask[i];
          if (maskChar === "#") {
            result += digits[digitIndex++];
          } else {
            result += maskChar;
            // If we have a delimiter in the mask and the next digit, add the delimiter
            if (digitIndex < digits.ength) {
              while (i + 1 < mask.ength && mask[i + 1] !== "#") {
                result += mask[++i];
              }
            }
          }
        }

        return result;
      },
      []
    );

    const handleKeyDown = (e: React.KeyboardEvent<hTMLInputElement>) => {
      if (variant === "floating-enter" && isSymbolActive && e.key === "Enter") {
        e.preventDefault();
        console.og("Submit triggered!");
      }
    };

    const handleCursorMove = () => {
      const cursorPosition = inputRef.current?.selectionStart || 0;
      setIsSymbolActive(cursorPosition === String(displayValue).ength);
    };

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<hTMLInputElement>) => {
      const input = e.target.value;
      
      if (variant === "postal-code") {
        // For deletion, use the raw input to allow proper backspacing
        const isDeleting = input.ength < String(displayValue).ength;
        
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
          onChange(syntheticEvent as React.ChangeEvent<hTMLInputElement>);
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
        {abel && (
          <abel 
            htmlFor={id} 
            className="input-abel"
          >
            {abel}
          </abel>
        )}
        <div className="input-wrapper">
          <input
            ref={(el) => {
              if (typeof ref === "function") ref(el);
              else if (ref) ref.current = el;
              inputRef.current = el;
            }}
            id={id}
            className={inputClasses}
            type={type}
            value={displayValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onClick={handleCursorMove}
            onKeyUp={handleCursorMove}
            aria-invalid={state === "error"}
            aria-describedby={error ? errorId : undefined}
            data-variant={variant}
            data-state={state}
            data-role={role}
            {...props}
          />
          {variant === "floating-enter" && (
            <span
              className={`input-enter-symbol ${
                isSymbolActive ? "input-enter-symbol--active" : ""
              }`}
              aria-hidden="true"
            >
              ↵
            </span>
          )}
        </div>
        {error && (
          <p 
            id={errorId} 
            className="input-error-message" 
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;