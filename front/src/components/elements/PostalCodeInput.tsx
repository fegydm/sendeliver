// File: src/components/elements/PostalCodeInput.tsx
import React, { useState, useCallback, forwardRef, useRef, useEffect } from "react";

export interface PostalCodeInputProps {
  value?: string;
  initialValue?: string;
  mask?: string; // e.g., "§§§ §§§" for GB
  placeholder?: string;
  onChange?: (value: string) => void;
  className?: string;
  onFocus?: () => void;
}

// Formats raw input according to the mask
const formatValueForDisplay = (raw: string, mask?: string): string => {
  if (!mask) return raw;
  let formatted = "";
  let charIndex = 0;
  for (let i = 0; i < mask.length; i++) {
    if (mask[i] === "#" || mask[i] === "@" || mask[i] === "§") {
      if (charIndex < raw.length) {
        formatted += raw[charIndex++];
      } else {
        break;
      }
    } else {
      formatted += mask[i];
    }
  }
  return formatted;
};

// Maps raw index to display index based on mask
const getDisplayIndex = (rawIndex: number, mask: string): number => {
  let charCount = 0;
  for (let i = 0; i < mask.length; i++) {
    if (mask[i] === "#" || mask[i] === "@" || mask[i] === "§") {
      if (charCount === rawIndex) {
        return i;
      }
      charCount++;
    }
  }
  return mask.length;
};

// Maps display index to raw index
const getRawIndex = (displayIndex: number, mask: string): number => {
  let charCount = 0;
  for (let i = 0; i < mask.length && i < displayIndex; i++) {
    if (mask[i] === "#" || mask[i] === "@" || mask[i] === "§") {
      charCount++;
    }
  }
  return charCount;
};

// Validates character based on mask position
const isValidChar = (char: string, maskChar: string): boolean => {
  if (maskChar === "#") return /\d/.test(char);
  if (maskChar === "@") return /[A-Za-z]/.test(char);
  if (maskChar === "§") return /[A-Za-z0-9]/.test(char);
  return false;
};

const PostalCodeInput = forwardRef<HTMLInputElement, PostalCodeInputProps>(({
  value,
  initialValue = "",
  mask,
  placeholder,
  onChange,
  onFocus,
  className,
}, ref) => {
  const maxChars = mask ? (mask.match(/[#@§]/g) || []).length : Infinity;
  
  const [internalRawValue, setInternalRawValue] = useState(
    initialValue.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, maxChars)
  );
  
  const rawValue = value !== undefined
    ? value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, maxChars)
    : internalRawValue;
  
  useEffect(() => {
    if (value === undefined) {
      setInternalRawValue(initialValue.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, maxChars));
    }
  }, [initialValue, maxChars, value]);

  const localRef = useRef<HTMLInputElement>(null);
  const inputRef = (ref as React.MutableRefObject<HTMLInputElement>) || localRef;

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!mask || !inputRef.current) return;

    const caretPos = inputRef.current.selectionStart || 0;
    const currentValue = rawValue;
    const displayValue = formatValueForDisplay(currentValue, mask);

    // Block space and hyphen
    if (e.key === " " || e.key === "-") {
      e.preventDefault();
      return;
    }

    // Handle Backspace with visual separator
    if (e.key === "Backspace" && caretPos > 0) {
      const rawIndex = getRawIndex(caretPos, mask);
      if (rawIndex > 0) {
        const newRawValue = currentValue.slice(0, rawIndex - 1) + currentValue.slice(rawIndex);
        if (value === undefined) {
          setInternalRawValue(newRawValue);
        }
        if (onChange) {
          onChange(newRawValue);
        }
        const newCaretPos = getDisplayIndex(rawIndex - 1, mask);
        setTimeout(() => {
          inputRef.current?.setSelectionRange(newCaretPos, newCaretPos);
        }, 0);
        e.preventDefault();
      }
    }

    // Adjust cursor movement to skip separators
    if (e.key === "ArrowLeft" && caretPos > 0) {
      let newPos = caretPos - 1;
      while (newPos > 0 && mask[newPos] !== "#" && mask[newPos] !== "@" && mask[newPos] !== "§") {
        newPos--;
      }
      e.preventDefault();
      inputRef.current.setSelectionRange(newPos, newPos);
    }
    if (e.key === "ArrowRight" && caretPos < displayValue.length) {
      let newPos = caretPos + 1;
      while (newPos < mask.length && mask[newPos] !== "#" && mask[newPos] !== "@" && mask[newPos] !== "§") {
        newPos++;
      }
      e.preventDefault();
      inputRef.current.setSelectionRange(newPos, newPos);
    }
  }, [mask, maxChars, onChange, inputRef, rawValue, value]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputEl = e.target;
    let newRawValue = "";
    
    // Convert to uppercase and validate against mask
    if (mask) {
      const rawInput = inputEl.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
      let charIndex = 0;
      for (let i = 0; i < mask.length && charIndex < rawInput.length; i++) {
        if (mask[i] === "#" || mask[i] === "@" || mask[i] === "§") {
          if (isValidChar(rawInput[charIndex], mask[i])) {
            newRawValue += rawInput[charIndex];
          }
          charIndex++;
        }
      }
    } else {
      newRawValue = inputEl.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    }

    newRawValue = newRawValue.slice(0, maxChars);
    if (value === undefined) {
      setInternalRawValue(newRawValue);
    }
    if (onChange) {
      onChange(newRawValue);
    }
    
    if (mask && inputRef.current) {
      const caretPos = inputEl.selectionStart || 0;
      const rawBeforeCaret = inputEl.value.slice(0, caretPos).replace(/[^A-Za-z0-9]/g, '').length;
      const newCaretPos = getDisplayIndex(rawBeforeCaret, mask);
      setTimeout(() => {
        inputRef.current?.setSelectionRange(newCaretPos, newCaretPos);
      }, 0);
    }
  }, [maxChars, mask, onChange, inputRef, value]);

  const displayValue = mask ? formatValueForDisplay(rawValue, mask) : rawValue;

  return (
    <input
      ref={inputRef}
      type="text"
      value={displayValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onFocus={onFocus}
      placeholder={placeholder}
      className={className || "inp-psc"}
    />
  );
});

PostalCodeInput.displayName = 'PostalCodeInput';

export default PostalCodeInput;