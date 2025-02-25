// File: src/components/sections/content/search-forms/ThreeScroll.tsx
import React, { useState, useCallback } from 'react';

// Interface for props, adding itemHeight and debounceTime
interface ThreeScrollProps {
  type: 'hours' | 'minutes';
  onScroll: (distance: number) => void;
  onSetCurrent: (value: number) => void;
  currentTime: Date;
  itemHeight: number; // Dynamic item height
  debounceTime: number; // Dynamic debounce time
}

const ThreeScroll: React.FC<ThreeScrollProps> = ({ 
  type, 
  onScroll, 
  onSetCurrent, 
  currentTime, 
  itemHeight, 
  debounceTime 
}) => {
  const [buttonPressTimer, setButtonPressTimer] = useState<number | null>(null);
  const [lastClickTime, setLastClickTime] = useState<number>(0);

  // Function for button click with dynamic debounceTime and itemHeight
  const handleButtonClick = useCallback((direction: 'up' | 'down') => {
    const now = Date.now();
    if (now - lastClickTime < debounceTime) return; // Using dynamic debounceTime
    setLastClickTime(now);

    const dir = direction === 'up' ? itemHeight : -itemHeight; // Using dynamic itemHeight
    onScroll(dir);
  }, [lastClickTime, onScroll, itemHeight, debounceTime]);

  // Function for holding the button with dynamic debounceTime as interval
  const handleButtonPress = useCallback((direction: 'up' | 'down') => {
    const dir = direction === 'up' ? itemHeight : -itemHeight; // Using dynamic itemHeight
    const timer = window.setInterval(() => {
      onScroll(dir);
    }, debounceTime); // Interval is dynamic debounceTime
    setButtonPressTimer(timer);
  }, [onScroll, itemHeight, debounceTime]);

  // Function for releasing the button
  const handleButtonRelease = useCallback(() => {
    if (buttonPressTimer !== null) {
      window.clearInterval(buttonPressTimer);
    }
    setButtonPressTimer(null);
  }, [buttonPressTimer]);

  // Calculation of displayed time
  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();
  const displayValue = type === 'hours'
    ? String(minutes > 0 ? (hours + 1) % 24 : hours).padStart(2, '0')
    : (minutes >= 35 ? '00' : '30');

  return (
    <div className="three-scroll">
      <button
        type="button"
        className="three-scroll-button"
        onClick={() => handleButtonClick('up')}
        onMouseDown={() => handleButtonPress('up')}
        onMouseUp={handleButtonRelease}
        onMouseLeave={handleButtonRelease}
      >
        <svg viewBox="0 0 24 24"><path d="M7 14l5-5 5 5z"/></svg>
      </button>
      <button
        type="button"
        className="three-scroll-button circle-button"
        onClick={() => onSetCurrent(type === 'hours' ? parseInt(displayValue) : displayValue === '00' ? 0 : 6)}
      >
        <div className="three-scroll-circle">{displayValue}</div>
      </button>
      <button
        type="button"
        className="three-scroll-button"
        onClick={() => handleButtonClick('down')}
        onMouseDown={() => handleButtonPress('down')}
        onMouseUp={handleButtonRelease}
        onMouseLeave={handleButtonRelease}
      >
        <svg viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>
      </button>
    </div>
  );
};

export default ThreeScroll;
