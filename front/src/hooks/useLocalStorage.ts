// File: ./front/src/hooks/useLocalStorage.ts
// This version is simplified – it simply reads from and writes to localStorage without using useEffect.

import { useState } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  // Read the initial value from localStorage.
  const readValue = (): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Set the new value both in state and in localStorage.
  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const newValue =
        typeof value === 'function' ? (value as (prev: T) => T)(storedValue) : value;
      setStoredValue(newValue);
      if (typeof window !== 'undefined') {
        if (newValue === undefined) {
          window.localStorage.removeItem(key);
        } else {
          window.localStorage.setItem(key, JSON.stringify(newValue));
        }
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

export default useLocalStorage;
