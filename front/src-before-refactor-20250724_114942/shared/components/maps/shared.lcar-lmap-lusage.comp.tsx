// File: src/shared/components/maps/shared.lcar-lmap-lusage.comp.tsx
// Last change: 2025-04-17
// English comment: Container component for map logic, UI controls, and interactions
import React, { useState, useEffect, useCallback, useRef } from 'react';
import CarMap, { LayerType, ViewMode } from './CarMap';
import './shared.lcar-lmap-lusage.css';
import { useZoom } from './useZoom';
import { calculateGlobalView, calculateTargetedView, ViewState } from './ViewModes';
import { clearTileCache, addPriorityLocation, clearPriorityLocations } from './MapRenderer';
import { loadCountriesData } from './layers/CountriesLayer';
import lorryImage from '@/assets/lorry.webp';
import truckImage from '@/assets/truck.webp';
import vanImage from '@/assets/van.webp';

interface Vehicle {
  id: string;
  lat: number;
  lng: number;
  image: string;
  location: string;
}

interface ImportantPoint {
  lat: number;
  lng: number;
  type: 'pickup' | 'headquarters';
  label: string;
  priority: number;
}

interface DebugInfo {
  fps: number;
  tilesLoaded: number;
  renderTime: number;
  zoom: number;
}

const CONFIG = {
  DEFAULT_ZOOM: 5,
  DEFAULT_CENTER: [50.0, 11.0] as [number, number],
  SAVE_STATE: true,
  DOUBLE_RENDER_DELAY: 300,
  PAN_ACCUMULATOR_THRESHOLD: 0.5,
  DEBUG_MODE: true,
  AUTO_FIT_VEHICLES: true,
  STATE_STORAGE_PREFIX: 'map-state-',
  USE_SMOOTH_PANNING: true,
  SHOW_MINIMAPS: true,
  DEFAULT_IMPORTANT_POINTS: [
    { lat: 48.4499, lng: 12.3373, type: 'pickup' as const, label: 'Vilsbiburg', priority: 4 },
    { lat: 51.1079, lng: 17.0385, type: 'headquarters' as const, label: 'Wroclaw', priority: 5 },
  ],
};

const TEST_VEHICLES: Vehicle[] = [
  { id: 'lorry1', lat: 50.0755, lng: 14.4378, image: lorryImage, location: 'Prague' },
  { id: 'truck1', lat: 51.5136, lng: 7.4653, image: truckImage, location: 'Dortmund' },
  { id: 'van1', lat: 48.5734, lng: 7.7521, image: vanImage, location: 'Strasbourg' },
];

const CarMapUsage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(TEST_VEHICLES);
  const [importantPoints] = useState<ImportantPoint[]>(CONFIG.DEFAULT_IMPORTANT_POINTS);
  const [layer, setLayer] = useState<LayerType>('osm');
  const [viewState, setViewState] = useState<ViewState>({
    mode: 'current',
    center: CONFIG.DEFAULT_CENTER,
    zoom: CONFIG.DEFAULT_ZOOM,
  });
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({ fps: 0, tilesLoaded: 0, renderTime: 0, zoom: CONFIG.DEFAULT_ZOOM });
  const [countriesData, setCountriesData] = useState<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapStateRef = useRef<{ zoom: number; center: [number, number]; offsetX: number; offsetY: number }>({
    zoom: CONFIG.DEFAULT_ZOOM,
    center: CONFIG.DEFAULT_CENTER,
    offsetX: 0,
    offsetY: 0,
  });
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number } | null>(null);
  const panAccumulatorXRef = useRef<number>(0);
  const panAccumulatorYRef = useRef<number>(0);

  const instanceId = 'usage';
  const width = 1000;
  const height = 600;

  // Initialize map state
  useEffect(() => {
    if (CONFIG.SAVE_STATE) {
      const savedState = localStorage.getItem(`${CONFIG.STATE_STORAGE_PREFIX}${instanceId}`);
      if (savedState) {
        try {
          const state = JSON.parse(savedState) as { zoom: number; center: [number, number]; layer: LayerType };
          setViewState({ mode: 'current', center: state.center, zoom: state.zoom });
          setLayer(state.layer);
          mapStateRef.current = { zoom: state.zoom, center: state.center, offsetX: 0, offsetY: 0 };
          console.log(`[${instanceId}] Restored saved state: zoom=${state.zoom}, center=[${state.center}]`);
          return;
        } catch (e) {
          console.error(`[${instanceId}] Failed to parse saved state: ${e}`);
        }
      }
    }
    if (CONFIG.AUTO_FIT_VEHICLES) {
      const { center, zoom } = calculateOptimalView();
      setViewState({ mode: 'current', center, zoom });
      mapStateRef.current = { zoom, center, offsetX: 0, offsetY: 0 };
    }
  }, []);

  // Sync mapStateRef with viewState
  useEffect(() => {
    mapStateRef.current.zoom = viewState.zoom;
    mapStateRef.current.center = viewState.center;
  }, [viewState]);

  // Load countries data
  useEffect(() => {
    loadCountriesData().then((data) => setCountriesData(data));
  }, []);

  // Set priority locations
  useEffect(() => {
    clearPriorityLocations();
    importantPoints.forEach((point) => {
      addPriorityLocation({ lat: point.lat, lng: point.lng, priority: point.priority || 3 });
    });
  }, [importantPoints]);

  // Calculate FPS

  // Update tiles loaded

  // Save map state
  const saveMapState = useCallback(() => {
    if (!CONFIG.SAVE_STATE) return;
    try {
      const state = { zoom: viewState.zoom, center: viewState.center, layer };
      localStorage.setItem(`${CONFIG.STATE_STORAGE_PREFIX}${instanceId}`, JSON.stringify(state));
    } catch (e) {
      console.error(`[${instanceId}] Failed to save map state: ${e}`);
    }
  }, [viewState, layer]);

  // Calculate optimal view
  const calculateOptimalView = useCallback(() => {
    if (vehicles.length === 0) return { center: CONFIG.DEFAULT_CENTER, zoom: CONFIG.DEFAULT_ZOOM };
    const bounds = vehicles.reduce(
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
    return { center: [centerLat, centerLon] as [number, number], zoom };
  }, [vehicles]);

  // Handle layer change
  const handleLayerChange = useCallback((newLayer: LayerType) => {
    setLayer(newLayer);
    clearTileCache();
    setDebugInfo((prev: DebugInfo) => ({ ...prev, tilesLoaded: 0 }));
    saveMapState();
    console.log(`[${instanceId}] Switched to layer: ${newLayer}`);
  }, [saveMapState]);

  // Handle view mode change
  const handleViewModeChange = useCallback((mode: ViewMode) => {
    switch (mode) {
      case 'global':
        const globalView = calculateGlobalView([
          ...vehicles.map((v) => ({ lat: v.lat, lng: v.lng })),
          ...importantPoints,
        ]);
        setViewState({ mode: 'global', center: globalView.center, zoom: globalView.zoom });
        mapStateRef.current = { zoom: globalView.zoom, center: globalView.center, offsetX: 0, offsetY: 0 };
        break;
      case 'targeted':
        if (targetPoint) {
          const targetView = calculateTargetedView(targetPoint);
          setViewState({ mode: 'targeted', center: targetView.center, zoom: targetView.zoom });
          mapStateRef.current = { zoom: targetView.zoom, center: targetView.center, offsetX: 0, offsetY: 0 };
        }
        break;
      case 'current':
        setViewState((prev) => ({ ...prev, mode: 'current' }));
        break;
    }
    saveMapState();
  }, [vehicles, importantPoints, saveMapState]);

  // Drag handling
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    panAccumulatorXRef.current = 0;
    panAccumulatorYRef.current = 0;
    console.log(`[${instanceId}] Mouse down at x=${e.clientX}, y=${e.clientY}`);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current || !lastMousePosRef.current) return;
    const currentPos = { x: e.clientX, y: e.clientY };
    const deltaX = currentPos.x - lastMousePosRef.current.x;
    const deltaY = currentPos.y - lastMousePosRef.current.y;

    if (CONFIG.USE_SMOOTH_PANNING) {
      panAccumulatorXRef.current += deltaX;
      panAccumulatorYRef.current += deltaY;
      if (
        Math.abs(panAccumulatorXRef.current) > CONFIG.PAN_ACCUMULATOR_THRESHOLD ||
        Math.abs(panAccumulatorYRef.current) > CONFIG.PAN_ACCUMULATOR_THRESHOLD
      ) {
        setViewState((prev) => ({
          ...prev,
          center: [
            prev.center[0] - panAccumulatorYRef.current * 0.01 / prev.zoom,
            prev.center[1] - panAccumulatorXRef.current * 0.01 / prev.zoom,
          ],
        }));
        panAccumulatorXRef.current = 0;
        panAccumulatorYRef.current = 0;
      }
    } else {
      setViewState((prev) => ({
        ...prev,
        center: [
          prev.center[0] - deltaY * 0.01 / prev.zoom,
          prev.center[1] - deltaX * 0.01 / prev.zoom,
        ],
      }));
    }
    lastMousePosRef.current = currentPos;
  }, []);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    lastMousePosRef.current = null;
    if (
      CONFIG.USE_SMOOTH_PANNING &&
      (panAccumulatorXRef.current !== 0 || panAccumulatorYRef.current !== 0)
    ) {
      setViewState((prev) => ({
        ...prev,
        center: [
          prev.center[0] - panAccumulatorYRef.current * 0.01 / prev.zoom,
          prev.center[1] - panAccumulatorXRef.current * 0.01 / prev.zoom,
        ],
      }));
      panAccumulatorXRef.current = 0;
      panAccumulatorYRef.current = 0;
    }
    saveMapState();
  }, [saveMapState]);

  const handleMouseLeave = useCallback(() => {
    if (isDraggingRef.current) {
      handleMouseUp();
    }
    console.log(`[${instanceId}] Mouse leave`);
  }, [handleMouseUp]);

  // Zoom handling
  const zoomController = useZoom({
    mapStateRef,
    requestRender: () => {
      setViewState((prev) => ({ ...prev, zoom: mapStateRef.current.zoom }));
      setDebugInfo((prev: DebugInfo) => ({ ...prev, zoom: mapStateRef.current.zoom }));
    },
    instanceId,
    canvasRef,
    width,
    height,
  });

  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const delta = e.deltaY > 0 ? -0.5 : 0.5;
    zoomController.animateToZoom(viewState.zoom + delta, x, y);
  }, [viewState.zoom]);

  // Reset view
  const resetView = useCallback(() => {
    const { center, zoom } = calculateOptimalView();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = rect.width / 2;
      const y = rect.height / 2;
      setViewState({ mode: 'current', center, zoom });
      mapStateRef.current = { zoom, center, offsetX: 0, offsetY: 0 };
      zoomController.animateToZoom(zoom, x, y);
      setDebugInfo((prev: DebugInfo) => ({ ...prev, zoom }));
    } else {
      setViewState({ mode: 'current', center, zoom });
      mapStateRef.current = { zoom, center, offsetX: 0, offsetY: 0 };
      setDebugInfo((prev: DebugInfo) => ({ ...prev, zoom }));
    }
    saveMapState();
  }, [calculateOptimalView, saveMapState]);

  // Add vehicle
  const addVehicle = useCallback(() => {
    const randomLat = 48 + Math.random() * 4;
    const randomLng = 7 + Math.random() * 8;
    const newVehicle: Vehicle = {
      id: `veh-${Date.now()}`,
      lat: randomLat,
      lng: randomLng,
      image: vanImage,
      location: 'Random',
    };
    setVehicles((prev) => [...prev, newVehicle]);
  }, []);

  // Clear vehicles
  const clearVehicles = useCallback(() => {
    setVehicles([]);
  }, []);

  const targetPoint = importantPoints[0] ? { lat: importantPoints[0].lat, lng: importantPoints[0].lng } : undefined;

  // Render loop
  useEffect(() => {
   
    console.log("Map rendered once on mount");
    
    
    return () => {
      // Cleanup code
    };
  }, []);

  return (
    <div className="car-map-usage">
      <h2>Mapa vozidiel</h2>
      <div className="controls">
        <button onClick={addVehicle}>Pridať vozidlo</button>
        <button onClick={clearVehicles}>Vyčistiť</button>
        <button onClick={resetView}>Resetovať pohľad</button>
        <button
          onClick={() => {
            clearTileCache();
            setDebugInfo((prev: DebugInfo) => ({ ...prev, tilesLoaded: 0 }));
          }}
        >
          Clear Cache
        </button>
        <span>Počet vozidiel: {vehicles.length}</span>
      </div>
      <div className="layers">
        {(['simple', 'osm', 'satellite', 'test'] as LayerType[]).map((l) => (
          <button
            key={l}
            onClick={() => handleLayerChange(l)}
            disabled={layer === l}
            style={{
              padding: '8px 16px',
              background: layer === l ? '#007bff' : '#f8f9fa',
              color: layer === l ? '#fff' : '#000',
              cursor: layer === l ? 'default' : 'pointer',
              opacity: layer === l ? 1 : 0.5,
            }}
          >
            {l.charAt(0).toUpperCase() + l.slice(1)}
          </button>
        ))}
      </div>
      {CONFIG.DEBUG_MODE && (
        <div className="car-map__debug">
          <div className="car-map__debug-info">
            <div>FPS: {debugInfo.fps}</div>
            <div>Zoom: {debugInfo.zoom.toFixed(3)}</div>
            <div>Render: {debugInfo.renderTime}ms</div>
            <div>Tiles: {debugInfo.tilesLoaded}</div>
            <div>Vehicles: {vehicles.length}</div>
            <div>Mode: {viewState.mode}</div>
            <div>Layer: {layer}</div>
          </div>
          <div className="car-map__debug-controls">
            {(['current', 'global', ...(targetPoint ? ['targeted'] : [])] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                className={`car-map__mode-button ${viewState.mode === mode ? 'car-map__mode-button--active' : ''}`}
                onClick={() => handleViewModeChange(mode)}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}
      <CarMap
        vehicles={vehicles}
        importantPoints={importantPoints}
        width={width}
        height={height}
        layer={layer}
        center={viewState.center}
        zoom={viewState.zoom}
        viewMode={viewState.mode}
        targetPoint={targetPoint}
        countriesData={countriesData}
        showMinimaps={CONFIG.SHOW_MINIMAPS}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onGlobalMiniMapClick={() => handleViewModeChange('global')}
        onTargetedMiniMapClick={() => handleViewModeChange('targeted')}
        onWheel={handleWheel}
      />
      <div style={{ position: 'absolute', bottom: 10, right: 10, fontSize: '12px', zIndex: 10 }}>
        © OpenStreetMap contributors
      </div>
    </div>
  );
};

export default CarMapUsage;