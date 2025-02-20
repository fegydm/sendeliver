// File: src/components/sections/content/search-forms/TimePicker.tsx
// Last change: Added control buttons with acceleration and square backgrounds

import React, { useState, useRef, useCallback, useEffect } from 'react';
import './TimePicker.css';

interface TimePickerProps {
  value?: string;
  onChange: (time: string) => void;
}

const pad = (num: number) => num.toString().padStart(2, '0');

export const TimePicker: React.FC<TimePickerProps> = ({ value = '', onChange }) => {
  // Lists generation
  const generateInfiniteList = (baseList: string[]) => [...baseList, ...baseList, ...baseList];
  const hoursList = generateInfiniteList(Array.from({length: 24}, (_, i) => pad(i)));
  const minutesList = generateInfiniteList(Array.from({length: 12}, (_, i) => pad(i * 5)));

  // State management
  const [hours, setHours] = useState(value ? value.split(':')[0] || '00' : '00');
  const [minutes, setMinutes] = useState(value ? value.split(':')[1] || '00' : '00');
  const [scrollSpeed, setScrollSpeed] = useState(1);

  // Button press states
  const [buttonPressTimer, setButtonPressTimer] = useState<NodeJS.Timer | null>(null);
  const [pressedButton, setPressedButton] = useState<{
    type: 'hours' | 'minutes';
    direction: 'up' | 'down';
  } | null>(null);
  const [pressStartTime, setPressStartTime] = useState<number | null>(null);

  // Refs
  const hoursContainerRef = useRef<HTMLDivElement>(null);
  const minutesContainerRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<NodeJS.Timer | null>(null);
  
  // Scroll positions
  const [hoursScrollPosition, setHoursScrollPosition] = useState(0);
  const [minutesScrollPosition, setMinutesScrollPosition] = useState(0);

  // Mouse hover states
  const [isHoursHovered, setIsHoursHovered] = useState(false);
  const [isMinutesHovered, setIsMinutesHovered] = useState(false);
  const [mouseY, setMouseY] = useState(0);

  const performScroll = useCallback((
    list: string[],
    currentValue: string,
    scrollPosition: number,
    setScrollPosition: React.Dispatch<React.SetStateAction<number>>,
    setValue: React.Dispatch<React.SetStateAction<string>>,
    otherValue: string
  ) => {
    const itemHeight = 40;
    const newPosition = scrollPosition % (list.length * itemHeight / 3);
    const index = Math.floor(newPosition / itemHeight);
    const newValue = list[index];
    
    setValue(newValue);
    onChange(`${newValue}:${otherValue}`);
    setScrollPosition(newPosition);
  }, [onChange]);

  const handleScroll = useCallback((
    type: 'hours' | 'minutes',
    direction: number,
    speed: number = 1
  ) => {
    const itemHeight = 40;
    const delta = direction * speed * itemHeight / 10;

    if (type === 'hours') {
      setHoursScrollPosition(prev => {
        const newPosition = prev + delta;
        performScroll(hoursList, hours, newPosition, setHoursScrollPosition, setHours, minutes);
        return newPosition;
      });
    } else {
      setMinutesScrollPosition(prev => {
        const newPosition = prev + delta;
        performScroll(minutesList, minutes, newPosition, setMinutesScrollPosition, setMinutes, hours);
        return newPosition;
      });
    }
  }, [hoursList, minutesList, hours, minutes, performScroll]);

  // Button press handlers
  const handleButtonPress = useCallback((
    type: 'hours' | 'minutes',
    direction: 'up' | 'down'
  ) => {
    setPressedButton({ type, direction });
    setPressStartTime(Date.now());
    
    const dir = direction === 'up' ? -1 : 1;
    handleScroll(type, dir);

    const timer = setInterval(() => {
      const pressDuration = Date.now() - (pressStartTime || Date.now());
      const acceleration = Math.min(pressDuration / 500, 5); // Max 5x speed
      handleScroll(type, dir, acceleration);
    }, 50);

    setButtonPressTimer(timer);
  }, [handleScroll, pressStartTime]);

  const handleButtonRelease = useCallback(() => {
    if (buttonPressTimer) {
      clearInterval(buttonPressTimer);
    }
    setPressedButton(null);
    setPressStartTime(null);
    setButtonPressTimer(null);
  }, [buttonPressTimer]);

  // Current time handlers
  const setCurrentTime = useCallback((type: 'hours' | 'minutes') => {
    const now = new Date();
    if (type === 'hours') {
      const currentHours = pad(now.getHours());
      setHours(currentHours);
      onChange(`${currentHours}:${minutes}`);
    } else {
      const currentMinutes = pad(Math.floor(now.getMinutes() / 5) * 5);
      setMinutes(currentMinutes);
      onChange(`${hours}:${currentMinutes}`);
    }
  }, [hours, minutes, onChange]);

  // Mouse movement handler
  const lastMousePos = useRef({ x: 0, y: 0 });
  const isMoving = useRef(false);
  const mouseCheckInterval = useRef<NodeJS.Timer | null>(null);

  const handleMouseMove = useCallback((
    e: React.MouseEvent<HTMLDivElement>,
    type: 'hours' | 'minutes'
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerY = rect.top + rect.height / 2;
    const distanceFromCenter = e.clientY - centerY;
    
    // Detekcia pohybu myši
    const currentMousePos = { x: e.clientX, y: e.clientY };
    isMoving.current = true;
    
    if (lastMousePos.current.x !== currentMousePos.x || 
        lastMousePos.current.y !== currentMousePos.y) {
      lastMousePos.current = currentMousePos;
      
      // Výpočet rýchlosti s pomalším zrýchľovaním
      const normalizedDistance = Math.abs(distanceFromCenter) / (rect.height / 2);
      const speed = Math.min(normalizedDistance * 0.8, 1.5); // Znížená maximálna rýchlosť
      const direction = distanceFromCenter > 0 ? 1 : -1;
      
      setMouseY(e.clientY);
      setScrollSpeed(speed);

      if (type === 'hours') {
        handleScroll('hours', direction, speed);
      } else {
        handleScroll('minutes', direction, speed);
      }
    }

    // Kontrola zastavenia pohybu
    if (mouseCheckInterval.current) {
      clearInterval(mouseCheckInterval.current);
    }
    
    mouseCheckInterval.current = setInterval(() => {
      if (isMoving.current) {
        isMoving.current = false;
      } else {
        // Ak sa myš nehýbe, zastavíme scrollovanie
        setScrollSpeed(0);
      }
    }, 100); // Kontrola každých 100ms
  }, [handleScroll]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (buttonPressTimer) clearInterval(buttonPressTimer);
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    };
  }, [buttonPressTimer]);

  const renderControls = (type: 'hours' | 'minutes') => (
    <div className="time-picker-controls">
      <button
        type="button"
        className="time-picker-control-button"
        onMouseDown={() => handleButtonPress(type, 'up')}
        onMouseUp={handleButtonRelease}
        onMouseLeave={handleButtonRelease}
      >
        <svg viewBox="0 0 24 24">
          <path d="M7 14l5-5 5 5z"/>
        </svg>
      </button>
      
      <button
        type="button"
        className="time-picker-control-button"
        onClick={() => setCurrentTime(type)}
      >
        <div className="time-picker-control-circle"></div>
      </button>
      
      <button
        type="button"
        className="time-picker-control-button"
        onMouseDown={() => handleButtonPress(type, 'down')}
        onMouseUp={handleButtonRelease}
        onMouseLeave={handleButtonRelease}
      >
        <svg viewBox="0 0 24 24">
          <path d="M7 10l5 5 5-5z"/>
        </svg>
      </button>
    </div>
  );

  return (
    <div className="time-picker">
      <div className="time-picker-columns">
        <div className="time-picker-column hours">
          {renderControls('hours')}
          <div 
            ref={hoursContainerRef}
            className="time-picker-scroll-container"
            onMouseEnter={() => setIsHoursHovered(true)}
            onMouseLeave={() => setIsHoursHovered(false)}
            onMouseMove={(e) => handleMouseMove(e, 'hours')}
          >
            <div 
              className="time-picker-scroll-content"
              style={{ transform: `translateY(${-hoursScrollPosition}px)` }}
            >
              {hoursList.map((hour, index) => (
                <div key={`hour-${index}`} className="time-picker-scroll-item">
                  {hour}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="time-picker-column minutes">
          {renderControls('minutes')}
          <div 
            ref={minutesContainerRef}
            className="time-picker-scroll-container"
            onMouseEnter={() => setIsMinutesHovered(true)}
            onMouseLeave={() => setIsMinutesHovered(false)}
            onMouseMove={(e) => handleMouseMove(e, 'minutes')}
          >
            <div 
              className="time-picker-scroll-content"
              style={{ transform: `translateY(${-minutesScrollPosition}px)` }}
            >
              {minutesList.map((minute, index) => (
                <div key={`minute-${index}`} className="time-picker-scroll-item">
                  {minute}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimePicker;