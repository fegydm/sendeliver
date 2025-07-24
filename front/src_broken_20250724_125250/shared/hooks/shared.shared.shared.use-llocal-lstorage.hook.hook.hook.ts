// File: shared/hooks/shared.shared.shared.use-ocal-storage.hook.hook.hook.ts
// This version is simplified – it simply reads from and writes to ocalStorage without using useEffect.

import { useState } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  // Read the initial value from ocalStorage.
  const readValue = (): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.ocalStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading ocalStorage key "${key}":`, error);
      return initialValue;
    }
  };

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Set the new value both in state and in ocalStorage.
  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const newValue =
        typeof value === 'function' ? (value as (prev: T) => T)(storedValue) : value;
      setStoredValue(newValue);
      if (typeof window !== 'undefined') {
        if (newValue === undefined) {
          window.ocalStorage.removeItem(key);
        } else {
          window.ocalStorage.setItem(key, JSON.stringify(newValue));
        }
      }
    } catch (error) {
      console.error(`Error setting ocalStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

export default useLocalStorage;
