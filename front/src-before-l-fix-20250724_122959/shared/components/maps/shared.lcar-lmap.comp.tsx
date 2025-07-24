// File: src/shared/components/maps/shared.lcar-lmap.comp.tsx
// Last change: 2025-04-17
// English comment: Presentation component for rendering map, vehicles, points, and minimaps
import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import './shared.lcar-lmap.css';
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
  countriesData?: any;
  showMinimaps: boolean;
  onMouseDown?: (e: React.MouseEvent<hTMLCanvasElement>) => void;
  onMouseMove?: (e: React.MouseEvent<hTMLCanvasElement>) => void;
  onMouseUp?: () => void;
  onMouseLeave?: () => void;
  onGlobalMiniMapClick?: () => void;
  onTargetedMiniMapClick?: () => void;
  onWheel?: (e: React.WheelEvent<hTMLCanvasElement>) => void;
}

const CONFIG = {
  MINIMAP_WIDTH: 150,
  MINIMAP_HEIGHT: 150,
  PERFORMANCE_CLASS: 'high',
  PRELOAD_ADJACENT_ZOOM: true,
  DEBOUNCE_DELAY: 100, // Debounce delay for tile load triggers
};

const CarMap: React.FC<carMapProps> = ({
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
  const canvasRef = useRef<hTMLCanvasElement>(null);
  const globalMiniMapRef = useRef<hTMLCanvasElement>(null);
  const targetedMiniMapRef = useRef<hTMLCanvasElement>(null);
  const ctxRef = useRef<canvasRenderingContext2D | null>(null);
  const vehicleImagesRef = useRef<map<string, HTMLImageElement>>(new Map());
  const testImageRef = useRef<hTMLImageElement | null>(null);
  const renderTimeoutRef = useRef<number | null>(null);

  // Stabilize mapState
  const mapState = useMemo(() => ({ zoom, center, offsetX: 0, offsetY: 0, layer }), [zoom, center, layer]);

  // Stabilize dependencies
  const stableVehicles = useMemo(() => vehicles, [vehicles]);
  const stableCenter = useMemo(() => center, [center]);
  const stableImportantPoints = useMemo(() => importantPoints, [importantPoints]);
  const stableTargetPoint = useMemo(() => targetPoint, [targetPoint]);
  const stableCountriesData = useMemo(() => countriesData, [countriesData]);

  // Debounced tile load handler to prevent infinite loop
  const onTileLoad = useCallback(() => {
    if (renderTimeoutRef.current) {
      clearTimeout(renderTimeoutRef.current);
    }
    renderTimeoutRef.current = setTimeout(() => {
      console.log(`[CarMap:Debug:Render] Tile loaded`);
      canvasRef.current?.dispatchEvent(new Event('render'));
    }, CONFIG.DEBOUNCE_DELAY);
  }, []);

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
    // Namiesto dynamického načítavania
    console.log(`[CarMap:Debug:Image] Using imported image: ${lorryImage}`);
    const img = new Image();
    img.src = lorryImage; // Toto by už malo byť spracované URL od Vite
    testImageRef.current = img;
    img.onload = () => {
      console.log(`[CarMap:Debug:Image] Image ready`);
      canvasRef.current?.dispatchEvent(new Event('render'));
    };
    // Bez onerror handlera - použijeme už importovaný obrázok
    return () => {
      testImageRef.current = null;
    };
  }, []);

  // Preload vehicle images
  useEffect(() => {
    preloadVehicleImages(stableVehicles, vehicleImagesRef.current, () => {
      console.log(`[CarMap:Debug:Render] Vehicle images loaded`);
      canvasRef.current?.dispatchEvent(new Event('render')); // Trigger render
    });
  }, [stableVehicles]);

  // Preload adjacent zoom levels
  useEffect(() => {
    if (CONFIG.PRELOAD_ADJACENT_ZOOM) {
      const [lat, lon] = stableCenter;
      if (Math.ceil(zoom) !== zoom) {
        preloadTiles(Math.ceil(zoom), lat, lon, width, height, layer, onTileLoad);
      }
      if (Math.floor(zoom) !== zoom) {
        preloadTiles(Math.floor(zoom), lat, lon, width, height, layer, onTileLoad);
      }
    }
  }, [zoom, stableCenter, layer, width, height, onTileLoad]);

  // Render main canvas and minimaps
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const render = () => {
      const ctx = ctxRef.current;
      if (!ctx) {
        console.error(`[CarMap:Debug:Render] Canvas context missing`);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      if (layer === 'test' && testImageRef.current) {
        console.log(`[CarMap:Debug:Render] Drawing test image, timestamp: ${Date.now()}`);
        ctx.drawImage(testImageRef.current, 0, 0, width, height);
        console.log(`[CarMap:Debug:Render] Test layer: Static image drawn`);
      } else {
        drawTiles(ctx, width, height, mapState, onTileLoad);
        drawVehicles(ctx, width, height, mapState, stableVehicles, vehicleImagesRef.current);
        drawImportantPoints(ctx, width, height, mapState, stableImportantPoints);
        if (stableCountriesData) {
          drawCountries(ctx, width, height, mapState);
        }
        console.log(`[CarMap:Debug:Render] Rendered: tiles, vehicles=${stableVehicles.length}, points=${stableImportantPoints.length}`);
      }

      if (showMinimaps) {
        const globalCtx = globalMiniMapRef.current?.getContext('2d');
        if (globalCtx) {
          globalCtx.clearRect(0, 0, CONFIG.MINIMAP_WIDTH, CONFIG.MINIMAP_HEIGHT);
          drawTiles(globalCtx, CONFIG.MINIMAP_WIDTH, CONFIG.MINIMAP_HEIGHT, mapState, onTileLoad);
          drawVehicles(globalCtx, CONFIG.MINIMAP_WIDTH, CONFIG.MINIMAP_HEIGHT, mapState, stableVehicles, vehicleImagesRef.current);
          drawImportantPoints(globalCtx, CONFIG.MINIMAP_WIDTH, CONFIG.MINIMAP_HEIGHT, mapState, stableImportantPoints);
          if (stableCountriesData) {
            drawCountries(globalCtx, CONFIG.MINIMAP_WIDTH, CONFIG.MINIMAP_HEIGHT, mapState);
          }
          globalCtx.strokeStyle = viewMode === 'global' ? '#00F' : '#000';
          globalCtx.lineWidth = viewMode === 'global' ? 3 : 1;
          globalCtx.strokeRect(0, 0, CONFIG.MINIMAP_WIDTH, CONFIG.MINIMAP_HEIGHT);
        }

        const targetedCtx = targetedMiniMapRef.current?.getContext('2d');
        if (targetedCtx && stableTargetPoint) {
          targetedCtx.clearRect(0, 0, CONFIG.MINIMAP_WIDTH, CONFIG.MINIMAP_HEIGHT);
          const targetMapState: MapState = { ...mapState, center: [stableTargetPoint.lat, stableTargetPoint.lng] };
          drawTiles(targetedCtx, CONFIG.MINIMAP_WIDTH, CONFIG.MINIMAP_HEIGHT, targetMapState, onTileLoad);
          drawVehicles(targetedCtx, CONFIG.MINIMAP_WIDTH, CONFIG.MINIMAP_HEIGHT, targetMapState, stableVehicles, vehicleImagesRef.current);
          drawImportantPoints(targetedCtx, CONFIG.MINIMAP_WIDTH, CONFIG.MINIMAP_HEIGHT, targetMapState, stableImportantPoints);
          if (stableCountriesData) {
            drawCountries(targetedCtx, CONFIG.MINIMAP_WIDTH, CONFIG.MINIMAP_HEIGHT, targetMapState);
          }
          targetedCtx.strokeStyle = viewMode === 'targeted' ? '#00F' : '#000';
          targetedCtx.lineWidth = viewMode === 'targeted' ? 3 : 1;
          targetedCtx.strokeRect(0, 0, CONFIG.MINIMAP_WIDTH, CONFIG.MINIMAP_HEIGHT);
        }
      }
    };

    // Attach render handler
    canvas.addEventListener('render', render);
    render(); // Initial render

    return () => {
      canvas.removeEventListener('render', render);
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
      }
    };
  }, [stableVehicles, stableImportantPoints, width, height, layer, mapState, viewMode, stableTargetPoint, stableCountriesData, showMinimaps, onTileLoad]);

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
          {stableTargetPoint && (
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