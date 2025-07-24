// File: src/features/home/components/search-forms/app.ltime-lpicker.comp.tsx
// Last change: Updated BEM class names to align with datetime-select, max 2 parts in className

import React, { useState, useRef, useCallback, useEffect } from 'react';
import ThreeScroll from './ThreeScroll';

const ITEM_HEIGHT = 24;
const TOTAL_HOURS = 24;
const TOTAL_MINUTES = 12; // 12 x 5 = 60 minutes
const TOTAL_HOURS_HEIGHT = ITEM_HEIGHT * TOTAL_HOURS;
const TOTAL_MINUTES_HEIGHT = ITEM_HEIGHT * TOTAL_MINUTES;
const DEAD_ZONE_SIZE = 5;
const MIN_SCROLL_SPEED = 1;
const MAX_SCROLL_SPEED = 10;
const EXPONENTIAL_FACTOR = 2;
const INTERVAL_DELAY = 50;

interface TimePickerProps {
  className?: string;
  value?: string;
  onChange?: (timeString: string) => void;
}

const pad = (num: number) => num.toString().padStart(2, '0');

const TimePicker: React.FC<TimePickerProps> = ({ value, onChange, className }) => {
  const [scrollPosition, setScrollPosition] = useState<{ hours: number; minutes: number }>({ hours: 0, minutes: 0 });
  const [lastSentValue, setLastSentValue] = useState<string | null>(null);
  const [scrollDirection, setScrollDirection] = useState<{ hours: 'up' | 'down'; minutes: 'up' | 'down' }>({ hours: 'down', minutes: 'down' });
  
  const intervalRef = useRef<{ hours: NodeJS.Timeout | null; minutes: NodeJS.Timeout | null }>({ hours: null, minutes: null });
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const scrollStateRef = useRef<{
    hours: { speed: number; direction: 'up' | 'down' };
    minutes: { speed: number; direction: 'up' | 'down' };
  }>({
    hours: { speed: 0, direction: 'up' },
    minutes: { speed: 0, direction: 'up' },
  });

  const calculateVisibleValue = useCallback((type: 'hours' | 'minutes') => {
    const currentPos = scrollPosition[type];
    const totalItems = type === 'hours' ? TOTAL_HOURS : TOTAL_MINUTES;
    const centerOffset = (200 - ITEM_HEIGHT) / 2;
    const adjustedPos = currentPos + centerOffset;
    const index = Math.round(adjustedPos / ITEM_HEIGHT) % totalItems;
    return index;
  }, [scrollPosition]);

  const updateSelectedTime = useCallback(() => {
    const hour = calculateVisibleValue('hours');
    const minute = calculateVisibleValue('minutes') * 5;
    const timeString = `${pad(hour)}:${pad(minute)}`;
    console.log(`Updating time: ${timeString}, last: ${lastSentValue}`);
    if (timeString !== lastSentValue) {
      setLastSentValue(timeString);
      if (onChange) {
        console.log(`Sending to parent: ${timeString}`);
        onChange(timeString);
      }
    }
  }, [calculateVisibleValue, onChange, lastSentValue]);

  useEffect(() => {
    updateSelectedTime();
  }, [scrollPosition, updateSelectedTime]);

  useEffect(() => {
    if (value && value !== lastSentValue) {
      const [hours, minutes] = value.split(':').map(Number);
      if (!isNaN(hours) && !isNaN(minutes)) {
        alignToCenter('hours', hours);
        alignToCenter('minutes', minutes / 5);
        setLastSentValue(value);
      }
    }
  }, [value]);

  useEffect(() => {
    return () => {
      if (intervalRef.current.hours) clearInterval(intervalRef.current.hours);
      if (intervalRef.current.minutes) clearInterval(intervalRef.current.minutes);
    };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent, type: 'hours' | 'minutes') => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const centerY = rect.top + rect.height / 2;
    const mouseY = e.clientY;
    const direction = mouseY <= centerY ? 'up' : 'down';
    setScrollDirection(prev => ({ ...prev, [type]: direction }));

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
      setScrollDirection(prev => ({ ...prev, [type]: direction }));
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
    alignToCenter(type, calculateVisibleValue(type));
  }, [calculateVisibleValue]);

  const alignToCenter = useCallback((type: 'hours' | 'minutes', value: number) => {
    console.log(`Aligning ${type} to ${value}`);
    const totalHeight = type === 'hours' ? TOTAL_HOURS_HEIGHT : TOTAL_MINUTES_HEIGHT;
    const centerOffset = (200 - ITEM_HEIGHT) / 2;
    const basePosition = value * ITEM_HEIGHT;
    let targetPosition = basePosition - centerOffset;
    const currentPos = scrollPosition[type];
    const currentOffset = currentPos % totalHeight;
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
    setScrollDirection(prev => ({
      ...prev,
      [type]: distance > 0 ? 'up' : 'down'
    }));

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

  const handleStep = useCallback((type: 'hours' | 'minutes', step: number) => {
    console.log(`Stepping ${type} by ${step}`);
    const currentValue = calculateVisibleValue(type);
    const totalItems = type === 'hours' ? TOTAL_HOURS : TOTAL_MINUTES;
    let newValue = (currentValue + step) % totalItems;
    if (newValue < 0) newValue += totalItems;
    console.log(`Step from ${currentValue} to ${newValue}`);
    setScrollPosition(prev => {
      const totalHeight = type === 'hours' ? TOTAL_HOURS_HEIGHT : TOTAL_MINUTES_HEIGHT;
      const centerOffset = (200 - ITEM_HEIGHT) / 2;
      const targetPos = (newValue * ITEM_HEIGHT) - centerOffset;
      const currentPos = prev[type];
      const currentCycle = Math.floor(currentPos / totalHeight);
      let newPos = targetPos + (currentCycle * totalHeight);
      if (newPos < 0) newPos += totalHeight;
      if (newPos >= totalHeight) newPos -= totalHeight;
      return { ...prev, [type]: newPos };
    });
    setTimeout(() => {
      updateSelectedTime();
    }, 10);
  }, [calculateVisibleValue, updateSelectedTime]);

  const handleSelectCurrent = useCallback((type: 'hours' | 'minutes', value: number) => {
    console.log(`Direct selection of ${type} to value ${value}`);
    if (type === 'minutes') {
      const currentMinuteIndex = calculateVisibleValue('minutes');
      const currentMinuteValue = currentMinuteIndex * 5;
      const newMinuteIndex = currentMinuteValue < 15 ? 6 : 0;
      console.log(`Toggling minutes from ${currentMinuteValue} to ${newMinuteIndex * 5}`);
      setScrollPosition(prev => {
        const totalHeight = TOTAL_MINUTES_HEIGHT;
        const centerOffset = (200 - ITEM_HEIGHT) / 2;
        const targetPos = (newMinuteIndex * ITEM_HEIGHT) - centerOffset;
        const currentPos = prev.minutes;
        const currentCycle = Math.floor(currentPos / totalHeight);
        let newPos = targetPos + (currentCycle * totalHeight);
        if (newPos < 0) newPos += totalHeight;
        if (newPos >= totalHeight) newPos -= totalHeight;
        return { ...prev, minutes: newPos };
      });
    } else {
      alignToCenter(type, value);
    }
    setTimeout(() => {
      updateSelectedTime();
    }, 10);
  }, [calculateVisibleValue, alignToCenter, updateSelectedTime]);

  const currentTime = new Date();

  return (
    <div ref={wrapperRef} className={`datetime-select__time-picker ${className || ''}`}>
      <div className="datetime-select__time-header">HRS : MIN</div>
      <div className="datetime-select__time-wrapper">
        <ThreeScroll
          type="hours"
          onStep={(step) => handleStep('hours', step)}
          onSelectCurrent={(value) => handleSelectCurrent('hours', value)}
          currentTime={currentTime}
        />
        <div className="datetime-select__time-container">
          <div className="datetime-select__time-frame" />
          <div
            className="datetime-select__time-hours"
            style={{ transform: `translateY(${-scrollPosition.hours}px)` }}
            onMouseMove={(e) => handleMouseMove(e, 'hours')}
            onMouseLeave={() => stopScrolling('hours')}
          >
            {Array.from({ length: TOTAL_HOURS * 3 }, (_, i) => {
              const hour = i % TOTAL_HOURS;
              return (
                <div
                  key={`hour-${i}`}
                  className="datetime-select__time-item"
                  data-hour={hour}
                  onClick={() => alignToCenter('hours', hour)}
                >
                  {pad(hour)}
                </div>
              );
            })}
          </div>
        </div>
        <div className="datetime-select__time-container">
          <div className="datetime-select__time-frame" />
          <div
            className="datetime-select__time-minutes"
            style={{ transform: `translateY(${-scrollPosition.minutes}px)` }}
            onMouseMove={(e) => handleMouseMove(e, 'minutes')}
            onMouseLeave={() => stopScrolling('minutes')}
          >
            {Array.from({ length: TOTAL_MINUTES * 3 }, (_, i) => {
              const minute = (i % TOTAL_MINUTES) * 5;
              return (
                <div
                  key={`minute-${i}`}
                  className="datetime-select__time-item"
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
          onStep={(step) => handleStep('minutes', step)}
          onSelectCurrent={(value) => handleSelectCurrent('minutes', value)}
          currentTime={currentTime}
        />
      </div>
      <div className="datetime-select__time-footer"></div>
    </div>
  );
};

export default TimePicker;