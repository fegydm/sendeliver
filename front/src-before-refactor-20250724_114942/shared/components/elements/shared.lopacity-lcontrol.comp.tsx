// File: src/shared/components/elements/shared.lopacity-lcontrol.comp.tsx
// Last change: Stable toggle0 at 0%, toggle1 at 1-100%, no blinking, kept ref-based logic

import React, { useState, useRef } from 'react';
import './shared.lopacity-lcontrol.css';

// Konfigurovateľný threshold pre zapamätanie hodnôt
const MIN_REMEMBER_THRESHOLD = 10; // Hodnoty pod 10% sa nezapamätávajú

export interface OpacityControlProps {
  id: string;
  onToggle: (state: number) => void;
  onChange: (value: number) => void;
  initialToggleState?: number;
  initialValue?: number;
  color?: string;
  className?: string;
  openSlider: string | null;
  setOpenSlider: (id: string | null) => void;
  title?: string;
  toggleIcon: React.ReactNode;
  arrowIcon?: React.ReactNode;
}

const OpacityControl: React.FC<OpacityControlProps> = ({
  id,
  onToggle,
  onChange,
  initialToggleState = 1,
  initialValue = 100,
  color = '#3b82f6',
  className = '',
  openSlider,
  setOpenSlider,
  title = 'Adjust opacity',
  toggleIcon,
  arrowIcon,
}) => {
  const [toggleState, setToggleState] = useState(initialToggleState);
  const [value, setValue] = useState(initialValue);
  const sliderRef = useRef<HTMLDivElement>(null);
  const sliderTrackRef = useRef<HTMLDivElement>(null);
  const currentValueRef = useRef(value);
  const currentToggleRef = useRef(toggleState);
  const lastNonZeroValueRef = useRef(initialValue >= MIN_REMEMBER_THRESHOLD ? initialValue : 50);
  const isOpen = openSlider === id;

  // Sync refs s aktuálnymi hodnotami
  currentValueRef.current = value;
  currentToggleRef.current = toggleState;

  const applyValue = (newValue: number) => {
    const clampedValue = Math.max(0, Math.min(100, newValue));
    
    // Ak sa hodnota nezmenila, preskoč
    if (Math.abs(clampedValue - currentValueRef.current) < 0.1) {
      return;
    }
    
    // Zapamätaj si poslednú rozumnú hodnotu
    if (clampedValue >= MIN_REMEMBER_THRESHOLD) {
      lastNonZeroValueRef.current = clampedValue;
    }
    
    setValue(clampedValue);
    currentValueRef.current = clampedValue;
    
    // Automatické prepínanie toggle podľa hodnoty
    const newToggleState = clampedValue === 0 ? 0 : 1;
    
    if (newToggleState !== currentToggleRef.current) {
      setToggleState(newToggleState);
      currentToggleRef.current = newToggleState;
      onToggle(newToggleState);
    }
    
    onChange(clampedValue / 100);
  };

  const handleToggle = () => {
    const newToggleState = currentToggleRef.current === 1 ? 0 : 1;
    
    if (newToggleState === 0) {
      // Vypína sa - nastav na 0
      setToggleState(0);
      currentToggleRef.current = 0;
      onToggle(0);
      setValue(0);
      currentValueRef.current = 0;
      onChange(0);
    } else {
      // Zapína sa - obnov poslednú rozumnú hodnotu
      applyValue(lastNonZeroValueRef.current);
    }
  };

  const handleArrowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenSlider(isOpen ? null : id);
  };

  const handleTrackClick = (e: React.MouseEvent) => {
    if (!sliderTrackRef.current) return;
    const rect = sliderTrackRef.current.getBoundingClientRect();
    const percentage = 100 - ((e.clientY - rect.top) / rect.height * 100);
    applyValue(percentage);
  };

  const handleThumbMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!sliderTrackRef.current) return;
    const trackRect = sliderTrackRef.current.getBoundingClientRect();
    const trackHeight = trackRect.height;
    const trackTop = trackRect.top;
    let lastUpdate = 0;
    
    const moveHandler = (moveEvent: MouseEvent) => {
      const now = performance.now();
      if (now - lastUpdate < 32) return; // 30 FPS throttling
      lastUpdate = now;
      
      const rawPercentage = 100 - ((moveEvent.clientY - trackTop) / trackHeight * 100);
      const percentage = Math.max(0, rawPercentage);
      applyValue(percentage);
    };
    
    const upHandler = () => {
      document.removeEventListener('mousemove', moveHandler);
      document.removeEventListener('mouseup', upHandler);
    };
    
    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', upHandler);
  };

  const handleSliderClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.target === sliderRef.current) {
      setOpenSlider(null);
    }
  };

  const defaultArrowIcon = isOpen ? '«' : '»';

  const generateTicks = () => {
    const ticks = [];
    for (let i = 100; i >= 0; i -= 10) {
      const showLabel = i === 100 || i === 50 || i === 0;
      ticks.push(
        <div 
          key={i} 
          className={`oc-tick ${showLabel ? 'oc-tick--labeled' : ''}`}
          style={{ top: `${100 - i}%` }}
        >
          <div className="oc-tick-mark"></div>
          {showLabel && <span className="oc-tick-label">{i}%</span>}
        </div>
      );
    }
    return ticks;
  };

  return (
    <div className={`oc ${className}`} title={title}>
      <button 
        className={`oc-toggle ${toggleState === 0 ? 'oc-toggle--disabled' : ''}`}
        onClick={handleToggle}
        title={`${toggleState === 1 ? 'Disable' : 'Enable'} (${Math.round(value)}%)`}
      >
        <span className="oc-icon">
          {toggleIcon}
          {toggleState === 0 && <div className="oc-disabled-overlay"></div>}
        </span>
      </button>
      <button 
        className={`oc-arrow ${isOpen ? 'oc-arrow--open' : ''}`}
        onClick={handleArrowClick}
        title={`${isOpen ? 'Close' : 'Open'} slider`}
      >
        {arrowIcon || defaultArrowIcon}
      </button>
      {isOpen && (
        <div 
          ref={sliderRef}
          className="oc-slider"
          onClick={handleSliderClick}
        >
          <div className="oc-slider-content">
            <div 
              ref={sliderTrackRef}
              className="oc-track" 
              onClick={handleTrackClick}
            >
              <div 
                className="oc-fill"
                style={{ 
                  height: `${value}%`,
                  backgroundColor: color
                }}
              />
              <div 
                className="oc-thumb"
                style={{ 
                  bottom: `${value}%`, 
                  borderColor: color,
                  backgroundColor: '#fff',
                  cursor: 'grab'
                }}
                onMouseDown={handleThumbMouseDown}
              >
                <div 
                  className="oc-bubble"
                  style={{ 
                    backgroundColor: color
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {Math.round(value)}%
                </div>
              </div>
            </div>
            <div className="oc-scale">
              {generateTicks()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpacityControl;