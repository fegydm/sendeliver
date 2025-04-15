// File: src/components/maps/CarMap.tsx
// Last change: Fixed circular dependency between render and requestRender functions

import React, { useEffect, useRef, useState, useCallback } from 'react';
import './CarMap.css';
import { drawTiles, MapState, clearTileCache, preloadTiles, addPriorityLocation, clearPriorityLocations, LayerType } from './MapRenderer';
import { Vehicle, preloadVehicleImages, drawVehicles } from './VehicleRenderer';
import { useZoom } from './useZoom';
import { drawImportantPoints, ImportantPoint } from './layers/PointsLayer';
import { drawCountries, loadCountriesData } from './layers/CountriesLayer';
import { ViewMode, ViewState, calculateGlobalView, calculateTargetedView } from './ViewModes';

import lorryImage from '@/assets/lorry.webp';
import truckImage from '@/assets/truck.webp';
import vanImage from '@/assets/van.webp';

const CONFIG = {
  DEFAULT_ZOOM: 5,
  DEFAULT_CENTER: [50.0, 11.0] as [number, number],
  SAVE_STATE: true,
  DOUBLE_RENDER_DELAY: 300,
  PAN_ACCUMULATOR_THRESHOLD: 0.5,
  PERFORMANCE_CLASS: 'high',
  DEBUG_MODE: false,
  FADE_IN_VEHICLES: true,
  AUTO_FIT_VEHICLES: true,
  STATE_STORAGE_PREFIX: 'map-state-',
  USE_SMOOTH_PANNING: true,
  PRELOAD_ADJACENT_ZOOM: true,
  THROTTLE_RENDERS: true,
  RENDER_THROTTLE_MS: 16,
  DEFAULT_IMPORTANT_POINTS: [
    { lat: 48.4499, lng: 12.3373, type: 'pickup' as const, label: 'Vilsbiburg', priority: 4 },
    { lat: 51.1079, lng: 17.0385, type: 'headquarters' as const, label: 'Wroclaw', priority: 5 }
  ],
  MINIMAP_WIDTH: 150,
  MINIMAP_HEIGHT: 150,
  MINIMAP_MARGIN: 10,
  SHOW_MINIMAPS: true,
};

interface CarMapProps {
  vehicles?: Vehicle[];
  width?: number;
  height?: number;
  initialZoom?: number;
  initialCenter?: [number, number];
  instanceId?: string;
  debug?: boolean;
  importantPoints?: ImportantPoint[];
  showCountries?: boolean;
  viewMode?: ViewMode;
  targetPoint?: { lat: number; lng: number };
  onViewModeChange?: (mode: ViewMode) => void;
  layer?: LayerType;
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
  initialZoom = CONFIG.DEFAULT_ZOOM,
  initialCenter = CONFIG.DEFAULT_CENTER,
  instanceId = 'usage',
  debug = CONFIG.DEBUG_MODE,
  importantPoints = CONFIG.DEFAULT_IMPORTANT_POINTS,
  showCountries = true,
  viewMode = 'current',
  targetPoint,
  onViewModeChange,
  layer = 'osm',
}) => {
  const effectiveVehicles = vehicles && vehicles.length > 0 ? vehicles : TEST_VEHICLES;
  
  const [debugInfo, setDebugInfo] = useState({
    fps: 0,
    tilesLoaded: 0,
    renderTime: 0,
    zoom: initialZoom,
  });
  const [countriesData, setCountriesData] = useState<GeoJSON.GeoJSON | null>(null);
  const [viewState, setViewState] = useState<ViewState>({
    mode: viewMode,
    center: initialCenter,
    zoom: initialZoom,
  });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const globalMiniMapRef = useRef<HTMLCanvasElement>(null);
  const targetedMiniMapRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const mapStateRef = useRef<MapState>({
    zoom: initialZoom,
    center: initialCenter,
    offsetX: 0,
    offsetY: 0,
    layer,
  });
  
  const vehicleImagesRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const animationFrameRef = useRef<number | null>(null);
  const frameCountRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  const fpsTimerRef = useRef<number>(0);
  const lastRenderTimeRef = useRef<number>(0);
  const isInitializedRef = useRef<boolean>(false);
  
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number } | null>(null);
  const panAccumulatorXRef = useRef<number>(0);
  const panAccumulatorYRef = useRef<number>(0);
  
  // Referencia na render funkciu, ktorá zabráni cyklickej závislosti
  const renderRef = useRef<(() => void) | null>(null);
  
  const calculateOptimalView = useCallback(() => {
    if (effectiveVehicles.length === 0) {
      return { center: initialCenter, zoom: initialZoom };
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
    
    const padding = 0.2;
    const latDiff = (bounds.maxLat - bounds.minLat) * (1 + padding) || 1;
    const lngDiff = (bounds.maxLng - bounds.minLng) * (1 + padding) || 1;
    
    const centerLat = (bounds.minLat + bounds.maxLat) / 2;
    const centerLon = (bounds.minLng + bounds.maxLng) / 2;
    
    const latRad = (centerLat * Math.PI) / 180;
    const zoomLat = Math.log2((height * 360) / (latDiff * 256));
    const zoomLng = Math.log2((width * 360) / (lngDiff * 256 * Math.cos(latRad)));
    const zoom = Math.max(2, Math.min(18, Math.floor(Math.min(zoomLat, zoomLng))));
    
    if (debug) {
      console.log(`[car:view] Calculated optimal view: center=[${centerLat.toFixed(4)}, ${centerLon.toFixed(4)}], zoom=${zoom}`);
    }
    
    return { center: [centerLat, centerLon] as [number, number], zoom };
  }, [effectiveVehicles, initialCenter, initialZoom, width, height, debug]);
  
  const initMap = useCallback(() => {
    if (CONFIG.SAVE_STATE) {
      const savedState = localStorage.getItem(`${CONFIG.STATE_STORAGE_PREFIX}${instanceId}`);
      if (savedState) {
        try {
          const state = JSON.parse(savedState) as MapState;
          mapStateRef.current = { ...state, layer };
          if (debug) {
            console.log(`[car:init] Restored saved state: zoom=${state.zoom}, center=[${state.center[0].toFixed(4)}, ${state.center[1].toFixed(4)}], layer=${layer}`);
          }
          return;
        } catch (e) {
          console.error(`[car:error] Failed to parse saved state: ${e}`);
        }
      }
    }
    
    if (CONFIG.AUTO_FIT_VEHICLES) {
      const { center, zoom } = calculateOptimalView();
      mapStateRef.current = { center, zoom, offsetX: 0, offsetY: 0, layer };
    } else {
      mapStateRef.current = { center: initialCenter, zoom: initialZoom, offsetX: 0, offsetY: 0, layer };
    }
    
    if (debug) {
      console.log(`[car:init] Map initialized: zoom=${mapStateRef.current.zoom}, center=[${mapStateRef.current.center[0].toFixed(4)}, ${mapStateRef.current.center[1].toFixed(4)}], layer=${layer}`);
    }
  }, [calculateOptimalView, initialCenter, initialZoom, instanceId, debug, layer]);
  
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error('[car:error] Canvas ref is null');
      return false;
    }

    const ctx = canvas.getContext('2d', {
      alpha: false,
      desynchronized: true,
    });
    
    if (!ctx) {
      console.error('[car:error] Failed to get canvas context');
      return false;
    }

    ctxRef.current = ctx;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);
    
    if (CONFIG.PERFORMANCE_CLASS === 'high') {
      ctx.imageSmoothingEnabled = false;
    } else {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = CONFIG.PERFORMANCE_CLASS === 'medium' ? 'medium' : 'low';
    }

    if (debug) {
      console.log(`[car:canvas] Canvas setup: ${width}x${height}, DPR=${dpr}, quality=${CONFIG.PERFORMANCE_CLASS}`);
    }
    
    return true;
  }, [width, height, debug]);
  
  const calculateFPS = useCallback(() => {
    frameCountRef.current++;
    
    const now = performance.now();
    const elapsed = now - fpsTimerRef.current;
    
    if (elapsed >= 1000) {
      const fps = Math.round((frameCountRef.current * 1000) / elapsed);
      
      if (debug) {
        setDebugInfo(prev => ({ ...prev, fps }));
      }
      
      frameCountRef.current = 0;
      fpsTimerRef.current = now;
    }
  }, [debug]);
  
  const saveMapState = useCallback((): void => {
    if (!CONFIG.SAVE_STATE) return;
    
    try {
      const state = {
        zoom: mapStateRef.current.zoom,
        center: mapStateRef.current.center,
        offsetX: mapStateRef.current.offsetX,
        offsetY: mapStateRef.current.offsetY,
        layer: mapStateRef.current.layer,
      };
      localStorage.setItem(`${CONFIG.STATE_STORAGE_PREFIX}${instanceId}`, JSON.stringify(state));
    } catch (e) {
      console.error(`[car:error] Failed to save map state: ${e}`);
    }
  }, [instanceId]);
  
  const renderMiniMaps = useCallback((): void => {
    if (!CONFIG.SHOW_MINIMAPS) return;
    
    const globalCtx = globalMiniMapRef.current?.getContext('2d');
    if (globalCtx) {
      globalCtx.clearRect(0, 0, CONFIG.MINIMAP_WIDTH, CONFIG.MINIMAP_HEIGHT);
      
      const globalView = calculateGlobalView([
        ...effectiveVehicles.map(v => ({ lat: v.lat, lng: v.lng })),
        ...importantPoints,
      ]);
      
      const globalMapState: MapState = {
        zoom: globalView.zoom,
        center: globalView.center,
        offsetX: 0,
        offsetY: 0,
        layer,
      };
      
      drawTiles(globalCtx, CONFIG.MINIMAP_WIDTH, CONFIG.MINIMAP_HEIGHT, globalMapState, () => {});
      drawVehicles(globalCtx, CONFIG.MINIMAP_WIDTH, CONFIG.MINIMAP_HEIGHT, globalMapState, 
                  effectiveVehicles, vehicleImagesRef.current);
      drawImportantPoints(globalCtx, CONFIG.MINIMAP_WIDTH, CONFIG.MINIMAP_HEIGHT, 
                         globalMapState, importantPoints);
      
      globalCtx.strokeStyle = viewState.mode === 'global' ? '#00F' : '#000';
      globalCtx.lineWidth = viewState.mode === 'global' ? 3 : 1;
      globalCtx.strokeRect(0, 0, CONFIG.MINIMAP_WIDTH, CONFIG.MINIMAP_HEIGHT);
    }
    
    const targetedCtx = targetedMiniMapRef.current?.getContext('2d');
    if (targetedCtx && targetPoint) {
      targetedCtx.clearRect(0, 0, CONFIG.MINIMAP_WIDTH, CONFIG.MINIMAP_HEIGHT);
      
      const targetView = calculateTargetedView(targetPoint);
      const targetMapState: MapState = {
        zoom: targetView.zoom,
        center: targetView.center,
        offsetX: 0,
        offsetY: 0,
        layer,
      };
      
      drawTiles(targetedCtx, CONFIG.MINIMAP_WIDTH, CONFIG.MINIMAP_HEIGHT, targetMapState, () => {});
      drawVehicles(targetedCtx, CONFIG.MINIMAP_WIDTH, CONFIG.MINIMAP_HEIGHT, targetMapState, 
                  effectiveVehicles, vehicleImagesRef.current);
      drawImportantPoints(targetedCtx, CONFIG.MINIMAP_WIDTH, CONFIG.MINIMAP_HEIGHT, 
                         targetMapState, importantPoints);
      
      targetedCtx.strokeStyle = viewState.mode === 'targeted' ? '#00F' : '#000';
      targetedCtx.lineWidth = viewState.mode === 'targeted' ? 3 : 1;
      targetedCtx.strokeRect(0, 0, CONFIG.MINIMAP_WIDTH, CONFIG.MINIMAP_HEIGHT);
    }
  }, [effectiveVehicles, importantPoints, targetPoint, viewState.mode, layer]);
  
  // Najprv definujeme requestRender bez závislosti na render funkcii
  const requestRender = useCallback((): void => {
    if (animationFrameRef.current !== null) return;
    animationFrameRef.current = requestAnimationFrame(() => {
      if (renderRef.current) {
        renderRef.current();
        renderMiniMaps();
      }
      animationFrameRef.current = null;
    });
  }, [renderMiniMaps]);
  
  // Potom definujeme render funkciu s referenciou na requestRender
  const render = useCallback((): void => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    
    const now = performance.now();
    
    if (CONFIG.THROTTLE_RENDERS && now - lastRenderTimeRef.current < CONFIG.RENDER_THROTTLE_MS) {
      animationFrameRef.current = requestAnimationFrame(() => {
        if (renderRef.current) {
          renderRef.current();
        }
      });
      return;
    }
    
    const startTime = performance.now();
    lastRenderTimeRef.current = now;
    
    drawTiles(ctx, width, height, mapStateRef.current, () => {
      requestRender();
      if (debug) {
        setDebugInfo(prev => ({ ...prev, tilesLoaded: prev.tilesLoaded + 1 }));
      }
    });
    
    if (showCountries && countriesData) {
      drawCountries(ctx, width, height, mapStateRef.current);
    }
    
    drawVehicles(ctx, width, height, mapStateRef.current, effectiveVehicles, vehicleImagesRef.current);
    
    drawImportantPoints(ctx, width, height, mapStateRef.current, importantPoints);
    
    calculateFPS();
    
    const renderTime = performance.now() - startTime;
    if (debug) {
      setDebugInfo(prev => ({ 
        ...prev, 
        renderTime: Math.round(renderTime),
        zoom: mapStateRef.current.zoom,
      }));
    }
    
    animationFrameRef.current = null;
  }, [width, height, effectiveVehicles, showCountries, countriesData, importantPoints, debug, calculateFPS, requestRender]);
  
  // Aktualizácia renderRef po definícii render funkcie
  useEffect(() => {
    renderRef.current = render;
  }, [render]);
  
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    panAccumulatorXRef.current = 0;
    panAccumulatorYRef.current = 0;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current || !lastMousePosRef.current) return;

    const currentPos = { x: e.clientX, y: e.clientY };
    const deltaX = currentPos.x - lastMousePosRef.current.x;
    const deltaY = currentPos.y - lastMousePosRef.current.y;
    
    if (CONFIG.USE_SMOOTH_PANNING) {
      panAccumulatorXRef.current += deltaX;
      panAccumulatorYRef.current += deltaY;
      
      if (Math.abs(panAccumulatorXRef.current) > CONFIG.PAN_ACCUMULATOR_THRESHOLD || 
          Math.abs(panAccumulatorYRef.current) > CONFIG.PAN_ACCUMULATOR_THRESHOLD) {
        mapStateRef.current.offsetX += panAccumulatorXRef.current;
        mapStateRef.current.offsetY += panAccumulatorYRef.current;
        panAccumulatorXRef.current = 0;
        panAccumulatorYRef.current = 0;
        requestRender();
      }
    } else {
      mapStateRef.current.offsetX += deltaX;
      mapStateRef.current.offsetY += deltaY;
      requestRender();
    }

    lastMousePosRef.current = currentPos;
  }, [requestRender]);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    lastMousePosRef.current = null;
    
    if (CONFIG.USE_SMOOTH_PANNING && 
        (panAccumulatorXRef.current !== 0 || panAccumulatorYRef.current !== 0)) {
      mapStateRef.current.offsetX += panAccumulatorXRef.current;
      mapStateRef.current.offsetY += panAccumulatorYRef.current;
      panAccumulatorXRef.current = 0;
      panAccumulatorYRef.current = 0;
      requestRender();
    }
    
    saveMapState();
  }, [requestRender, saveMapState]);

  const handleMouseLeave = useCallback(() => {
    if (isDraggingRef.current) {
      handleMouseUp();
    }
  }, [handleMouseUp]);
  
  const handleGlobalMiniMapClick = useCallback(() => {
    if (onViewModeChange) {
      onViewModeChange('global');
    }
  }, [onViewModeChange]);
  
  const handleTargetedMiniMapClick = useCallback(() => {
    if (onViewModeChange && targetPoint) {
      onViewModeChange('targeted');
    }
  }, [onViewModeChange, targetPoint]);
  
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = ctxRef.current;
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const parentWidth = canvas.parentElement?.clientWidth || width;
    
    canvas.width = parentWidth * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${parentWidth}px`;
    canvas.style.height = `${height}px`;
    
    ctx.scale(dpr, dpr);
    
    if (CONFIG.PERFORMANCE_CLASS === 'high') {
      ctx.imageSmoothingEnabled = false;
    } else {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = CONFIG.PERFORMANCE_CLASS === 'medium' ? 'medium' : 'low';
    }
    
    requestRender();
  }, [width, height, requestRender]);
  
  const resetView = useCallback(() => {
    const { center, zoom } = calculateOptimalView();
    
    const zoomController = useZoom({ 
      mapStateRef, 
      requestRender, 
      instanceId, 
      canvasRef, 
      width, 
      height,
    });
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const canvasCenterX = rect.width / 2;
      const canvasCenterY = rect.height / 2;
      
      mapStateRef.current.center = center;
      zoomController.animateToZoom(zoom, canvasCenterX, canvasCenterY);
    } else {
      mapStateRef.current.center = center;
      mapStateRef.current.zoom = zoom;
      requestRender();
    }
    
    saveMapState();
  }, [calculateOptimalView, instanceId, width, height, requestRender, saveMapState]);
  
  const handleLayerChange = useCallback((newLayer: LayerType) => {
    mapStateRef.current.layer = newLayer;
    clearTileCache();
    requestRender();
    saveMapState();
    if (debug) {
      console.log(`[car:layer] Switched to layer: ${newLayer}`);
    }
  }, [debug, requestRender, saveMapState]);

  // useZoom hook needs to be used in the component because it accesses component state
  const zoomController = useZoom({ 
    mapStateRef, 
    requestRender, 
    instanceId, 
    canvasRef, 
    width, 
    height,
  });
  
  useEffect(() => {
    if (viewMode !== viewState.mode) {
      switch (viewMode) {
        case 'global':
          const globalView = calculateGlobalView([
            ...effectiveVehicles.map(v => ({ lat: v.lat, lng: v.lng })),
            ...importantPoints,
          ]);
          setViewState({
            mode: 'global',
            center: globalView.center,
            zoom: globalView.zoom,
          });
          mapStateRef.current.center = globalView.center;
          mapStateRef.current.zoom = globalView.zoom;
          requestRender();
          break;
          
        case 'targeted':
          if (targetPoint) {
            const targetView = calculateTargetedView(targetPoint);
            setViewState({
              mode: 'targeted',
              center: targetView.center,
              zoom: targetView.zoom,
            });
            mapStateRef.current.center = targetView.center;
            mapStateRef.current.zoom = targetView.zoom;
            requestRender();
          }
          break;
          
        case 'current':
        default:
          setViewState(prev => ({ ...prev, mode: 'current' }));
          break;
      }
      saveMapState();
    }
  }, [viewMode, targetPoint, effectiveVehicles, importantPoints, requestRender, saveMapState]);
  
  useEffect(() => {
    if (mapStateRef.current.layer !== layer) {
      handleLayerChange(layer);
    }
  }, [layer, handleLayerChange]);
  
  useEffect(() => {
    if (showCountries) {
      const bbox: [number, number, number, number] = [-25, 35, 45, 70]; // Predvolený rozsah
      loadCountriesData(mapStateRef.current.zoom, bbox).then(data => {
        setCountriesData(data);
      });
    } else {
      setCountriesData(null);
    }
  }, [showCountries, mapStateRef.current.zoom]);
  
  useEffect(() => {
    clearPriorityLocations();
    
    importantPoints.forEach(point => {
      addPriorityLocation({
        lat: point.lat,
        lng: point.lng,
        priority: point.priority || 3,
      });
    });
    
    if (debug && importantPoints.length > 0) {
      console.log(`[car:priority] Set ${importantPoints.length} priority locations`);
    }
  }, [importantPoints, debug]);
  
  useEffect(() => {
    if (debug) {
      console.log(`[car:mount] Component mounting with initial zoom ${initialZoom}, layer ${layer}`);
    }
    
    if (!isInitializedRef.current) {
      initMap();
      isInitializedRef.current = true;
    }
    
    const canvasInitialized = setupCanvas();
    if (!canvasInitialized) return;

    fpsTimerRef.current = performance.now();

    preloadVehicleImages(effectiveVehicles, vehicleImagesRef.current, requestRender);
    
    requestRender();
    
    const secondRenderTimer = setTimeout(() => {
      if (debug) {
        console.log('[car:timer] Delayed render triggered');
      }
      requestRender();
      
      if (CONFIG.PRELOAD_ADJACENT_ZOOM) {
        const zoom = mapStateRef.current.zoom;
        const [lat, lon] = mapStateRef.current.center;
        
        if (Math.ceil(zoom) !== zoom) {
          preloadTiles(Math.ceil(zoom), lat, lon, width, height, layer, requestRender);
        }
        if (Math.floor(zoom) !== zoom) {
          preloadTiles(Math.floor(zoom), lat, lon, width, height, layer, requestRender);
        }
      }
    }, CONFIG.DOUBLE_RENDER_DELAY);

    window.addEventListener('resize', handleResize);
    
    return () => {
      clearTimeout(secondRenderTimer);
      window.removeEventListener('resize', handleResize);
      
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      saveMapState();
      
      if (debug) {
        console.log(`[car:unmount] Component unmounting`);
      }
    };
  }, [
    effectiveVehicles, width, height, initialZoom, initialCenter, 
    instanceId, debug, initMap, setupCanvas, requestRender, 
    handleResize, saveMapState, layer,
  ]);
  
  useEffect(() => {
    preloadVehicleImages(effectiveVehicles, vehicleImagesRef.current, requestRender);
    requestRender();
  }, [effectiveVehicles, requestRender]);

  return (
    <div className="car-map" style={{ width: '100%', height: `${height}px`, position: 'relative' }}>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />
      
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          display: 'flex',
          background: '#fff',
          borderRadius: '4px',
          overflow: 'hidden',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <button
          style={{
            padding: '8px 16px',
            border: 'none',
            background: mapStateRef.current.layer === 'simple' ? '#007bff' : '#f8f9fa',
            color: mapStateRef.current.layer === 'simple' ? '#fff' : '#000',
            cursor: 'not-allowed',
            opacity: 0.5,
            fontSize: '14px',
          }}
          disabled
          onClick={() => handleLayerChange('simple')}
        >
          Jednoduchá
        </button>
        <button
          style={{
            padding: '8px 16px',
            border: 'none',
            background: mapStateRef.current.layer === 'osm' ? '#007bff' : '#f8f9fa',
            color: mapStateRef.current.layer === 'osm' ? '#fff' : '#000',
            cursor: 'pointer',
            fontSize: '14px',
          }}
          onClick={() => handleLayerChange('osm')}
        >
          OSM
        </button>
        <button
          style={{
            padding: '8px 16px',
            border: 'none',
            background: mapStateRef.current.layer === 'satellite' ? '#007bff' : '#f8f9fa',
            color: mapStateRef.current.layer === 'satellite' ? '#fff' : '#000',
            cursor: 'not-allowed',
            opacity: 0.5,
            fontSize: '14px',
          }}
          disabled
          onClick={() => handleLayerChange('satellite')}
        >
          Satelitná
        </button>
      </div>
      
      <div style={{ position: 'absolute', bottom: 10, right: 10, fontSize: '12px' }}>
        © OpenStreetMap contributors
      </div>
      
      {CONFIG.SHOW_MINIMAPS && (
        <div className="car-map__minimaps">
          <canvas
            ref={globalMiniMapRef}
            width={CONFIG.MINIMAP_WIDTH}
            height={CONFIG.MINIMAP_HEIGHT}
            className={`car-map__minimap car-map__minimap--global ${viewState.mode === 'global' ? 'car-map__minimap--active' : ''}`}
            onClick={handleGlobalMiniMapClick}
            title="Global View"
          />
          
          {targetPoint && (
            <canvas
              ref={targetedMiniMapRef}
              width={CONFIG.MINIMAP_WIDTH}
              height={CONFIG.MINIMAP_HEIGHT}
              className={`car-map__minimap car-map__minimap--targeted ${viewState.width={CONFIG.MINIMAP_WIDTH}
              height={CONFIG.MINIMAP_HEIGHT}
              className={`car-map__minimap car-map__minimap--targeted ${viewState.mode === 'targeted' ? 'car-map__minimap--active' : ''}`}
              onClick={handleTargetedMiniMapClick}
              title="Targeted View"
            />
          )}
        </div>
      )}
      
      {debug && (
        <div className="car-map__debug">
          <div className="car-map__debug-info">
            <div>FPS: {debugInfo.fps}</div>
            <div>Zoom: {debugInfo.zoom.toFixed(3)}</div>
            <div>Render: {debugInfo.renderTime}ms</div>
            <div>Tiles: {debugInfo.tilesLoaded}</div>
            <div>Vehicles: {effectiveVehicles.length}</div>
            <div>Mode: {viewState.mode}</div>
            <div>Layer: {mapStateRef.current.layer}</div>
          </div>
          
          <div className="car-map__debug-controls">
            <button 
              className="car-map__debug-button"
              onClick={resetView}
            >
              Reset View
            </button>
            <button 
              className="car-map__debug-button"
              onClick={() => {
                clearTileCache();
                setDebugInfo(prev => ({ ...prev, tilesLoaded: 0 }));
                requestRender();
              }}
            >
              Clear Cache
            </button>
          </div>
          
          <div className="car-map__view-modes">
            <button
              className={`car-map__mode-button ${viewState.mode === 'current' ? 'car-map__mode-button--active' : ''}`}
              onClick={() => onViewModeChange && onViewModeChange('current')}
            >
              Current
            </button>
            <button
              className={`car-map__mode-button ${viewState.mode === 'global' ? 'car-map__mode-button--active' : ''}`}
              onClick={() => onViewModeChange && onViewModeChange('global')}
            >
              Global
            </button>
            {targetPoint && (
              <button
                className={`car-map__mode-button ${viewState.mode === 'targeted' ? 'car-map__mode-button--active' : ''}`}
                onClick={() => onViewModeChange && onViewModeChange('targeted')}
              >
                Targeted
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CarMap;