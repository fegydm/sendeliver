// File: src/components/maps/CarMap.tsx
// Last change: Added zoom, throttled panning logs, changed tile provider to OSM

import React, { useState, useEffect, useRef } from 'react';
import './CarMap.css';
import { drawTiles, MapState } from './MapRenderer';
import { Vehicle, preloadVehicleImages, drawVehicles } from './VehicleRenderer';

import lorryImage from '@/assets/lorry.webp';
import truckImage from '@/assets/truck.webp';
import vanImage from '@/assets/van.webp';

interface CarMapProps {
  vehicles?: Vehicle[];
  width?: number;
  height?: number;
  initialZoom?: number;
  initialCenter?: [number, number];
  instanceId?: string;
}

const TEST_VEHICLES: Vehicle[] = [
  { id: 'lorry1', lat: 50.0755, lng: 14.4378, image: lorryImage, location: 'Prague' },
  { id: 'truck1', lat: 51.5136, lng: 7.4653, image: truckImage, location: 'Dortmund' },
  { id: 'van1', lat: 48.5734, lng: 7.7521, image: vanImage, location: 'Strasbourg' },
];

const CarMap: React.FC<CarMapProps> = ({
  vehicles,
  width = 800,
  height = 600,
  initialZoom = 5,
  initialCenter = [50.0, 11.0],
  instanceId = 'usage',
}) => {
  console.log(`[CarMap:${instanceId}] Raw vehicles:`, vehicles);
  const effectiveVehicles = vehicles && vehicles.length > 0 ? vehicles : TEST_VEHICLES;
  console.log(`[CarMap:${instanceId}] Effective vehicles:`, effectiveVehicles.length);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const mapStateRef = useRef<MapState>({
    zoom: initialZoom,
    center: initialCenter,
    offsetX: 0,
    offsetY: 0,
  });
  const tileCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const vehicleImagesRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const animationFrameRef = useRef<number | null>(null);
  const renderCountRef = useRef<number>(0);

  // State for mouse panning
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number } | null>(null);
  // Throttle for panning logs
  const lastLogTimeRef = useRef<number>(0);

  const initMap = () => {
    console.log(`[CarMap:${instanceId}] Init map, vehicles:`, effectiveVehicles.length);
    if (effectiveVehicles.length === 0) {
      mapStateRef.current.center = initialCenter;
      mapStateRef.current.zoom = initialZoom;
      console.log(`[CarMap:${instanceId}] No vehicles, using:`, initialCenter, initialZoom);
      return;
    }

    const bounds = effectiveVehicles.reduce(
      (acc, vehicle) => ({
        minLat: Math.min(acc.minLat, vehicle.lat),
        maxLat: Math.max(acc.maxLat, vehicle.lat),
        minLng: Math.min(acc.minLng, vehicle.lng),
        maxLng: Math.max(acc.maxLng, vehicle.lng),
      }),
      { minLat: Infinity, maxLat: -Infinity, minLng: Infinity, maxLng: -Infinity }
    );

    mapStateRef.current.center = [
      (bounds.minLat + bounds.maxLat) / 2,
      (bounds.minLng + bounds.maxLng) / 2,
    ];

    const latDiff = bounds.maxLat - bounds.minLat || 1;
    const lngDiff = bounds.maxLng - bounds.minLng || 1;

    const padding = 0.2;
    const bufferedLatDiff = latDiff * (1 + padding);
    const bufferedLngDiff = lngDiff * (1 + padding);

    const zoomLat = Math.log2((height * 360) / (bufferedLatDiff * 256));
    const zoomLng = Math.log2((width * 360) / (bufferedLngDiff * 256 * Math.cos((mapStateRef.current.center[0] * Math.PI) / 180)));

    mapStateRef.current.zoom = Math.max(3, Math.min(18, Math.floor(Math.min(zoomLat, zoomLng))));
    console.log(`[CarMap:${instanceId}] Center:`, mapStateRef.current.center, 'zoom:', mapStateRef.current.zoom);
  };

  const setupCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error(`[CarMap:${instanceId}] No canvas`);
      return false;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error(`[CarMap:${instanceId}] No context`);
      return false;
    }

    ctxRef.current = ctx;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    console.log(`[CarMap:${instanceId}] Canvas ready`);
    return true;
  };

  const render = () => {
    const ctx = ctxRef.current;
    if (!ctx) {
      console.error(`[CarMap:${instanceId}] No context`);
      return;
    }

    renderCountRef.current++;
    console.log(`[CarMap:${instanceId}] Render, count:`, renderCountRef.current, 'vehicles:', effectiveVehicles.length);

    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(0, 0, width, height);

    drawTiles(ctx, width, height, mapStateRef.current, tileCacheRef.current, () => {});
    drawVehicles(ctx, width, height, mapStateRef.current, effectiveVehicles, vehicleImagesRef.current);
  };

  const requestRender = () => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(() => {
      render();
      animationFrameRef.current = null;
    });
  };

  // Mouse event handlers for panning
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    console.log(`[CarMap:${instanceId}] Mouse down at:`, lastMousePosRef.current);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current || !lastMousePosRef.current) return;

    const currentPos = { x: e.clientX, y: e.clientY };
    const deltaX = currentPos.x - lastMousePosRef.current.x;
    const deltaY = currentPos.y - lastMousePosRef.current.y;

    mapStateRef.current.offsetX += deltaX;
    mapStateRef.current.offsetY += deltaY;

    lastMousePosRef.current = currentPos;

    // Throttle logging to once every 500ms
    const now = Date.now();
    if (now - lastLogTimeRef.current >= 500) {
      console.log(`[CarMap:${instanceId}] Panning - offsetX: ${mapStateRef.current.offsetX}, offsetY: ${mapStateRef.current.offsetY}`);
      lastLogTimeRef.current = now;
    }

    requestRender();
  };

  const handleMouseUp = () => {
    if (isDraggingRef.current) {
      console.log(`[CarMap:${instanceId}] Mouse up, panning stopped`);
    }
    isDraggingRef.current = false;
    lastMousePosRef.current = null;
  };

  const handleMouseLeave = () => {
    if (isDraggingRef.current) {
      console.log(`[CarMap:${instanceId}] Mouse left canvas, panning stopped`);
    }
    isDraggingRef.current = false;
    lastMousePosRef.current = null;
  };

  // Zoom handler
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomDelta = e.deltaY > 0 ? -1 : 1; // Scroll down: zoom out, scroll up: zoom in
    const newZoom = Math.max(3, Math.min(18, mapStateRef.current.zoom + zoomDelta));
    if (newZoom !== mapStateRef.current.zoom) {
      mapStateRef.current.zoom = newZoom;
      console.log(`[CarMap:${instanceId}] Zoom changed to:`, newZoom);
      requestRender();
    }
  };

  useEffect(() => {
    console.log(`[CarMap:${instanceId}] Effect`);
    const canvasInitialized = setupCanvas();
    if (!canvasInitialized) {
      console.error(`[CarMap:${instanceId}] Canvas failed`);
      return;
    }

    initMap();
    preloadVehicleImages(effectiveVehicles, vehicleImagesRef.current, requestRender);
    requestRender();

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [effectiveVehicles, width, height, instanceId]);

  useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = ctxRef.current;
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const cssWidth = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.width = cssWidth * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
      console.log(`[CarMap:${instanceId}] Resized:`, cssWidth);
      requestRender();
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [height, instanceId]);

  return (
    <div className="car-map" style={{ width: '100%', height: `${height}px`, position: 'relative' }}>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
      />
    </div>
  );
};

export default CarMap;