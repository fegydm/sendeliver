// File: shared/hooks/shared.shared.shared.use-lpassword-lvalidation.hook.hook.hook.ts
// Last change: Cleaned up and verified for new auth system

import { useState, useEffect } from 'react';

interface PasswordValidationOptions {
  minLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireDigit?: boolean;
  requireSpecialChar?: boolean;
}

const defaultOptions: PasswordValidationOptions = {
  minLength: 8,
  requireUppercase: false,
  requireLowercase: false,
  requireDigit: false,
  requireSpecialChar: false,
};

const usePasswordValidation = (
  password: string,
  confirmPassword: string,
  options?: PasswordValidationOptions
) => {
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  
  const mergedOptions = { ...defaultOptions, ...options };

  useEffect(() => {
    setPasswordError(null);
    setConfirmPasswordError(null);

    if (confirmPassword && password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
    }

    if (password) {
      if (password.length < (mergedOptions.minLength || 0)) {
        setPasswordError(`Password must be at least ${mergedOptions.minLength} characters long.`);
        return;
      }

      if (mergedOptions.requireUppercase && !/[A-Z]/.test(password)) {
        setPasswordError("Password must contain at least one uppercase letter.");
        return;
      }

      if (mergedOptions.requireLowercase && !/[a-z]/.test(password)) {
        setPasswordError("Password must contain at least one lowercase letter.");
        return;
      }

      if (mergedOptions.requireDigit && !/\d/.test(password)) {
        setPasswordError("Password must contain at least one number.");
        return;
      }

      if (mergedOptions.requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        setPasswordError("Password must contain at least one special character.");
        return;
      }
    }
  }, [password, confirmPassword, mergedOptions]);

  const isValid = !passwordError && !confirmPasswordError && password.length >= (mergedOptions.minLength || 0);

  return { passwordError, confirmPasswordError, isValid };
};

export default usePasswordValidation;