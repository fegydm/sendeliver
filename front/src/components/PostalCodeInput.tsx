// File: src/components/PostalCodeInput.tsx
// Last change: Reimplemented postal code input with proper mask handling

import React, { useState, useCallback, forwardRef, useEffect } from "react";

export interface PostalCodeInputProps {
  initialValue?: string;
  dbMask?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
}

const PostalCodeInput = forwardRef<HTMLInputElement, PostalCodeInputProps>(({
  initialValue = "",
  dbMask = "",
  placeholder,
  onChange,
}, ref) => {
  // Store only numeric value internally
  const [numericValue, setNumericValue] = useState(() => 
    initialValue.replace(/\D/g, '')
  );

  // Format display value with mask
  const formatDisplayValue = useCallback((value: string): string => {
    if (!dbMask || !value) return value;

    const digits = value.replace(/\D/g, '');
    let maskIndex = 0;
    let digitIndex = 0;
    let result = '';

    while (maskIndex < dbMask.length && digitIndex < digits.length) {
      if (dbMask[maskIndex] === '#') {
        result += digits[digitIndex];
        digitIndex++;
      } else {
        result += dbMask[maskIndex];
      }
      maskIndex++;
    }

    return result;
  }, [dbMask]);

  // Handle input changes
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newInput = e.target.value;
    const newNumericValue = newInput.replace(/\D/g, '');
    const maxDigits = (dbMask.match(/#/g) || []).length;

    if (newNumericValue.length <= maxDigits) {
      setNumericValue(newNumericValue);
      
      if (onChange) {
        const formattedValue = formatDisplayValue(newNumericValue);
        onChange(formattedValue);
      }
    }
  }, [dbMask, onChange, formatDisplayValue]);

  // Format initial value on mount and when it changes
  useEffect(() => {
    const cleanInitialValue = initialValue.replace(/\D/g, '');
    if (cleanInitialValue !== numericValue) {
      setNumericValue(cleanInitialValue);
    }
  }, [initialValue]);

  // Get display value for input
  const displayValue = formatDisplayValue(numericValue);

  return (
    <input
      ref={ref}
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={displayValue}
      onChange={handleChange}
      placeholder={placeholder}
      className="postal-code-input"
      autoComplete="postal-code"
    />
  );
});

PostalCodeInput.displayName = 'PostalCodeInput';

export default PostalCodeInput;