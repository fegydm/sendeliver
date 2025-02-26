// File: src/components/ThreeScroll.tsx
import React, { useCallback, useState, useEffect } from 'react';
import './ThreeScroll.css';

interface ThreeScrollProps {
  type: 'hours' | 'minutes';
  onStep: (step: number) => void;
  onSelectCurrent: (value: number) => void;
  currentTime?: Date;
}

const ThreeScroll: React.FC<ThreeScrollProps> = ({
  type,
  onStep,
  onSelectCurrent,
  currentTime
}) => {
  const effectiveTime = currentTime || new Date();
  const [minuteDisplay, setMinuteDisplay] = useState<'00' | '30'>(() => {
    const minutes = effectiveTime.getMinutes();
    return minutes < 30 ? '30' : '00';
  });

  useEffect(() => {
    const minutes = effectiveTime.getMinutes();
    setMinuteDisplay(minutes < 30 ? '30' : '00');
  }, [effectiveTime]);

  const isFutureDate = (date: Date) => {
    const today = new Date();
    const referenceDate = new Date('2025-02-27T00:00:00');
    return date.getTime() >= referenceDate.getTime() || date.getTime() > today.getTime();
  };

  const getCircleValue = useCallback(() => {
    if (type === 'hours') {
      const hours = effectiveTime.getHours();
      if (isFutureDate(effectiveTime)) {
        return '08';
      }
      return String((hours + 1) % 24).padStart(2, '0');
    } else {
      return minuteDisplay;
    }
  }, [effectiveTime, type, minuteDisplay]);

  const handleCircleClick = useCallback(() => {
    if (type === 'hours') {
      const value = isFutureDate(effectiveTime)
        ? 8
        : (effectiveTime.getHours() + 1) % 24;
      onSelectCurrent(value);
    } else {
      if (minuteDisplay === '30') {
        onSelectCurrent(30);
        setMinuteDisplay('00');
      } else {
        onSelectCurrent(0);
        setMinuteDisplay('30');
      }
    }
  }, [type, effectiveTime, onSelectCurrent, minuteDisplay]);

  const handleUp = useCallback(() => {
    onStep(1);
  }, [onStep]);

  const handleDown = useCallback(() => {
    onStep(-1);
  }, [onStep]);

  const displayValue = getCircleValue();

  return (
    <div className="three-scroll">
     <button className="three-scroll__triangle three-scroll__triangle--up" type="button" onClick={handleUp} aria-label={`Increase ${type}`}>
  <svg className="three-scroll__icon" viewBox="0 0 24 24">
    <path d="M6 16l6-8 6 8z" />
  </svg>
</button>
      <button
        className="three-scroll__circle"
        type="button"
        onClick={handleCircleClick}
        aria-label={`Set ${type} to ${displayValue}`}
      >
        {displayValue}
      </button>
      <button className="three-scroll__triangle three-scroll__triangle--down" type="button" onClick={handleDown} aria-label={`Decrease ${type}`}>
  <svg className="three-scroll__icon" viewBox="0 0 24 24">
    <path d="M6 8l6 8 6-8z" />
  </svg>
</button>
    </div>
  );
};

export default ThreeScroll;