// File: front/src/components/shared/elements/OpacityControl.tsx
// Last change: Simplified to switch toggle0 to toggle1 on first slider move, no extra effects

import React, { useState, useRef } from 'react';
import './OpacityControl.css';

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
  const isOpen = openSlider === id;

  const applyValue = (newValue: number) => {
  const clampedValue = Math.max(0, Math.min(100, newValue));
  setValue(clampedValue);
  
  // Automatické prepínanie toggle podľa hodnoty
  const newToggleState = clampedValue === 0 ? 0 : 1;
  
  if (newToggleState !== toggleState) {
    setToggleState(newToggleState);
    onToggle(newToggleState);
  }
  
  onChange(clampedValue / 100);
};

  const handleToggle = () => {
    const newToggleState = toggleState === 1 ? 0 : 1;
    setToggleState(newToggleState);
    onToggle(newToggleState);
    if (newToggleState === 0) {
      setValue(0);
      onChange(0);
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
      if (now - lastUpdate < 50) return;
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