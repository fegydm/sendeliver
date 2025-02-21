// File: src/components/sections/content/search-forms/ThreeScroll.tsx
// Last change: Created ThreeScroll component with exponential acceleration; protective zone of 10px is handled in mouse-based scrolling (not here)
import React, { useState, useCallback } from 'react';
import './ThreeScroll.css';
interface ThreeScrollProps { type: 'hours' | 'minutes'; onScroll: (direction: number, speed: number) => void; onSetCurrent: () => void; }
const ThreeScroll: React.FC<ThreeScrollProps> = ({ type, onScroll, onSetCurrent }) => { 
  // State for button press start time and timer (using number for timer id)
  const [pressStartTime, setPressStartTime] = useState<number | null>(null); 
  const [buttonPressTimer, setButtonPressTimer] = useState<number | null>(null); 
  // Handle button press: start timer, calculate exponential acceleration
  const handleButtonPress = useCallback((direction: 'up' | 'down') => { 
    setPressStartTime(Date.now()); 
    const dir = direction === 'up' ? -1 : 1; 
    onScroll(dir, 1); // initial speed 1 
    const timer = window.setInterval(() => { 
      const elapsed = Date.now() - (pressStartTime || Date.now()); 
      // Exponential acceleration: speed = 1 * 2^(elapsed/500), clamped to 10
      const speed = Math.min(Math.pow(2, elapsed / 500), 10); 
      onScroll(dir, speed); 
    }, 50); 
    setButtonPressTimer(timer); 
  }, [pressStartTime, onScroll]); 
  // Handle button release: clear timer
  const handleButtonRelease = useCallback(() => { 
    if (buttonPressTimer !== null) { window.clearInterval(buttonPressTimer); } 
    setPressStartTime(null); 
    setButtonPressTimer(null); 
  }, [buttonPressTimer]); 
  return ( 
    <div className="three-scroll"> 
      <button type="button" className="three-scroll-button" onMouseDown={() => handleButtonPress('up')} onMouseUp={handleButtonRelease} onMouseLeave={handleButtonRelease}> 
        <svg viewBox="0 0 24 24"><path d="M7 14l5-5 5 5z"/></svg> 
      </button> 
      <button type="button" className="three-scroll-button" onClick={onSetCurrent}> 
        <div className="three-scroll-circle"></div> 
      </button> 
      <button type="button" className="three-scroll-button" onMouseDown={() => handleButtonPress('down')} onMouseUp={handleButtonRelease} onMouseLeave={handleButtonRelease}> 
        <svg viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg> 
      </button> 
    </div> 
  ); 
}; 
export default ThreeScroll;
