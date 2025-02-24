// File: src/components/TimeColumn.tsx
import React, { useState, useRef, useCallback } from 'react';
import './TimeColumn.css';

// Configuration constants
const ITEM_HEIGHT = 40;
const TOTAL_HOURS = 24;
const TOTAL_MINUTES = 12;
const TOTAL_HOURS_HEIGHT = ITEM_HEIGHT * TOTAL_HOURS;
const TOTAL_MINUTES_HEIGHT = ITEM_HEIGHT * TOTAL_MINUTES;
const DEAD_ZONE_SIZE = 5;
const MIN_SCROLL_SPEED = 1;
const MAX_SCROLL_SPEED = 10;
const EXPONENTIAL_FACTOR = 2;
const INTERVAL_DELAY = 50;

interface TimeColumnProps {
  className?: string;
}

const TimeColumn: React.FC<TimeColumnProps> = () => {
  const [scrollPosition, setScrollPosition] = useState({ hours: 0, minutes: 0 });
  const intervalRef = useRef<{ hours: NodeJS.Timeout | null; minutes: NodeJS.Timeout | null }>({ hours: null, minutes: null });
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const scrollStateRef = useRef<{
    hours: { speed: number; direction: 'up' | 'down' };
    minutes: { speed: number; direction: 'up' | 'down' };
  }>({
    hours: { speed: 0, direction: 'up' },
    minutes: { speed: 0, direction: 'up' }
  });

  const calculateScrollSpeed = useCallback((mouseY: number, centerY: number) => {
    const distanceFromCenter = mouseY - centerY;
    
    // Dead zone affects only scrolling speed
    if (Math.abs(distanceFromCenter) <= DEAD_ZONE_SIZE) {
      // Return direction based on exact center position, but zero speed
      return { 
        speed: 0, 
        direction: distanceFromCenter <= 0 ? 'up' as const : 'down' as const 
      };
    }

    const direction = distanceFromCenter < 0 ? 'up' as const : 'down' as const;
    
    // Calculate relative distance (0-1)
    const maxDistance = (wrapperRef.current?.clientHeight ?? 200) / 2;
    const relativeDistance = Math.abs(distanceFromCenter) / maxDistance;
    
    // Apply exponential curve
    const speed = MIN_SCROLL_SPEED + (MAX_SCROLL_SPEED - MIN_SCROLL_SPEED) * 
      Math.pow(Math.min(1, relativeDistance), EXPONENTIAL_FACTOR);
    
    return { speed, direction };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent, type: 'hours' | 'minutes') => {
    if (!wrapperRef.current) return;
    
    const rect = wrapperRef.current.getBoundingClientRect();
    const centerY = rect.top + rect.height / 2;
    const mouseY = e.clientY;
    
    // Arrow direction changes exactly at center point
    const direction = mouseY <= centerY ? 'up' : 'down';
    
    // Update cursor immediately based on direction
    const target = e.currentTarget as HTMLElement;
    target.classList.remove('scrolling-up', 'scrolling-down');
    target.classList.add(`scrolling-${direction}`);

    // Scrolling speed respects dead zone
    const distanceFromCenter = mouseY - centerY;
    let speed = 0;
    
    if (Math.abs(distanceFromCenter) > DEAD_ZONE_SIZE) {
      const maxDistance = (wrapperRef.current?.clientHeight ?? 200) / 2;
      const relativeDistance = Math.abs(distanceFromCenter) / maxDistance;
      speed = MIN_SCROLL_SPEED + (MAX_SCROLL_SPEED - MIN_SCROLL_SPEED) * 
        Math.pow(Math.min(1, relativeDistance), EXPONENTIAL_FACTOR);
    }

    // Update scroll state
    scrollStateRef.current[type] = { speed, direction };

    // Start/stop interval based on speed
    if (!intervalRef.current[type] && speed > 0) {
      startScrolling(type);
    } else if (speed === 0 && intervalRef.current[type]) {
      stopScrolling(type);
    }
  }, []);

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

  const stopScrolling = useCallback((type: 'hours' | 'minutes') => {
    if (intervalRef.current[type]) {
      clearInterval(intervalRef.current[type]!);
      intervalRef.current[type] = null;
    }
    
    // Remove scroll direction classes
    const columns = document.querySelectorAll('.time-column');
    columns.forEach(column => {
      column.classList.remove('scrolling-up', 'scrolling-down');
    });
  }, []);

  return (
    <div ref={wrapperRef} className="time-columns-wrapper">
      {/* Hours Column */}
      <div 
        className="time-column"
        style={{ transform: `translateY(${-scrollPosition.hours}px)` }}
        onMouseMove={(e) => handleMouseMove(e, 'hours')}
        onMouseLeave={() => stopScrolling('hours')}
      >
        {Array.from({ length: TOTAL_HOURS * 3 }, (_, i) => (
          <div 
            key={`hour-${i}`} 
            className="time-item"
            style={{ height: `${ITEM_HEIGHT}px`, lineHeight: `${ITEM_HEIGHT}px` }}
          >
            {String(i % TOTAL_HOURS).padStart(2, '0')}
          </div>
        ))}
      </div>

      {/* Minutes Column */}
      <div 
        className="time-column"
        style={{ transform: `translateY(${-scrollPosition.minutes}px)` }}
        onMouseMove={(e) => handleMouseMove(e, 'minutes')}
        onMouseLeave={() => stopScrolling('minutes')}
      >
        {Array.from({ length: TOTAL_MINUTES * 6 }, (_, i) => (
          <div 
            key={`minute-${i}`} 
            className="time-item"
            style={{ height: `${ITEM_HEIGHT}px`, lineHeight: `${ITEM_HEIGHT}px` }}
          >
            {String((i % TOTAL_MINUTES) * 5).padStart(2, '0')}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimeColumn;