// File: src/components/maps/MapRenderer.ts
// Last change: Enhanced OSM layer with layer switching support and improved error handling

import { LRUCache } from './LRUCache';

// Configurable options at the beginning
const CONFIG = {
  TILE_SIZE: 256,                  // Standard OSM tile size in pixels
  MIN_ZOOM: 2,                     // Minimum zoom level
  MAX_ZOOM: 18,                    // Maximum zoom level
  OSM_TILE_URL: 'https://tile.openstreetmap.org', // Tile server URL
  FADE_IN_DURATION: 200,           // Tile fade-in animation duration in ms
  CROSS_FADE_THRESHOLD: 0.3,       // When to start showing tiles from next zoom level (0.3 = 30%)
  PRELOAD_ADJACENT_TILES: true,    // Whether to preload tiles just outside viewport
  SHOW_DEBUG_INFO: false,          // Log debug information
  USE_SHARP_RENDERING: true,       // Use sharp (pixelated) rendering for tiles
  MAX_CACHE_SIZE: 300,             // Maximum number of tiles to keep in memory
  TILE_LOAD_TIMEOUT: 10000,        // Timeout for tile loading in ms
  USER_AGENT: 'SendeliverMap/1.0', // Added for OSM compliance
};

// Types
export type LayerType = 'simple' | 'osm' | 'satellite';

export interface MapState {
  zoom: number;                   // Continuous zoom value (can be fractional)
  center: [number, number];       // [latitude, longitude]
  offsetX: number;                // Panning offset X
  offsetY: number;                // Panning offset Y
  layer: LayerType;               // Added for layer switching
}

interface TileInfo {
  image: HTMLImageElement;
  loadTime: number;
  lastUsed: number;
}

// Create LRU cache for tiles
const tileCache = new LRUCache<string, TileInfo>(CONFIG.MAX_CACHE_SIZE);

// Get tile URL based on layer
const getTileUrl = (layer: LayerType, z: number, x: number, y: number): string => {
  switch (layer) {
    case 'osm':
      return `${CONFIG.OSM_TILE_URL}/${z}/${x}/${y}.png`;
    default:
      return `${CONFIG.OSM_TILE_URL}/${z}/${x}/${y}.png`; // Placeholder for simple, satellite
  }
};

// Preload tiles for given zoom level and viewpoint
export const preloadTiles = (
  zoomLevel: number,
  centerLat: number,
  centerLon: number,
  width: number,
  height: number,
  layer: LayerType,
  onTileLoad?: () => void
) => {
  if (!CONFIG.PRELOAD_ADJACENT_TILES) return;

  const numTiles = Math.pow(2, zoomLevel);
  const latRad = (centerLat * Math.PI) / 180;

  // Convert center latitude and longitude to tile coordinates
  const centerX = ((centerLon + 180) / 360) * numTiles * CONFIG.TILE_SIZE;
  const centerY = (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * numTiles * CONFIG.TILE_SIZE;

  // Calculate which tiles might be needed soon
  const tilesAcross = Math.ceil(width / CONFIG.TILE_SIZE) + 2;
  const tilesDown = Math.ceil(height / CONFIG.TILE_SIZE) + 2;

  const tileX = Math.floor(centerX / CONFIG.TILE_SIZE);
  const tileY = Math.floor(centerY / CONFIG.TILE_SIZE);

  // For adjacent tiles - load with lower priority
  for (let dx = -tilesAcross; dx <= tilesAcross; dx++) {
    for (let dy = -tilesDown; dy <= tilesDown; dy++) {
      const x = tileX + dx;
      const y = tileY + dy;

      // Ensure tile coordinates are within bounds
      if (x < 0 || x >= numTiles || y < 0 || y >= numTiles) {
        continue;
      }

      const tileKey = `${layer}/${zoomLevel}/${x}/${y}`;

      // Only preload if not already in cache
      if (!tileCache.has(tileKey)) {
        loadTile(tileKey, zoomLevel, x, y, layer, onTileLoad);
      }
    }
  }
};

// Load a single tile
const loadTile = (tileKey: string, z: number, x: number, y: number, layer: LayerType, onTileLoad?: () => void) => {
  const tileImage = new Image();
  tileImage.crossOrigin = 'anonymous';

  // Set up load handler
  tileImage.onload = () => {
    tileCache.set(tileKey, {
      image: tileImage,
      loadTime: performance.now(),
      lastUsed: performance.now(),
    });

    if (onTileLoad) onTileLoad();
  };

  tileImage.onerror = () => {
    if (CONFIG.SHOW_DEBUG_INFO) {
      console.error(`[tile:error] Failed to load tile: ${tileKey} (${layer})`);
    }
    tileCache.delete(tileKey);
  };

  // Set timeout to prevent hanging
  const loadTimeout = setTimeout(() => {
    if (!tileImage.complete) {
      tileImage.src = ''; // Cancel request
      if (CONFIG.SHOW_DEBUG_INFO) {
        console.warn(`[tile:timeout] Tile load timeout: ${tileKey} (${layer})`);
      }
      tileCache.delete(tileKey);
    }
  }, CONFIG.TILE_LOAD_TIMEOUT);

  // Set source with User-Agent
  tileImage.src = getTileUrl(layer, z, x, y);
  tileImage.setAttribute('user-agent', CONFIG.USER_AGENT);
};

// Main drawing function
export const drawTiles = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  mapState: MapState,
  onTileLoad: () => void
) => {
  // Set rendering quality
  if (CONFIG.USE_SHARP_RENDERING) {
    ctx.imageSmoothingEnabled = false;
  }

  const tileSize = CONFIG.TILE_SIZE;

  // Get the base tile zoom level
  const baseZoom = Math.floor(mapState.zoom);
  const nextZoom = baseZoom + 1;

  // Fractional part for scaling
  const zoomFraction = mapState.zoom - baseZoom;
  const baseScale = Math.pow(2, zoomFraction);

  if (CONFIG.SHOW_DEBUG_INFO) {
    console.log(`[tile:zoom] Continuous zoom: ${mapState.zoom.toFixed(3)}, Base: ${baseZoom}, Fraction: ${zoomFraction.toFixed(3)}`);
  }

  const [centerLat, centerLon] = mapState.center;

  // Calculate number of tiles
  const baseNumTiles = Math.pow(2, baseZoom);

  // Convert center to tile coordinates
  const latRad = (centerLat * Math.PI) / 180;
  const centerX = ((centerLon + 180) / 360) * baseNumTiles * tileSize;
  const centerY = (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * baseNumTiles * tileSize;

  const canvasCenterX = width / 2 + mapState.offsetX;
  const canvasCenterY = height / 2 + mapState.offsetY;

  // Clear background
  ctx.fillStyle = '#e0e0e0';
  ctx.fillRect(0, 0, width, height);

  // Draw base zoom tiles
  drawZoomLevel(ctx, width, height, baseZoom, baseScale, centerX, centerY, canvasCenterX, canvasCenterY, tileSize, mapState, onTileLoad);

  // Draw next zoom level if needed
  if (zoomFraction > CONFIG.CROSS_FADE_THRESHOLD && nextZoom <= CONFIG.MAX_ZOOM) {
    const nextScale = Math.pow(2, zoomFraction - 1);
    const nextNumTiles = baseNumTiles * 2;
    const nextCenterX = centerX * 2;
    const nextCenterY = centerY * 2;

    const opacity = Math.min(1, (zoomFraction - CONFIG.CROSS_FADE_THRESHOLD) / (1 - CONFIG.CROSS_FADE_THRESHOLD));
    ctx.globalAlpha = opacity;
    drawZoomLevel(ctx, width, height, nextZoom, nextScale, nextCenterX, nextCenterY, canvasCenterX, canvasCenterY, tileSize, mapState, onTileLoad);
    ctx.globalAlpha = 1.0;
  }

  // Preload adjacent zoom levels
  if (zoomFraction > 0.7 && nextZoom <= CONFIG.MAX_ZOOM) {
    preloadTiles(nextZoom, centerLat, centerLon, width, height, mapState.layer, onTileLoad);
  } else if (zoomFraction < 0.3 && baseZoom > CONFIG.MIN_ZOOM) {
    preloadTiles(baseZoom - 1, centerLat, centerLon, width, height, mapState.layer, onTileLoad);
  }
};

// Helper function to draw tiles for a specific zoom level
function drawZoomLevel(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  zoomLevel: number,
  scale: number,
  centerX: number,
  centerY: number,
  canvasCenterX: number,
  canvasCenterY: number,
  tileSize: number,
  mapState: MapState,
  onTileLoad: () => void
) {
  const numTiles = Math.pow(2, zoomLevel);

  // Calculate top-left corner in tile coordinates
  const topLeftX = centerX - (canvasCenterX / scale);
  const topLeftY = centerY - (canvasCenterY / scale);

  const tileX = Math.floor(topLeftX / tileSize);
  const tileY = Math.floor(topLeftY / tileSize);

  // Calculate tiles to load
  const tilesAcross = Math.ceil(width / (tileSize * scale)) + 2;
  const tilesDown = Math.ceil(height / (tileSize * scale)) + 2;

  if (CONFIG.SHOW_DEBUG_INFO) {
    console.log(`[tile:tiles] Drawing ${zoomLevel} level: ${tilesAcross}x${tilesDown} tiles with scale ${scale.toFixed(3)}`);
  }

  let visibleCount = 0;
  let loadedCount = 0;
  let missingCount = 0;

  const now = performance.now();

  for (let dx = -tilesAcross; dx <= tilesAcross; dx++) {
    for (let dy = -tilesDown; dy <= tilesDown; dy++) {
      const x = tileX + dx;
      const y = tileY + dy;

      // Ensure tile coordinates are within bounds
      if (x < 0 || x >= numTiles || y < 0 || y >= numTiles) {
        continue;
      }

      // Calculate position on canvas
      const scaledTileSize = tileSize * scale;
      const canvasX = (x * tileSize - topLeftX) * scale;
      const canvasY = (y * tileSize - topLeftY) * scale;

      // Skip non-visible tiles
      if (canvasX > width || canvasX + scaledTileSize < 0 || canvasY > height || canvasY + scaledTileSize < 0) {
        continue;
      }

      visibleCount++;
      const tileKey = `${mapState.layer}/${zoomLevel}/${x}/${y}`;
      const tileInfo = tileCache.get(tileKey);

      if (tileInfo) {
        tileInfo.lastUsed = now;

        if (tileInfo.image.complete && tileInfo.image.naturalWidth > 0) {
          loadedCount++;
          const age = now - tileInfo.loadTime;
          const fadeOpacity = Math.min(1, age / CONFIG.FADE_IN_DURATION);

          const currentAlpha = ctx.globalAlpha;
          ctx.globalAlpha = currentAlpha * fadeOpacity;

          try {
            ctx.drawImage(tileInfo.image, canvasX, canvasY, scaledTileSize, scaledTileSize);
          } catch (e) {
            console.error(`[tile:error] Error drawing tile ${tileKey} (${mapState.layer}):`, e);
          }

          ctx.globalAlpha = currentAlpha;
        } else {
          missingCount++;
        }
      } else {
        missingCount++;
        loadTile(tileKey, zoomLevel, x, y, mapState.layer, onTileLoad);
      }
    }
  }

  if (CONFIG.SHOW_DEBUG_INFO && missingCount > 0) {
    console.log(`[tile:status] Zoom ${zoomLevel}: ${loadedCount}/${visibleCount} tiles loaded, ${missingCount} pending (${mapState.layer})`);
  }
}

export function clearTileCache() {
  tileCache.clear();
}

// Priority locations storage
interface PriorityLocation {
  lat: number;
  lng: number;
  priority: number;
}

const priorityLocations: PriorityLocation[] = [];

// Add a priority location
export function addPriorityLocation(location: PriorityLocation) {
  priorityLocations.push(location);
  if (CONFIG.SHOW_DEBUG_INFO) {
    console.log(`[tile:priority] Added priority location: lat=${location.lat}, lng=${location.lng}, priority=${location.priority}`);
  }
}

// Clear all priority locations
export function clearPriorityLocations() {
  priorityLocations.length = 0;
  if (CONFIG.SHOW_DEBUG_INFO) {
    console.log('[tile:priority] Cleared all priority locations');
  }
}