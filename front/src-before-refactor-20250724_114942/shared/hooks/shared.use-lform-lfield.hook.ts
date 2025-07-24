// File: src/shared/hooks/shared.use-lform-lfield.hook.ts
// Last change: Added silent setValue support and updated return type to match FieldValue interface

import { useState, useCallback, useRef } from 'react';

interface UseFormFieldConfig<T> {
  initialValue: T;
  validate?: (value: T) => Promise<boolean> | boolean;
  transform?: (value: T) => T;
  onChange?: (value: T) => void;
}

export function useFormField<T>({
  initialValue,
  validate,
  transform,
  onChange
}: UseFormFieldConfig<T>) {
  const [value, setValueInternal] = useState<T>(initialValue);
  const [isValid, setIsValid] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const lastValidValue = useRef<T>(initialValue);

  // Silent
  const setValue = useCallback((newValue: T) => {
    const transformedValue = transform ? transform(newValue) : newValue;
    setValueInternal(transformedValue);
    setIsDirty(true);
  }, [transform]);

  // Validated
  const handleChange = useCallback(async (newValue: T) => {
    const transformedValue = transform ? transform(newValue) : newValue;
    setValueInternal(transformedValue);
    setIsDirty(true);
    setIsValidating(true);

    try {
      if (validate) {
        const validationResult = await validate(transformedValue);
        setIsValid(validationResult);
        setError(validationResult ? null : 'Validation failed');
        if (validationResult) {
          lastValidValue.current = transformedValue;
        }
      } else {
        setIsValid(true);
        setError(null);
        lastValidValue.current = transformedValue;
      }
    } catch (err) {
      setIsValid(false);
      setError(err instanceof Error ? err.message : 'Validation failed');
    } finally {
      setIsValidating(false);
    }

    onChange?.(transformedValue);
  }, [onChange, transform, validate]);

  const handleBlur = useCallback(() => {
    // Additional blur logic if needed
  }, []);

  const reset = useCallback(() => {
    setValueInternal(initialValue);
    setIsValid(false);
    setIsDirty(false);
    setError(null);
    setIsValidating(false);
    lastValidValue.current = initialValue;
  }, [initialValue]);

  return {
    value,
    isValid,
    isDirty,
    error,
    isValidating,
    lastValidValue: lastValidValue.current,
    setValue,           // Silent change
    handleChange,       // Validated change
    handleBlur,
    reset
  };
}