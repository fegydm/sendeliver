// File: src/components/sections/content/search-forms/ThreeScroll.tsx
import React, { useState, useCallback } from 'react';
import './ThreeScroll.css';

// Rozhranie pre props, pridávame itemHeight a debounceTime
interface ThreeScrollProps {
  type: 'hours' | 'minutes';
  onScroll: (distance: number) => void;
  onSetCurrent: (value: number) => void;
  currentTime: Date;
  itemHeight: number; // Dynamická výška položky
  debounceTime: number; // Dynamický čas oneskorenia
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

  // Funkcia pre kliknutie s dynamickým debounceTime a itemHeight
  const handleButtonClick = useCallback((direction: 'up' | 'down') => {
    const now = Date.now();
    if (now - lastClickTime < debounceTime) return; // Používame dynamický debounceTime
    setLastClickTime(now);

    const dir = direction === 'up' ? itemHeight : -itemHeight; // Používame dynamický itemHeight
    onScroll(dir);
  }, [lastClickTime, onScroll, itemHeight, debounceTime]);

  // Funkcia pre podržanie tlačidla s dynamickým debounceTime ako interval
  const handleButtonPress = useCallback((direction: 'up' | 'down') => {
    const dir = direction === 'up' ? itemHeight : -itemHeight; // Používame dynamický itemHeight
    const timer = window.setInterval(() => {
      onScroll(dir);
    }, debounceTime); // Interval je dynamický debounceTime
    setButtonPressTimer(timer);
  }, [onScroll, itemHeight, debounceTime]);

  // Funkcia pre uvoľnenie tlačidla
  const handleButtonRelease = useCallback(() => {
    if (buttonPressTimer !== null) {
      window.clearInterval(buttonPressTimer);
    }
    setButtonPressTimer(null);
  }, [buttonPressTimer]);

  // Výpočet zobrazeného času
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