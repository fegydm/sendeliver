import React, { useState, useCallback, forwardRef, useRef, useEffect } from "react";

export interface PostalCodeInputProps {
  value?: string;
  initialValue?: string;
  dbMask?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  className?: string;
  onFocus?: () => void;  // onFocus handler
}

// Formats the raw value according to the given mask.
// For each character in the mask: if it is '#' and digits are available, insert a digit,
// otherwise insert the formatting character (e.g. a space).
const formatValueForDisplay = (raw: string, mask?: string): string => {
  if (!mask) return raw;
  let formatted = "";
  let digitIndex = 0;
  for (let i = 0; i < mask.length; i++) {
    if (mask[i] === "#") {
      if (digitIndex < raw.length) {
        formatted += raw[digitIndex++];
      } else {
        break;
      }
    } else {
      formatted += mask[i];
    }
  }
  return formatted;
};

// For a given rawIndex (number of digits) in the mask, returns the corresponding position in the display string.
const getDisplayIndex = (rawIndex: number, mask: string): number => {
  let digitCount = 0;
  for (let i = 0; i < mask.length; i++) {
    if (mask[i] === "#") {
      if (digitCount === rawIndex) {
        return i;
      }
      digitCount++;
    }
  }
  return mask.length;
};

const PostalCodeInput = forwardRef<HTMLInputElement, PostalCodeInputProps>(({
  value,
  initialValue = "",
  dbMask,
  placeholder,
  onChange,
  onFocus,
  className
}, ref) => {
  // The maximum number of digits is determined by the number of '#' in the mask.
  const maxDigits = dbMask ? (dbMask.match(/#/g) || []).length : Infinity;
  
  // If controlled value is provided, use it, otherwise use internal state.
  const [internalRawValue, setInternalRawValue] = useState(
    initialValue.replace(/\D/g, '').slice(0, maxDigits)
  );
  
  const rawValue = value !== undefined
    ? value.replace(/\D/g, '').slice(0, maxDigits)
    : internalRawValue;
  
  // Update internal state when initialValue changes (only if uncontrolled).
  useEffect(() => {
    if (value === undefined) {
      setInternalRawValue(initialValue.replace(/\D/g, '').slice(0, maxDigits));
    }
  }, [initialValue, maxDigits, value]);

  // If no ref is provided, create a local reference.
  const localRef = useRef<HTMLInputElement>(null);
  const inputRef = (ref as React.MutableRefObject<HTMLInputElement>) || localRef;
  
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputEl = e.target;
    // Remove everything except digits from the current value.
    const newRawValue = inputEl.value.replace(/\D/g, '').slice(0, maxDigits);
    if (value === undefined) {
      setInternalRawValue(newRawValue);
    }
    if (onChange) {
      onChange(newRawValue);
    }
    
    if (dbMask && inputRef.current) {
      // Get the current cursor position in the displayed value.
      const caretPos = inputEl.selectionStart || 0;
      // Count how many digits are before the cursor.
      const rawBeforeCaret = inputEl.value.slice(0, caretPos).replace(/\D/g, '').length;
      // Calculate the new cursor position using the mapping from rawIndex -> display index.
      const newCaretPos = getDisplayIndex(rawBeforeCaret, dbMask);
      
      // Set the cursor position asynchronously after the next render.
      setTimeout(() => {
        inputRef.current?.setSelectionRange(newCaretPos, newCaretPos);
      }, 0);
    }
    
  }, [maxDigits, dbMask, onChange, inputRef, value]);
  
  const displayValue = dbMask ? formatValueForDisplay(rawValue, dbMask) : rawValue;
  
  return (
    <input
      ref={inputRef}
      type="text"
      value={displayValue}
      onChange={handleChange}
      onFocus={onFocus}  // onFocus handler
      placeholder={placeholder}
      className={className || "inp-psc"}
    />
  );
});

PostalCodeInput.displayName = 'PostalCodeInput';

export default PostalCodeInput;
