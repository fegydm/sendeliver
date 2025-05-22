// File: front/src/components/shared/elements/OpacityControl.tsx
// Last change: Improved code based on Grok's approach with English messages and consistent borders

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
 initialEnabled = true,
 initialValue = 100,
 color = '#3b82f6',
 className = '',
 openSlider,
 setOpenSlider,
 title = 'Adjust opacity',
 toggleIcon,
 arrowIcon,
}) => {
 const [enabled, setEnabled] = useState(initialEnabled);
 const [value, setValue] = useState(initialValue);
 const [lastNonZeroValue, setLastNonZeroValue] = useState(initialValue > 0 ? initialValue : 100);
 const sliderRef = useRef<HTMLDivElement>(null);
 const prevValueRef = useRef<number>(initialValue);
 const sliderTrackRef = useRef<HTMLDivElement>(null);
 const isOpen = openSlider === id;

 const applyValue = (newValue: number) => {
   const clampedValue = Math.max(0, Math.min(100, newValue));
   setValue(clampedValue);
   
   if (clampedValue > 0) {
     setLastNonZeroValue(clampedValue);
   }
   
   const newEnabled = clampedValue > 0;
   if (newEnabled !== enabled) {
     setEnabled(newEnabled);
     onToggle(newEnabled);
   }
   
   onChange(clampedValue / 100);
 };

 const handleToggle = () => {
   if (value > 0) {
     applyValue(0);
   } else {
     applyValue(lastNonZeroValue);
   }
 };

 useEffect(() => {
   const newEnabled = value > 0;
   if (newEnabled !== enabled) {
     setEnabled(newEnabled);
     onToggle(newEnabled);
   }
   prevValueRef.current = value;
 }, [value, enabled, onToggle]);

 const handleArrowClick = (e: React.MouseEvent) => {
   e.stopPropagation();
   console.log(`[OpacityControl] Arrow clicked, current isOpen: ${isOpen}, will ${isOpen ? 'close' : 'open'}`);
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
     const target = e.target as Node;
     
     if (sliderRef.current && !sliderRef.current.contains(target)) {
       const buttonContainer = sliderRef.current.parentElement;
       if (buttonContainer && !buttonContainer.contains(target)) {
         console.log('[OpacityControl] Outside click detected, closing slider');
         setOpenSlider(null);
       }
     }
   };
   
   document.addEventListener('mousedown', handleOutsideClick);
   return () => document.removeEventListener('mousedown', handleOutsideClick);
 }, [isOpen, setOpenSlider]);

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

 console.log(`[OpacityControl] Render - isOpen: ${isOpen}, value: ${value}, lastNonZeroValue: ${lastNonZeroValue}`);

 return (
   <div className={`oc ${className}`} title={title}>
     <button 
       className={`oc-toggle ${!enabled ? 'oc-toggle--disabled' : ''}`}
       onClick={handleToggle}
       title={`${enabled ? 'Turn off' : 'Turn on'} (${enabled ? '0%' : Math.round(lastNonZeroValue) + '%'})`}
     >
       <span className="oc-icon">
         {toggleIcon}
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
                 borderColor: color
               }}
               onMouseDown={handleThumbMouseDown}
             >
               <div 
                 className="oc-bubble"
                 style={{ backgroundColor: color }}
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