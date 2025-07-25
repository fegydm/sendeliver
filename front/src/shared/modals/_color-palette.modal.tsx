// ./front/src/components/modals/color-palette.modal.tsx
import React, { useState } from "react";
import { Tabs } from "@/shared/ui/tabs.ui";
import { Button } from "@/shared/ui";
import GeneralModal from "@/shared/modals/general.modal";

interface ColorPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onColorSelect?: (color: string) => void;
}

const TAILWIND_COLORS = {
  slate: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"],
  gray: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"],
  red: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"],
  green: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"],
  blue: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"],
  yellow: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"],
};

const CUSTOM_COLORS = {
  primary: "#FF0000",
  secondary: "#00FF00",
  accent: "#0000FF",
  warning: "#FFA500",
  error: "#FF0000",
  success: "#008000",
  info: "#0000FF",
};

interface ColorWheelProps {
  onColorSelect: (color: string) => void;
  selectedColor: string;
  initialAngle: number;
  onAngleChange: (angle: number) => void;
}

const ColorWheel: React.FC<ColorWheelProps> = ({
  onColorSelect,
  selectedColor,
  initialAngle,
  onAngleChange,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [angle, setAngle] = useState(initialAngle);
  const [showTooltip, setShowTooltip] = useState(false);
  const wheelSize = 400;
  const center = wheelSize / 2;
  const outerRadius = center - 40;
  const innerRadius = outerRadius - 50;

  // Generate color segments
  const segments = Array.from({ length: 360 }, (_, i) => {
    const startAngle = ((i - 2) * Math.PI) / 180;
    const endAngle = ((i + 2) * Math.PI) / 180;
    
    const startX1 = center + Math.cos(startAngle) * outerRadius;
    const startY1 = center + Math.sin(startAngle) * outerRadius;
    const endX1 = center + Math.cos(endAngle) * outerRadius;
    const endY1 = center + Math.sin(endAngle) * outerRadius;
    
    const startX2 = center + Math.cos(endAngle) * innerRadius;
    const startY2 = center + Math.sin(endAngle) * innerRadius;
    const endX2 = center + Math.cos(startAngle) * innerRadius;
    const endY2 = center + Math.sin(startAngle) * innerRadius;

    const path = `
      M ${startX1} ${startY1}
      A ${outerRadius} ${outerRadius} 0 0 1 ${endX1} ${endY1}
      L ${startX2} ${startY2}
      A ${innerRadius} ${innerRadius} 0 0 0 ${endX2} ${endY2}
      Z
    `;

    return {
      path,
      color: `hsl(${i}, 100%, 50%)`,
      angle: i,
    };
  });

  const handleMouseDown = (e: React.MouseEvent<SVGElement>) => {
    setIsDragging(true);
    setShowTooltip(true);
    handleMouseMove(e);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setShowTooltip(false);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGElement>) => {
    if (!isDragging) return;
    const svgRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - svgRect.left - center;
    const y = e.clientY - svgRect.top - center;
    let newAngle = (Math.atan2(y, x) * 180) / Math.PI;
    if (newAngle < 0) newAngle += 360;
    setAngle(newAngle);
    onAngleChange(newAngle);
    onColorSelect(`hsl(${newAngle}, 100%, 50%)`);
  };

  // Calculate selector position
  const selectorX = center + Math.cos((angle * Math.PI) / 180) * (outerRadius - 25);
  const selectorY = center + Math.sin((angle * Math.PI) / 180) * (outerRadius - 25);

  return (
    <div className="relative">
      <svg
        width={wheelSize}
        height={wheelSize}
        className="cursor-pointer"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Color segments */}
        {segments.map((segment, i) => (
          <path
            key={i}
            d={segment.path}
            fill={segment.color}
          />
        ))}
        
        {/* Selector line */}
        <line
          x1={center}
          y1={center}
          x2={selectorX}
          y2={selectorY}
          stroke="#333"
          strokeWidth="3"
        />
        
        {/* Selector circle */}
        <circle
          cx={selectorX}
          cy={selectorY}
          r="35"
          fill={selectedColor}
          stroke="#fff"
          strokeWidth="3"
        />
      </svg>

      {showTooltip && (
        <div
          className="absolute bg-gray-900 text-white px-2 py-1 rounded text-sm whitespace-nowrap pointer-events-none"
          style={{
            left: selectorX,
            top: selectorY + 45,
            transform: "translateX(-50%)",
          }}
        >
          {selectedColor}
          <br />
          {hslToHex(
            parseInt(selectedColor.match(/hsl\((\d+)/)?.[1] || "0"),
            100,
            50
          )}
        </div>
      )}
    </div>
  );
};

const TailwindPalette: React.FC<{ onColorSelect: (color: string) => void }> = ({
  onColorSelect,
}) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4">
    {Object.entries(TAILWIND_COLORS).map(([colorName, shades]) => (
      <div key={colorName} className="flex flex-col space-y-2">
        <div className="text-sm font-medium capitalize">{colorName}</div>
        <div className="grid grid-cols-5 gap-1">
          {shades.map((shade) => (
            <div
              key={`${colorName}-${shade}`}
              className="group relative aspect-square rounded cursor-pointer hover:ring-2 ring-offset-2 ring-black dark:ring-white transition-all"
              style={{ backgroundColor: `rgb(var(--${colorName}-${shade}))` }}
              onClick={() => onColorSelect(`rgb(var(--${colorName}-${shade}))`)}
            >
              <div className="opacity-0 group-hover:opacity-100 absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs">
                {shade}
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

const CustomPalette: React.FC<{ onColorSelect: (color: string) => void }> = ({
  onColorSelect,
}) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4">
    {Object.entries(CUSTOM_COLORS).map(([colorName, color]) => (
      <div key={colorName} className="flex flex-col space-y-2">
        <div
          className="aspect-video rounded-lg cursor-pointer hover:ring-2 ring-offset-2 ring-black dark:ring-white transition-all"
          style={{ backgroundColor: color }}
          onClick={() => onColorSelect(color)}
        >
          <div className="p-2 bg-black/50 text-white text-sm rounded-b-lg mt-auto capitalize">
            {colorName}
          </div>
        </div>
      </div>
    ))}
  </div>
);

function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function generateShadesFromColor(color: string): string[] {
  const hue = parseInt(color.match(/hsl\((\d+)/)?.[1] || "0");
  return Array.from({ length: 10 }, (_, i) => {
    const lightness = 10 + i * 9;
    return `hsl(${hue}, 100%, ${lightness}%)`;
  });
}

const ColorPaletteModal: React.FC<ColorPaletteModalProps> = ({
  isOpen,
  onClose,
  onColorSelect,
}) => {
  const [selectedColor, setSelectedColor] = useState("hsl(0, 100%, 50%)");
  const [currentAngle, setCurrentAngle] = useState(0);
  const [showCopied, setShowCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("wheel");
  const shades = generateShadesFromColor(selectedColor);

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    onColorSelect?.(color);
  };

  const copyToClipboard = async () => {
    const hue = parseInt(selectedColor.match(/hsl\((\d+)/)?.[1] || "0");
    const hexColor = hslToHex(hue, 100, 50);
    try {
      await navigator.clipboard.writeText(hexColor);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy color:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <GeneralModal
      isOpen={isOpen}
      onClose={onClose}
      title="Choose Color"
      actions={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => {
            handleColorSelect(selectedColor);
            onClose();
          }}>
            Select Color
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Trigger value="wheel">Color Wheel</Tabs.Trigger>
            <Tabs.Trigger value="tailwind">Tailwind Colors</Tabs.Trigger>
            <Tabs.Trigger value="custom">Custom Palette</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="wheel">
            <ColorWheel
              onColorSelect={handleColorSelect}
              selectedColor={selectedColor}
              initialAngle={currentAngle}
              onAngleChange={setCurrentAngle}
            />
          </Tabs.Content>
          <Tabs.Content value="tailwind">
            <TailwindPalette onColorSelect={handleColorSelect} />
          </Tabs.Content>
          <Tabs.Content value="custom">
            <CustomPalette onColorSelect={handleColorSelect} />
          </Tabs.Content>
        </Tabs>

        <div className="w-full">
          <div className="relative">
            <div
              className="h-20 w-full rounded-lg shadow-lg border cursor-pointer"
              style={{ backgroundColor: selectedColor }}
              onClick={copyToClipboard}
            />
            {showCopied && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg">
                Copied to clipboard!
              </div>
            )}
          </div>
          <div className="grid grid-cols-10 gap-2 mt-4">
            {shades.map((shade, index) => (
              <div
                key={index}
                className="w-full pt-[100%] relative rounded shadow-md cursor-pointer"
                onClick={() => handleColorSelect(shade)}
              >
                <div
                  className="absolute inset-0 rounded"
                  style={{ backgroundColor: shade }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </GeneralModal>
  );
};

export default ColorPaletteModal;