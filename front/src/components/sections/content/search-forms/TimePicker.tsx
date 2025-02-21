// File: src/components/sections/content/search-forms/TimePicker.tsx
// Last change: Fully implemented time picker with prop usage and scroll mechanics

import React, { useState, useCallback, useEffect, useMemo } from 'react';

interface TimePickerProps {
  value?: string;
  onChange: (time: string) => void;
}

const SCROLL_PARAMS = {
  START_SPEED: 8,
  MAX_SPEED: 8,
  INTERVAL: 50,
  PROTECTIVE_ZONE: 5
};

const ITEM_HEIGHT = 40;

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const MINUTES = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));

const EXTENDED_HOURS = [...HOURS, ...HOURS, ...HOURS];
const EXTENDED_MINUTES = [...MINUTES, ...MINUTES, ...MINUTES];

export const TimePicker: React.FC<TimePickerProps> = ({ 
  value = '12:00', 
  onChange 
}) => {
  // Parse initial time from value prop
  const initialTime = useMemo(() => {
    const [initialHour, initialMinute] = value.split(':').map(Number);
    return {
      hour: isNaN(initialHour) ? 12 : Math.min(Math.max(initialHour, 0), 23),
      minute: isNaN(initialMinute) ? 0 : Math.min(Math.max(initialMinute, 0), 55)
    };
  }, [value]);

  // Initialize scroll positions based on initial time
  const [scrollPosition, setScrollPosition] = useState({
    hours: (initialTime.hour + HOURS.length) * ITEM_HEIGHT,
    minutes: (Math.floor(initialTime.minute / 5) + MINUTES.length) * ITEM_HEIGHT
  });

  const [mouseState, setMouseState] = useState({
    hours: { speed: 0, direction: 0 },
    minutes: { speed: 0, direction: 0 }
  });

  // Calculate current values based on scroll position
  const calculateCurrentValues = useCallback((pos: number, items: string[]) => {
    const totalHeight = items.length * ITEM_HEIGHT;
    const normalizedPos = pos % totalHeight;
    const index = Math.floor(normalizedPos / ITEM_HEIGHT);
    return items[index];
  }, []);

  // Mouse move handler for scroll columns
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>, type: 'hours' | 'minutes') => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerY = rect.top + rect.height / 2;
    const distanceFromCenter = e.clientY - centerY;

    if (Math.abs(distanceFromCenter) < SCROLL_PARAMS.PROTECTIVE_ZONE) {
      setMouseState(prev => ({
        ...prev,
        [type]: { speed: 0, direction: 0 }
      }));
      return;
    }

    setMouseState(prev => ({
      ...prev,
      [type]: {
        speed: SCROLL_PARAMS.START_SPEED,
        direction: distanceFromCenter > 0 ? 1 : -1
      }
    }));
  }, []);

  // Mouse leave handler to stop scrolling
  const handleMouseLeave = useCallback((type: 'hours' | 'minutes') => {
    setMouseState(prev => ({
      ...prev,
      [type]: { speed: 0, direction: 0 }
    }));
  }, []);

  // Continuous scrolling mechanism
  useEffect(() => {
    const interval = setInterval(() => {
      setScrollPosition(prev => {
        const totalHoursHeight = EXTENDED_HOURS.length * ITEM_HEIGHT;
        const totalMinutesHeight = EXTENDED_MINUTES.length * ITEM_HEIGHT;

        let newHoursPos = prev.hours + mouseState.hours.direction * mouseState.hours.speed;
        let newMinutesPos = prev.minutes + mouseState.minutes.direction * mouseState.minutes.speed;

        // Wrap around logic for hours
        if (newHoursPos < 0) {
          newHoursPos += totalHoursHeight;
        } else if (newHoursPos >= totalHoursHeight) {
          newHoursPos -= totalHoursHeight;
        }

        // Wrap around logic for minutes
        if (newMinutesPos < 0) {
          newMinutesPos += totalMinutesHeight;
        } else if (newMinutesPos >= totalMinutesHeight) {
          newMinutesPos -= totalMinutesHeight;
        }

        return {
          hours: newHoursPos,
          minutes: newMinutesPos
        };
      });
    }, SCROLL_PARAMS.INTERVAL);

    return () => clearInterval(interval);
  }, [mouseState]);

  // Calculate and emit current time
  const currentHour = calculateCurrentValues(scrollPosition.hours, EXTENDED_HOURS);
  const currentMinute = calculateCurrentValues(scrollPosition.minutes, EXTENDED_MINUTES);

  // Emit time changes
  useEffect(() => {
    const formattedTime = `${currentHour}:${currentMinute}`;
    onChange(formattedTime);
  }, [currentHour, currentMinute, onChange]);

  return (
    <div className="time-picker">
      <div className="time-picker-columns">
        {/* Hours Column */}
        <div className="time-picker-column hours">
          <div 
            className="time-picker-scroll-container"
            onMouseMove={(e) => handleMouseMove(e, 'hours')}
            onMouseLeave={() => handleMouseLeave('hours')}
          >
            <div 
              className="time-picker-scroll-content"
              style={{ transform: `translateY(${-scrollPosition.hours}px)` }}
            >
              {EXTENDED_HOURS.map((hour, index) => (
                <div 
                  key={`hour-${index}`} 
                  className="time-picker-scroll-item"
                  data-index={index}
                >
                  {hour}
                </div>
              ))}
            </div>
          </div>
          <div className="current-time-display">
            Current Hour: {currentHour}
          </div>
        </div>

        {/* Minutes Column */}
        <div className="time-picker-column minutes">
          <div 
            className="time-picker-scroll-container"
            onMouseMove={(e) => handleMouseMove(e, 'minutes')}
            onMouseLeave={() => handleMouseLeave('minutes')}
          >
            <div 
              className="time-picker-scroll-content"
              style={{ transform: `translateY(${-scrollPosition.minutes}px)` }}
            >
              {EXTENDED_MINUTES.map((minute, index) => (
                <div 
                  key={`minute-${index}`} 
                  className="time-picker-scroll-item"
                  data-index={index}
                >
                  {minute}
                </div>
              ))}
            </div>
          </div>
          <div className="current-time-display">
            Current Minute: {currentMinute}
          </div>
        </div>
      </div>
      <div className="full-time-display">
        Full Time: {currentHour}:{currentMinute}
      </div>
    </div>
  );
};

export default TimePicker;