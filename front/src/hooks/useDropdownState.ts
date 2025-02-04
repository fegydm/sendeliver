// File: src/hooks/useDropdownState.ts
// Last change: Added openOnFocus option and English comments

import { useState, useRef, useEffect } from 'react';

interface UseDropdownStateOptions {
  initialState?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  closeOnSelect?: boolean;
  preventCloseKeys?: string[];
  openOnFocus?: boolean;
}

const useDropdownState = ({
  initialState = false,
  onOpen,
  onClose,
  closeOnSelect = true,
  preventCloseKeys = [],
  openOnFocus = false
}: UseDropdownStateOptions = {}) => {
  const [isOpen, setIsOpen] = useState(initialState);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  const open = () => {
    setIsOpen(true);
    onOpen?.();
  };

  const close = () => {
    setIsOpen(false);
    onClose?.();
  };

  const toggle = () => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  };

  // Wrap the selection callback
  const handleSelectItem = (callback: () => void, forceClose = false) => {
    callback();
    if (closeOnSelect || forceClose) {
      close();
    }
  };

  // Handle keyboard events for dropdown
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (preventCloseKeys.includes(event.key)) {
      return;
    }

    if (event.key === 'Escape') {
      close();
    }
  };

  const handleFocus = () => {
    if (openOnFocus) {
      open();
    }
  };

  return {
    isOpen,
    dropdownRef,
    open,
    close,
    toggle,
    handleSelectItem,
    handleKeyDown,
    handleFocus
  };
};

export default useDropdownState;