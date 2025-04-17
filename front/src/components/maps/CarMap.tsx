// front/src/components/maps/CarMap.tsx
// Last change: 2025-04-17
// English comment: Presentation component for rendering map, vehicles, points, and minimaps
import React, { useEffect, useRef } from 'react';
import './CarMap.css';
import { drawTiles, MapState, preloadTiles } from './MapRenderer';
import { Vehicle as VehicleType, preloadVehicleImages, drawVehicles } from './VehicleRenderer';
import { drawImportantPoints, ImportantPoint as ImportantPointType } from './layers/PointsLayer';
import { drawCountries } from './layers/CountriesLayer';
import lorryImage from '@/assets/lorry.webp';

export type LayerType = 'simple' | 'osm' | 'satellite' | 'test';
export type ViewMode = 'current' | 'global' | 'targeted';

export interface CarMapProps {
  vehicles: VehicleType[];
  importantPoints: ImportantPointType[];
  width: number;
  height: number;
  layer: LayerType;
  center: [number, number];
  zoom: number;
  viewMode: ViewMode;
  targetPoint?: { lat: number; lng: number };
  countriesData?: any; // Using any since GeoJSON is not exported
  showMinimaps: boolean;
  onMouseDown?: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseMove?: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseUp?: () => void;
  onMouseLeave?: () => void;
  onGlobalMiniMapClick?: () => void;
  onTargetedMiniMapClick?: () => void;
  onWheel?: (e: React.WheelEvent<HTMLCanvasElement>) => void;
}

const CONFIG = {
  MINIMAP_WIDTH: 150,
  MINIMAP_HEIGHT: 150,
  PERFORMANCE_CLASS: 'high',
  PRELOAD_ADJACENT_ZOOM: true,
};

const CarMap: React.FC<CarMapProps> = ({
  vehicles,
  importantPoints,
  width = 800,
  height = 600,
  layer = 'osm',
  center,
  zoom,
  viewMode,
  targetPoint,
  countriesData,
  showMinimaps,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseLeave,
  onGlobalMiniMapClick,
  onTargetedMiniMapClick,
  onWheel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const globalMiniMapRef = useRef<HTMLCanvasElement>(null);
  const targetedMiniMapRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const vehicleImagesRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const testImageRef = useRef<HTMLImageElement | null>(null);

  const mapState: MapState = { zoom, center, offsetX: 0, offsetY: 0, layer };

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error('[CarMap:Debug:Init] Canvas ref is null');
      return;
    }
    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    if (!ctx) {
      console.error('[CarMap:Debug:Init] Failed to get canvas context');
      return;
    }
    ctxRef.current = ctx;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = CONFIG.PERFORMANCE_CLASS === 'high' ? false : true;

    console.log(`[CarMap:Debug:Init] Canvas initialized: width=${canvas.width}, height=${canvas.height}, dpr=${dpr}`);
  }, [width, height]);

  // Load test image
  useEffect(() => {
    console.log(`[CarMap:Debug:Image] Starting test image load: ${lorryImage}`);
    const img = new Image();
    img.src = lorryImage;
    img.onload = () => {
      testImageRef.current = img;
      console.log(`[CarMap:Debug:Image] Test image loaded successfully: ${lorryImage}`);
    };
    img.onerror = () => {
      console.error(`[CarMap:Debug:Image] Test image failed to load: ${lorryImage}`);
      testImageRef.current = null;
    };
    fetch(lorryImage)
      .then((res) => console.log(`[CarMap:Debug:Image] Fetch check: ${lorryImage}, status: ${res.status}`))
      .catch((err) => console.error(`[CarMap:Debug:Image] Fetch check failed: ${lorryImage}, error:`, err));
    return () => {
      img.src = '';
      console.log(`[CarMap:Debug:Image] Cleaning up image load`);
    };
  }, []);

  // Preload vehicle images
  useEffect(() => {
    preloadVehicleImages(vehicles, vehicleImagesRef.current, () => {});
  }, [vehicles]);

  // Preload adjacent zoom levels
  useEffect(() => {
    if (CONFIG.PRELOAD_ADJACENT_ZOOM) {
      const [lat, lon] = center;
      if (Math.ceil(zoom) !== zoom) {
        preloadTiles(Math.ceil(zoom), lat, lon, width, height, layer, () => {});
      }
      if (Math.floor(zoom) !== zoom) {
        preloadTiles(Math.floor(zoom), lat, lon, width, height, layer, () => {});
      }
    }
  }, [zoom, center, layer, width, height]);

  // Render main canvas and minimaps
  useEffect(() => {
    const ctx = ctxRef.current;
    if (!ctx) {
      console.error(`[CarMap:Debug:Render] Canvas context missing`);
      return;
    }

    ctx.clearRect(0, 0, width, height);

    if (layer === 'test' && testImageRef.current) {
      ctx.drawImage(testImageRef.current, 0, 0, width, height);
      console.log(`[CarMap:Debug:Render] Test layer: Static image drawn`);
    } else {
      drawTiles(ctx, width, height, mapState, () => {
        console.log(`[CarMap:Debug:Render] Tile loaded`);
      });
      drawVehicles(ctx, width, height, mapState, vehicles, vehicleImagesRef.current);
      drawImportantPoints(ctx, width, height, mapState, importantPoints);
      if (countriesData) {
        drawCountries(ctx, width, height, mapState);
      }
      console.log(`[CarMap:Debug:Render] Rendered: tiles, vehicles=${vehicles.length}, points=${importantPoints.length}`);
    }

    if (showMinimaps) {
      const globalCtx = globalMiniMapRef.current?.getContext('2d');
      if (globalCtx) {
        globalCtx.clearRect(0, 0, CONFIG.MINIMAP_WIDTH, CONFIG.MINIMAP_HEIGHT);
        drawTiles(globalCtx, CONFIG.MINIMAP_WIDTH, CONFIG.MINIMAP_HEIGHT, mapState, () => {});
        drawVehicles(globalCtx, CONFIG.MINIMAP_WIDTH, CONFIG.MINIMAP_HEIGHT, mapState, vehicles, vehicleImagesRef.current);
        drawImportantPoints(globalCtx, CONFIG.MINIMAP_WIDTH, CONFIG.MINIMAP_HEIGHT, mapState, importantPoints);
        if (countriesData) {
          drawCountries(globalCtx, CONFIG.MINIMAP_WIDTH, CONFIG.MINIMAP_HEIGHT, mapState);
        }
        globalCtx.strokeStyle = viewMode === 'global' ? '#00F' : '#000';
        globalCtx.lineWidth = viewMode === 'global' ? 3 : 1;
        globalCtx.strokeRect(0, 0, CONFIG.MINIMAP_WIDTH, CONFIG.MINIMAP_HEIGHT);
      }

      const targetedCtx = targetedMiniMapRef.current?.getContext('2d');
      if (targetedCtx && targetPoint) {
        targetedCtx.clearRect(0, 0, CONFIG.MINIMAP_WIDTH, CONFIG.MINIMAP_HEIGHT);
        const targetMapState: MapState = { ...mapState, center: [targetPoint.lat, targetPoint.lng] };
        drawTiles(targetedCtx, CONFIG.MINIMAP_WIDTH, CONFIG.MINIMAP_HEIGHT, targetMapState, () => {});
        drawVehicles(targetedCtx, CONFIG.MINIMAP_WIDTH, CONFIG.MINIMAP_HEIGHT, targetMapState, vehicles, vehicleImagesRef.current);
        drawImportantPoints(targetedCtx, CONFIG.MINIMAP_WIDTH, CONFIG.MINIMAP_HEIGHT, targetMapState, importantPoints);
        if (countriesData) {
          drawCountries(targetedCtx, CONFIG.MINIMAP_WIDTH, CONFIG.MINIMAP_HEIGHT, targetMapState);
        }
        targetedCtx.strokeStyle = viewMode === 'targeted' ? '#00F' : '#000';
        targetedCtx.lineWidth = viewMode === 'targeted' ? 3 : 1;
        targetedCtx.strokeRect(0, 0, CONFIG.MINIMAP_WIDTH, CONFIG.MINIMAP_HEIGHT);
      }
    }
  }, [vehicles, importantPoints, width, height, layer, center, zoom, viewMode, targetPoint, countriesData, showMinimaps]);

  return (
    <div className="car-map" style={{ width: '100%', height: `${height}px`, position: 'relative' }}>
      <canvas
        ref={canvasRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onWheel={onWheel}
      />
      {showMinimaps && (
        <div className="car-map__minimaps">
          <canvas
            ref={globalMiniMapRef}
            width={CONFIG.MINIMAP_WIDTH}
            height={CONFIG.MINIMAP_HEIGHT}
            className={`car-map__minimap car-map__minimap--global ${viewMode === 'global' ? 'car-map__minimap--active' : ''}`}
            onClick={onGlobalMiniMapClick}
            title="Global View"
          />
          {targetPoint && (
            <canvas
              ref={targetedMiniMapRef}
              width={CONFIG.MINIMAP_WIDTH}
              height={CONFIG.MINIMAP_HEIGHT}
              className={`car-map__minimap car-map__minimap--targeted ${viewMode === 'targeted' ? 'car-map__minimap--active' : ''}`}
              onClick={onTargetedMiniMapClick}
              title="Targeted View"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default CarMap;