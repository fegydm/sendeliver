// ./front/src/components/modals/color-palette.modal.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs.ui";
import { Button } from "@/components/ui";

interface CircularPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [angle, setAngle] = useState(initialAngle);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const outerRadius = Math.min(centerX, centerY) - 40;
    const innerRadius = outerRadius - 50;

    for (let angle = 0; angle < 360; angle++) {
      const startAngle = ((angle - 2) * Math.PI) / 180;
      const endAngle = ((angle + 2) * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = `hsl(${angle}, 100%, 50%)`;
      ctx.fill();
    }

    const handX =
      centerX + Math.cos((angle * Math.PI) / 180) * (outerRadius - 25);
    const handY =
      centerY + Math.sin((angle * Math.PI) / 180) * (outerRadius - 25);
    setTooltipPos({ x: handX, y: handY });

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(handX, handY);
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(handX, handY, 35, 0, Math.PI * 2);
    ctx.fillStyle = selectedColor;
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.stroke();
  }, [angle, selectedColor]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setShowTooltip(true);
    handleMouseMove(e);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setShowTooltip(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || !isDragging) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - canvas.width / 2;
    const y = e.clientY - rect.top - canvas.width / 2;
    let newAngle = (Math.atan2(y, x) * 180) / Math.PI;
    if (newAngle < 0) newAngle += 360;
    setAngle(newAngle);
    onAngleChange(newAngle);
    const newColor = `hsl(${newAngle}, 100%, 50%)`;
    onColorSelect(newColor);
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="cursor-pointer"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseUp}
      />
      {showTooltip && (
        <div
          className="absolute bg-gray-900 text-white px-2 py-1 rounded text-sm whitespace-nowrap pointer-events-none"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y + 45,
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

const CircularPaletteModal: React.FC<CircularPaletteModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedColor, setSelectedColor] = useState("hsl(0, 100%, 50%)");
  const [currentAngle, setCurrentAngle] = useState(0);
  const [showCopied, setShowCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("wheel");
  const shades = generateShadesFromColor(selectedColor);

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
    <>
      <div className="fixed inset-0 bg-modal-backdrop backdrop-blur-modal z-modalBackdrop" />
      <div
        style={{ top: "var(--modal-top-offset)" }}
        className="fixed left-1/2 transform -translate-x-1/2 w-full max-w-modal mx-modal-sides z-modal"
      >
        <div className="bg-modal-light-bg dark:bg-modal-dark-bg rounded-modal shadow-modal max-h-[90vh] overflow-y-auto">
          <div className="relative p-6">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 hover:bg-modal-light-hover dark:hover:bg-modal-dark-hover rounded-lg transition-colors duration-modal"
              aria-label="Close modal"
            >
              &times;
            </button>
            <h2 className="text-modal-title font-bold mb-modal-gap">
              Choose Color
            </h2>

            <div className="flex flex-col items-center space-y-6">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="w-full">
                  <TabsTrigger value="wheel">Color Wheel</TabsTrigger>
                  <TabsTrigger value="tailwind">Tailwind Colors</TabsTrigger>
                  <TabsTrigger value="custom">Custom Palette</TabsTrigger>
                </TabsList>
                <TabsContent value="wheel">
                  <ColorWheel
                    onColorSelect={setSelectedColor}
                    selectedColor={selectedColor}
                    initialAngle={currentAngle}
                    onAngleChange={setCurrentAngle}
                  />
                </TabsContent>
                <TabsContent value="tailwind">
                  <TailwindPalette onColorSelect={setSelectedColor} />
                </TabsContent>
                <TabsContent value="custom">
                  <CustomPalette onColorSelect={setSelectedColor} />
                </TabsContent>
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
                      onClick={() => setSelectedColor(shade)}
                    >
                      <div
                        className="absolute inset-0 rounded"
                        style={{ backgroundColor: shade }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-modal-gap w-full">
                <Button variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
                <Button>Save Changes</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CircularPaletteModal;
