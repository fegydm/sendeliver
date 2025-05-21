// File: front/src/components/shared/elements/OpacityControl.tsx
// Last change: Updated icon handling, slider positioning and improved percentage bubble

import React, { useState, useRef, useEffect } from 'react';
import './OpacityControl.css';

export interface OpacityControlProps {
  id: string;
  onToggle: (enabled: boolean) => void;
  onChange: (value: number) => void;
  initialEnabled?: boolean;
  initialValue?: number;
  color?: string;
  className?: string;
  iconColor?: string;
  openSlider: string | null;
  setOpenSlider: (id: string | null) => void;
  title?: string;
  toggleIcon?: React.ReactNode;
  arrowIcon?: React.ReactNode;
}

const OpacityControl: React.FC<OpacityControlProps> = ({
  id,
  onToggle,
  onChange,
  initialEnabled = true,
  initialValue = 100,
  color = '#3b82f6',
  className = '',
  iconColor = '#ffffff',
  openSlider,
  setOpenSlider,
  title = 'Upraviť priehľadnosť',
  toggleIcon,
  arrowIcon,
}) => {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [value, setValue] = useState(initialValue);
  const sliderRef = useRef<HTMLDivElement>(null);
  const sliderTrackRef = useRef<HTMLDivElement>(null);
  const isOpen = openSlider === id;

  const applyValue = (newValue: number) => {
    const clampedValue = Math.max(0, Math.min(100, newValue));
    setValue(clampedValue);
    const newEnabled = clampedValue > 0;
    
    if (newEnabled !== enabled) {
      setEnabled(newEnabled);
      onToggle(newEnabled);
    }
    
    onChange(clampedValue / 100);
  };

  const handleToggle = () => {
    const newEnabled = !enabled;
    setEnabled(newEnabled);
    const newValue = newEnabled ? (value > 0 ? value : 100) : 0;
    setValue(newValue);
    onToggle(newEnabled);
    onChange(newValue / 100);
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
    
    const moveHandler = (moveEvent: MouseEvent) => {
      const percentage = 100 - ((moveEvent.clientY - trackTop) / trackHeight * 100);
      applyValue(percentage);
    };
    
    const upHandler = () => {
      document.removeEventListener('mousemove', moveHandler);
      document.removeEventListener('mouseup', upHandler);
    };
    
    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', upHandler);
  };
  
  useEffect(() => {
    if (!isOpen) return;
    
    const handleOutsideClick = (e: MouseEvent) => {
      if (sliderRef.current && !sliderRef.current.contains(e.target as Node)) {
        setOpenSlider(null);
      }
    };
    
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen, setOpenSlider]);

  // Default Flag Icon 
  const defaultToggleIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className={!enabled ? 'grayscale' : ''}>
      {/* Zjednodušená vlajka */}
      <path d="M4 2v20h2v-8h10.5c.8 0 1.5-.7 1.5-1.5v-7c0-.8-.7-1.5-1.5-1.5H14l-2-2H4zm0 2h7l2 2h5.5c.3 0 .5.2.5.5v7c0 .3-.2.5-.5.5H6V4z"/>
      {!enabled && <path d="M3 21L21 3" stroke="currentColor" strokeWidth="2" opacity="0.6" />}
    </svg>
  );

  // Polyline Icon (tupouhlý trojuholník)
  const defaultPolylineIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" className={!enabled ? 'grayscale' : ''}>
      {/* Tupouhlý trojuholník približne 150 stupňov */}
      <path d="M4 18L12 6L20 18" fill="none" stroke="currentColor" strokeWidth="2" />
      {!enabled && <path d="M3 21L21 3" stroke="currentColor" strokeWidth="2" opacity="0.6" />}
    </svg>
  );

  // Ikony pre dvojité šípky (bez otáčania)
  const defaultArrowIcon = isOpen ? (
    <span className="oc-arrow-icon">⟪</span> /* Unicode U+27EA: dvojitá šípka vľavo */
  ) : (
    <span className="oc-arrow-icon">⟫</span> /* Unicode U+27EB: dvojitá šípka vpravo */
  );

  // Dynamicky vyber ikonu podľa ID
  const getIcon = () => {
    if (toggleIcon) return toggleIcon;
    if (id.includes('flag') || id.includes('marker')) return defaultToggleIcon;
    return defaultPolylineIcon;
  };

  return (
    <div className={`oc ${className}`} title={title}>
      {/* Toggle button */}
      <button 
        className={`oc-toggle ${!enabled ? 'oc-toggle--disabled' : ''}`}
        onClick={handleToggle}
        style={{ 
          backgroundColor: 'transparent',
          color: enabled ? '#333' : '#999',
          borderColor: enabled ? '#666' : '#ccc'
        }}
      >
        {getIcon()}
      </button>
      
      {/* Arrow button */}
      <button 
        className={`oc-arrow ${isOpen ? 'oc-arrow--open' : ''}`}
        onClick={handleArrowClick}
      >
        {arrowIcon || defaultArrowIcon}
      </button>
      
      {/* Slider container - repositioned */}
      {isOpen && (
        <div 
          ref={sliderRef}
          className="oc-slider"
        >
          {/* Mierka a slider */}
          <div className="oc-slider-content">
            {/* Tick marks */}
            <div className="oc-ticks">
              <div className="oc-tick oc-tick--100">
                <span className="oc-tick-label">100%</span>
              </div>
              <div className="oc-tick oc-tick--75">
                <span className="oc-tick-label">75%</span>
              </div>
              <div className="oc-tick oc-tick--50">
                <span className="oc-tick-label">50%</span>
              </div>
              <div className="oc-tick oc-tick--25">
                <span className="oc-tick-label">25%</span>
              </div>
              <div className="oc-tick oc-tick--0">
                <span className="oc-tick-label">0%</span>
              </div>
            </div>
            
            {/* Slider track */}
            <div 
              ref={sliderTrackRef}
              className="oc-track" 
              onClick={handleTrackClick}
            >
              {/* Slider fill */}
              <div 
                className="oc-fill"
                style={{ 
                  height: `${value}%`,
                  backgroundColor: color
                }}
              />
              
              {/* Slider thumb/handle s bublinou */}
              <div 
                className="oc-thumb"
                style={{ 
                  bottom: `${value}%`, 
                  borderColor: color
                }}
                onMouseDown={handleThumbMouseDown}
              >
                {/* Thumb bublina s percentami */}
                <div 
                  className="oc-bubble"
                  style={{ backgroundColor: color }}
                >
                  {Math.round(value)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpacityControl;