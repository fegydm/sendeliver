// File: front/src/shared/modals/color-picker.modal.tsx
// Last change: Created a new, advanced color picker with real-time shade previews.

import React, { useState, useMemo } from "react";
import { Button } from "@/shared/ui";
import GeneralModal from "@/shared/modals/general.modal";
import { HslColor } from "@/types/domains/theme.types";
import { generateThemePalette } from "@/utils/color.utils";
import "./color-picker.modal.css";

interface ColorPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onColorSelect: (color: HslColor) => void;
  initialColor: HslColor;
}

const ColorWheel: React.FC<{
  hsl: HslColor;
  onHueChange: (h: number) => void;
}> = ({ hsl, onHueChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const wheelSize = 250;
  const center = wheelSize / 2;
  const radius = center - 15;

  const handleInteraction = (e: React.MouseEvent<SVGElement>) => {
    const svgRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - svgRect.left - center;
    const y = e.clientY - svgRect.top - center;
    let newAngle = Math.round((Math.atan2(y, x) * 180) / Math.PI);
    if (newAngle < 0) newAngle += 360;
    onHueChange(newAngle);
  };

  const selectorX = center + Math.cos((hsl.h * Math.PI) / 180) * radius;
  const selectorY = center + Math.sin((hsl.h * Math.PI) / 180) * radius;

  return (
    <svg
      width={wheelSize}
      height={wheelSize}
      className="cursor-pointer"
      onMouseDown={(e) => { setIsDragging(true); handleInteraction(e); }}
      onMouseMove={(e) => isDragging && handleInteraction(e)}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
    >
      <defs>
        <conicGradient id="hue-gradient" from="0deg" x="50%" y="50%">
          <stop offset="0%" stopColor="hsl(0, 100%, 50%)" />
          <stop offset="16.66%" stopColor="hsl(60, 100%, 50%)" />
          <stop offset="33.33%" stopColor="hsl(120, 100%, 50%)" />
          <stop offset="50%" stopColor="hsl(180, 100%, 50%)" />
          <stop offset="66.66%" stopColor="hsl(240, 100%, 50%)" />
          <stop offset="83.33%" stopColor="hsl(300, 100%, 50%)" />
          <stop offset="100%" stopColor="hsl(360, 100%, 50%)" />
        </conicGradient>
      </defs>
      <circle cx={center} cy={center} r={radius} fill="url(#hue-gradient)" />
      <circle cx={center} cy={center} r={radius - 40} fill="var(--color-canvas, white)" />
      <circle cx={selectorX} cy={selectorY} r="12" fill={`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`} stroke="white" strokeWidth="3" />
    </svg>
  );
};

const ColorPickerModal: React.FC<ColorPickerModalProps> = ({ isOpen, onClose, onColorSelect, initialColor }) => {
  const [selectedHsl, setSelectedHsl] = useState<HslColor>(initialColor);

  const derivedPalette = useMemo(() => generateThemePalette(selectedHsl), [selectedHsl]);

  const handleFinalSelect = () => {
    onColorSelect(selectedHsl);
    onClose();
  };

  return (
    <GeneralModal
      isOpen={isOpen}
      onClose={onClose}
      title="Choose Base Color"
      actions={
        <>
          <Button variant="cancel" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleFinalSelect}>Select Color</Button>
        </>
      }
    >
      <div className="color-picker__layout">
        <div className="color-picker__controls">
          <ColorWheel
            hsl={selectedHsl}
            onHueChange={(h) => setSelectedHsl(prev => ({ ...prev, h }))}
          />
          <div className="color-picker__sliders">
            <div className="color-picker__slider-group">
              <span className="color-picker__slider-label">S</span>
              <input
                type="range"
                min="0"
                max="100"
                value={selectedHsl.s}
                className="color-picker__slider"
                onChange={(e) => setSelectedHsl(prev => ({ ...prev, s: parseInt(e.target.value) }))}
              />
            </div>
            <div className="color-picker__slider-group">
              <span className="color-picker__slider-label">L</span>
              <input
                type="range"
                min="0"
                max="100"
                value={selectedHsl.l}
                className="color-picker__slider"
                onChange={(e) => setSelectedHsl(prev => ({ ...prev, l: parseInt(e.target.value) }))}
              />
            </div>
          </div>
        </div>
        <div className="color-picker__preview">
          <h3 className="font-semibold">Derived Palette Preview</h3>
          <div className="color-picker__preview-item">
            <div className="color-picker__preview-swatch" style={{ backgroundColor: derivedPalette['--tab-inactive-bg'] }} />
            <span className="color-picker__preview-label">--tab-inactive-bg</span>
          </div>
          <div className="color-picker__preview-item">
            <div className="color-picker__preview-swatch" style={{ backgroundColor: derivedPalette['--tab-hover-bg'] }} />
            <span className="color-picker__preview-label">--tab-hover-bg</span>
          </div>
          <div className="color-picker__preview-item">
            <div className="color-picker__preview-swatch" style={{ backgroundColor: `hsl(${derivedPalette['--primary-h']}, ${derivedPalette['--primary-s']}, ${derivedPalette['--primary-l']})` }} />
            <span className="color-picker__preview-label">--primary</span>
          </div>
        </div>
      </div>
    </GeneralModal>
  );
};

export default ColorPickerModal;
