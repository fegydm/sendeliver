// File: WorldMap.tsx
// Description: React component for rendering a world map with WebGL, handling zoom and pan

import { useEffect, useRef, useState } from "react";
import { WebGLMapRenderer } from "./WebGLRenderer";

const W = 500;
const H = 400;

export default function WorldMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<WebGLMapRenderer | null>(null);
  const [zoom, setZoom] = useState(2); // Initial zoom level
  const [center, setCenter] = useState<[number, number]>([0, 0]); // Map center in lat/lng
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Initialize WebGL renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    rendererRef.current = new WebGLMapRenderer(canvas);
    rendererRef.current.setSize(W, H);

    return () => {
      rendererRef.current?.dispose();
    };
  }, []);

  // Register wheel event listener with passive: false
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const newZoom = zoom + (e.deltaY < 0 ? 1 : -1);
      if (newZoom >= 0 && newZoom <= 8) {
        console.log(`Zoom changed to: ${newZoom}, center=${center}`);
        setZoom(newZoom);
      } else {
        console.warn(`Zoom out of bounds: ${newZoom}`);
      }
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [zoom, center]);

  // Render map on zoom or center change
  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;

    console.log(`Rendering map: zoom=${zoom}, center=${center}`);
    renderer.render(center, zoom, W, H);
  }, [zoom, center]);

  // Handle mouse drag for panning
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    const scale = Math.pow(2, zoom);
    setCenter((prev) => [
      prev[0] - (dx / W) * 360 / scale,
      prev[1] + (dy / H) * 180 / scale,
    ]);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div>
      <h2>World Map with Boundaries (WebGL)</h2>
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
      />
      <div>Zoom: {zoom} | Use mouse wheel to zoom, drag to pan</div>
    </div>
  );
}