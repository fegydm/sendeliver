// File: src/components/TimeColumn.tsx
// Last change: Removed all padding fixes, clean implementation

import React, { useState, useRef, useCallback } from 'react';
import './TimeColumn.css';

const ITEM_HEIGHT = 10;
const TOTAL_HOURS = 24;
const TOTAL_MINUTES = 12;
const TOTAL_HOURS_HEIGHT = ITEM_HEIGHT * TOTAL_HOURS;
const TOTAL_MINUTES_HEIGHT = ITEM_HEIGHT * TOTAL_MINUTES;
const SCROLL_SPEED = 8;
const INTERVAL_DELAY = 50;

interface TimeColumnProps {
  className?: string;
}

const TimeColumn: React.FC<TimeColumnProps> = ({ className = '' }) => {
  const [scrollPosition, setScrollPosition] = useState({ hours: 0, minutes: 0 });
  const intervalRef = useRef<{ hours: NodeJS.Timeout | null; minutes: NodeJS.Timeout | null }>({ hours: null, minutes: null });
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const startScrolling = useCallback((type: 'hours' | 'minutes', direction: 'up' | 'down') => {
    if (intervalRef.current[type]) return;

    intervalRef.current[type] = setInterval(() => {
      setScrollPosition(prev => {
        const totalHeight = type === 'hours' ? TOTAL_HOURS_HEIGHT : TOTAL_MINUTES_HEIGHT;
        let newPos = direction === 'up' ? prev[type] - SCROLL_SPEED : prev[type] + SCROLL_SPEED;

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
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent, type: 'hours' | 'minutes') => {
    if (!wrapperRef.current) return;
    
    const rect = wrapperRef.current.getBoundingClientRect();
    const centerY = rect.top + rect.height / 2;
    const mouseY = e.clientY;
    const direction = mouseY < centerY ? 'up' : 'down';

    startScrolling(type, direction);
  }, [startScrolling]);

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
          <div key={`hour-${i}`} className="time-item">
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
          <div key={`minute-${i}`} className="time-item">
            {String((i % TOTAL_MINUTES) * 5).padStart(2, '0')}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimeColumn;