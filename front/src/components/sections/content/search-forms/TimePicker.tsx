// File: src/components/TimePicker.tsx
// Last change: Restored original scrolling logic while keeping original structure

import React, { useState, useRef, useCallback, useEffect } from 'react';
import ThreeScroll from './ThreeScroll';

// Constants for layout and behavior
const ITEM_HEIGHT = 24;
const DEBOUNCE_TIME = 200;
const TOTAL_HOURS = 24;
const TOTAL_MINUTES = 12;
const TOTAL_HOURS_HEIGHT = ITEM_HEIGHT * TOTAL_HOURS;
const TOTAL_MINUTES_HEIGHT = ITEM_HEIGHT * TOTAL_MINUTES;
const DEAD_ZONE_SIZE = 5;
const MIN_SCROLL_SPEED = 1;
const MAX_SCROLL_SPEED = 10;
const EXPONENTIAL_FACTOR = 2;
const INTERVAL_DELAY = 50;

interface TimePickerProps {
  className?: string;
  value?: string; // Format "HH:MM", e.g. "14:30"
  onChange?: (timeString: string) => void;
}

const pad = (num: number) => num.toString().padStart(2, '0');

const TimePicker: React.FC<TimePickerProps> = ({ value, onChange, className }) => {
  const [scrollPosition, setScrollPosition] = useState<{ hours: number; minutes: number }>({ hours: 0, minutes: 0 });
  const [lastSentValue, setLastSentValue] = useState<string | null>(null);
  const intervalRef = useRef<{ hours: NodeJS.Timeout | null; minutes: NodeJS.Timeout | null }>({ hours: null, minutes: null });
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const scrollStateRef = useRef<{
    hours: { speed: number; direction: 'up' | 'down' };
    minutes: { speed: number; direction: 'up' | 'down' };
  }>({
    hours: { speed: 0, direction: 'up' },
    minutes: { speed: 0, direction: 'up' },
  });

  const frameStyle = {
    position: 'absolute' as const,
    left: 0,
    right: 0,
    top: '50%',
    height: `${ITEM_HEIGHT}px`,
    transform: 'translateY(-50%)',
    border: '4px solid #2196f3',
    backgroundColor: 'rgba(33, 150, 243, 0.2)',
    pointerEvents: 'none' as const,
    zIndex: 1,
    width: '100%',
    boxSizing: 'border-box' as const,
  };

  // Calculate visible value (hours or minutes)
  const calculateVisibleValue = useCallback(
    (type: 'hours' | 'minutes') => {
      const currentPos = scrollPosition[type];
      const itemHeight = ITEM_HEIGHT;
      const totalItems = type === 'hours' ? TOTAL_HOURS : TOTAL_MINUTES;
      
      const centerOffset = (200 - itemHeight) / 2;
      const adjustedPos = currentPos + centerOffset;
      const index = Math.round(adjustedPos / itemHeight) % totalItems;
      
      console.log(`Calculating visible value for ${type}: ${index}`);
      return index;
    },
    [scrollPosition]
  );

  // Update time value and call onChange
  const updateSelectedTime = useCallback(() => {
    const hour = calculateVisibleValue('hours');
    const minute = calculateVisibleValue('minutes') * 5;
    const timeString = `${pad(hour)}:${pad(minute)}`;

    console.log(`Updating selected time: ${timeString}, last sent: ${lastSentValue}`);
    if (timeString !== lastSentValue) {
      setLastSentValue(timeString);
      if (onChange) onChange(timeString);
    }
  }, [calculateVisibleValue, onChange, lastSentValue]);

  // Initialize scrolling based on input value
  useEffect(() => {
    if (value && value !== lastSentValue) {
      console.log(`Initializing from value: ${value}`);
      const [hours, minutes] = value.split(':').map(Number);
      alignToCenter('hours', hours);
      alignToCenter('minutes', minutes / 5);
      setLastSentValue(value);
    }
  }, [value]);

  // Handle mouse movement for scrolling
  const handleMouseMove = useCallback((e: React.MouseEvent, type: 'hours' | 'minutes') => {
    if (!wrapperRef.current) return;
    
    const rect = wrapperRef.current.getBoundingClientRect();
    const centerY = rect.top + rect.height / 2;
    const mouseY = e.clientY;
    
    const direction = mouseY <= centerY ? 'up' : 'down';
    
    const target = e.currentTarget as HTMLElement;
    target.classList.remove('scrolling-up', 'scrolling-down');
    target.classList.add(`scrolling-${direction}`);

    const distanceFromCenter = mouseY - centerY;
    let speed = 0;
    
    if (Math.abs(distanceFromCenter) > DEAD_ZONE_SIZE) {
      const maxDistance = (wrapperRef.current?.clientHeight ?? 200) / 2;
      const relativeDistance = Math.abs(distanceFromCenter) / maxDistance;
      speed = MIN_SCROLL_SPEED + (MAX_SCROLL_SPEED - MIN_SCROLL_SPEED) * 
        Math.pow(Math.min(1, relativeDistance), EXPONENTIAL_FACTOR);
    }

    scrollStateRef.current[type] = { speed, direction };

    if (!intervalRef.current[type] && speed > 0) {
      startScrolling(type);
    } else if (speed === 0 && intervalRef.current[type]) {
      stopScrolling(type);
    }
  }, []);

  // Start smooth scrolling
  const startScrolling = useCallback((type: 'hours' | 'minutes') => {
    if (intervalRef.current[type]) return;

    intervalRef.current[type] = setInterval(() => {
      const { speed, direction } = scrollStateRef.current[type];
      if (speed === 0) return;

      setScrollPosition(prev => {
        const totalHeight = type === 'hours' ? TOTAL_HOURS_HEIGHT : TOTAL_MINUTES_HEIGHT;
        let newPos = direction === 'up' ? prev[type] + speed : prev[type] - speed;

        if (newPos < 0) newPos += totalHeight;
        if (newPos >= totalHeight) newPos -= totalHeight;
        
        return { ...prev, [type]: newPos };
      });
    }, INTERVAL_DELAY);
  }, []);

  // Stop scrolling
  const stopScrolling = useCallback((type: 'hours' | 'minutes') => {
    if (intervalRef.current[type]) {
      clearInterval(intervalRef.current[type]!);
      intervalRef.current[type] = null;
    }
    
    const columns = document.querySelectorAll('.time-column');
    columns.forEach(column => {
      column.classList.remove('scrolling-up', 'scrolling-down');
    });
  }, []);

  // Align to center with animation
  const alignToCenter = useCallback((type: 'hours' | 'minutes', value: number) => {
    const itemHeight = ITEM_HEIGHT;
    const totalHeight = type === 'hours' ? TOTAL_HOURS_HEIGHT : TOTAL_MINUTES_HEIGHT;
    const centerOffset = (200 - itemHeight) / 2;
    const currentPos = scrollPosition[type];
    
    const basePosition = value * itemHeight;
    const currentOffset = currentPos % totalHeight;
    let targetPosition = basePosition - centerOffset;

    const diff = currentOffset - (basePosition - centerOffset);
    if (diff > totalHeight / 2) {
      targetPosition += totalHeight;
    } else if (diff < -totalHeight / 2) {
      targetPosition -= totalHeight;
    }
    const currentCycle = Math.floor(currentPos / totalHeight);
    targetPosition += currentCycle * totalHeight;

    let startTime: number | null = null;
    const duration = 300;
    const startPos = scrollPosition[type];
    const distance = targetPosition - startPos;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      let currentPos = startPos + (distance * easeProgress);
      
      if (currentPos < 0) currentPos += totalHeight;
      if (currentPos >= totalHeight) currentPos -= totalHeight;

      setScrollPosition(prev => ({
        ...prev,
        [type]: currentPos
      }));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        updateSelectedTime();
      }
    };

    requestAnimationFrame(animate);
  }, [scrollPosition, updateSelectedTime]);

  // Handle scrolling via ThreeScroll
  const handleThreeScroll = useCallback((type: 'hours' | 'minutes', distance: number) => {
    setScrollPosition(prev => {
      const totalHeight = type === 'hours' ? TOTAL_HOURS_HEIGHT : TOTAL_MINUTES_HEIGHT;
      let newPos = prev[type] + distance;

      if (newPos < 0) newPos += totalHeight;
      if (newPos >= totalHeight) newPos -= totalHeight;
      
      return { ...prev, [type]: newPos };
    });
    
    alignToCenter(type, calculateVisibleValue(type));
  }, [calculateVisibleValue, alignToCenter]);

  // Set specific value
  const handleSetCurrent = useCallback((type: 'hours' | 'minutes', value: number) => {
    alignToCenter(type, value);
  }, [alignToCenter]);

  const currentTime = new Date();

  return (
    <div ref={wrapperRef} className={`time-picker ${className || ''}`}>
      <div className="time-picker-header">HRS : MIN</div>
      <div className="time-columns-wrapper">
        <div style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
          <ThreeScroll
            type="hours"
            onScroll={(distance) => handleThreeScroll('hours', distance)}
            onSetCurrent={(value) => handleSetCurrent('hours', value)}
            currentTime={currentTime}
            itemHeight={ITEM_HEIGHT}
            debounceTime={DEBOUNCE_TIME}
          />
          <div style={{ position: 'relative', height: '200px' }}>
            <div style={frameStyle} />
            <div
              className="time-column"
              style={{ transform: `translateY(${-scrollPosition.hours}px)` }}
              onMouseMove={(e) => handleMouseMove(e, 'hours')}
              onMouseLeave={() => {
                stopScrolling('hours');
                alignToCenter('hours', calculateVisibleValue('hours'));
              }}
            >
              {Array.from({ length: TOTAL_HOURS * 3 }, (_, i) => {
                const hour = i % TOTAL_HOURS;
                return (
                  <div
                    key={`hour-${i}`}
                    className="time-item"
                    style={{ height: `${ITEM_HEIGHT}px`, lineHeight: `${ITEM_HEIGHT}px` }}
                    onClick={() => alignToCenter('hours', hour)}
                  >
                    {pad(hour)}
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ position: 'relative', height: '200px' }}>
            <div style={frameStyle} />
            <div
              className="time-column"
              style={{ transform: `translateY(${-scrollPosition.minutes}px)` }}
              onMouseMove={(e) => handleMouseMove(e, 'minutes')}
              onMouseLeave={() => {
                stopScrolling('minutes');
                alignToCenter('minutes', calculateVisibleValue('minutes'));
              }}
            >
              {Array.from({ length: TOTAL_MINUTES * 6 }, (_, i) => {
                const minute = (i % TOTAL_MINUTES) * 5;
                return (
                  <div
                    key={`minute-${i}`}
                    className="time-item"
                    style={{ height: `${ITEM_HEIGHT}px`, lineHeight: `${ITEM_HEIGHT}px` }}
                    onClick={() => alignToCenter('minutes', minute / 5)}
                  >
                    {pad(minute)}
                  </div>
                );
              })}
            </div>
          </div>
          <ThreeScroll
            type="minutes"
            onScroll={(distance) => handleThreeScroll('minutes', distance)}
            onSetCurrent={(value) => handleSetCurrent('minutes', value)}
            currentTime={currentTime}
            itemHeight={ITEM_HEIGHT}
            debounceTime={DEBOUNCE_TIME}
          />
        </div>
      </div>
      <div className="time-picker-footer"></div>
    </div>
  );
};

export default TimePicker;