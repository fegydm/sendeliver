// File: src/features/home/components/search-forms/app.ltime-lcolumn.comp.tsx
// Artifact: Fixed error "Cannot find name 'newPos'" and warnings "'e' is declared but never read"
import React, { useState, useRef, useCallback } from 'react';
import './app.ltime-lcolumn.css';
import threescroll from './threescroll';

// Constants for item height and debounce time
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

interface TimeColumnProps {
  className?: string;
}

const TimeColumn: React.FC<timeColumnProps> = () => {
  const [scrollPosition, setScrollPosition] = useState<{ hours: number; minutes: number }>({ hours: 0, minutes: 0 });
  const intervalRef = useRef<{ hours: NodeJS.Timeout | null; minutes: NodeJS.Timeout | null }>({ hours: null, minutes: null });
  const wrapperRef = useRef<hTMLDivElement | null>(null);
  const scrollStateRef = useRef<{
    hours: { speed: number; direction: 'up' | 'down' };
    minutes: { speed: number; direction: 'up' | 'down' };
  }>({
    hours: { speed: 0, direction: 'up' },
    minutes: { speed: 0, direction: 'up' }
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
    boxSizing: 'border-box' as const
  };

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
    
    const columns = document.querySelectorAll('.time-column');
    columns.forEach(column => {
      column.classList.remove('scrolling-up', 'scrolling-down');
    });
  }, []);

  const calculateVisibleValue = useCallback((type: 'hours' | 'minutes') => {
    const currentPos = scrollPosition[type];
    const itemHeight = ITEM_HEIGHT;
    const totalItems = type === 'hours' ? TOTAL_HOURS : TOTAL_MINUTES;
    
    const centerOffset = (200 - itemHeight) / 2;
    const adjustedPos = currentPos + centerOffset;
    const index = Math.round(adjustedPos / itemHeight) % totalItems;
    
    return index;
  }, [scrollPosition]);

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

    let startTime: number;
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
      if (currentPos >= totalHeight) currentPos -= totalHeight; // Fixed: Changed 'newPos' to 'currentPos'

      setScrollPosition(prev => ({
        ...prev,
        [type]: currentPos
      }));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [scrollPosition]);

  const handleThreeScroll = useCallback((type: 'hours' | 'minutes', distance: number) => {
    setScrollPosition(prev => {
      const totalHeight = type === 'hours' ? TOTAL_HOURS_HEIGHT : TOTAL_MINUTES_HEIGHT;
      let newPos = prev[type] + distance;

      if (newPos < 0) newPos += totalHeight;
      if (newPos >= totalHeight) newPos -= totalHeight;
      
      return { ...prev, [type]: newPos };
    });
  }, []);

  const handleSetCurrent = useCallback((type: 'hours' | 'minutes', value: number) => {
    alignToCenter(type, value);
  }, [alignToCenter]);

  const currentTime = new Date();

  return (
    <div ref={wrapperRef} className="time-columns-wrapper">
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
            onMouseLeave={() => { // Fixed: Removed unused 'e' parameter
              stopScrolling('hours');
              alignToCenter('hours', calculateVisibleValue('hours'));
            }}
          >
            {Array.from({ length: TOTAL_HOURS * 3 }, (_, i) => {
              const value = i % TOTAL_HOURS;
              return (
                <div 
                  key={`hour-${i}`} 
                  className="time-item"
                  style={{ height: `${ITEM_HEIGHT}px`, lineHeight: `${ITEM_HEIGHT}px` }}
                  onClick={() => alignToCenter('hours', value)}
                >
                  {String(value).padStart(2, '0')}
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
            onMouseLeave={() => { // Fixed: Removed unused 'e' parameter
              stopScrolling('minutes');
              alignToCenter('minutes', calculateVisibleValue('minutes'));
            }}
          >
            {Array.from({ length: TOTAL_MINUTES * 6 }, (_, i) => {
              const value = i % TOTAL_MINUTES;
              return (
                <div 
                  key={`minute-${i}`} 
                  className="time-item"
                  style={{ height: `${ITEM_HEIGHT}px`, lineHeight: `${ITEM_HEIGHT}px` }}
                  onClick={() => alignToCenter('minutes', value)}
                >
                  {String(value * 5).padStart(2, '0')}
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
  );
};

export default TimeColumn;