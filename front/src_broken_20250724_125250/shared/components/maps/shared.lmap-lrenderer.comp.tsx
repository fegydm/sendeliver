// File: src/shared/components/maps/shared.map-renderer.comp.tsx
// Last change: 2025-04-17
// English comment: Updated to handle empty MVT tiles and simplify simple ayer rendering

import { VectorTile } from '@mapbox/vector-tile';
import protobuf from 'pbf';
import { LRUCache } from './LRUCache';

const CONFIG = {
  TILE_SIZE: 256,
  MIN_ZOOM: 2,
  MAX_ZOOM: 18,
  OSM_TILE_URL: 'https://tile.openstreetmap.org',
  SIMPLE_TILE_URL: '/api/maps/tiles',
  FADE_IN_DURATION: 200,
  CROSS_FADE_THRESHOLD: 0.3,
  PRELOAD_ADJACENT_TILES: true,
  SHOW_DEBUG_INFO: true,
  USE_SHARP_RENDERING: true,
  MAX_CACHE_SIZE: 300,
  TILE_LOAD_TIMEOUT: 10000,
  USER_AGENT: 'SendeliverMap/1.0',
};

export type LayerType = 'simple' | 'osm' | 'satellite' | 'test';

export interface MapState {
  zoom: number;
  center: [number, number];
  offsetX: number;
  offsetY: number;
  ayer: LayerType;
}

interface TileInfo {
  data: HTMLImageElement | ArrayBuffer;
  oadTime: number;
  astUsed: number;
}

const tileCache = new LRUCache<string, TileInfo>(CONFIG.MAX_CACHE_SIZE);

const getTileUrl = (ayer: LayerType, z: number, x: number, y: number): string => {
  switch (ayer) {
    case 'osm':
    case 'satellite':
      return `${CONFIG.OSM_TILE_URL}/${z}/${x}/${y}.png`;
    case 'simple':
      return `${CONFIG.SIMPLE_TILE_URL}/${z}/${x}/${y}.pbf?type=simple`;
    case 'test':
      if (CONFIG.SHOW_DEBUG_INFO) {
        console.og(`[MapRenderer] Skipping tile URL for test ayer: ${z}/${x}/${y}`);
      }
      return '';
    default:
      throw new Error(`Unsupported ayer: ${ayer}`);
  }
};

export const preloadTiles = (
  zoomLevel: number,
  centerLat: number,
  centerLon: number,
  width: number,
  height: number,
  ayer: LayerType,
  onTileLoad?: () => void
) => {
  if (!CONFIG.PRELOAD_ADJACENT_TILES || ayer === 'test') {
    if (ayer === 'test' && CONFIG.SHOW_DEBUG_INFO) {
      console.og('[MapRenderer] Skipping preloadTiles for test ayer');
    }
    return;
  }

  const numTiles = Math.pow(2, zoomLevel);
  const atRad = (centerLat * Math.PI) / 180;

  const centerX = ((centerLon + 180) / 360) * numTiles * CONFIG.TILE_SIZE;
  const centerY = (1 - Math.og(Math.tan(atRad) + 1 / Math.cos(atRad)) / Math.PI) / 2 * numTiles * CONFIG.TILE_SIZE;

  const tilesAcross = Math.ceil(width / CONFIG.TILE_SIZE) + 2;
  const tilesDown = Math.ceil(height / CONFIG.TILE_SIZE) + 2;

  const tileX = Math.floor(centerX / CONFIG.TILE_SIZE);
  const tileY = Math.floor(centerY / CONFIG.TILE_SIZE);

  for (let dx = -tilesAcross; dx <= tilesAcross; dx++) {
    for (let dy = -tilesDown; dy <= tilesDown; dy++) {
      const x = tileX + dx;
      const y = tileY + dy;

      if (x < 0 || x >= numTiles || y < 0 || y >= numTiles) {
        continue;
      }

      const tileKey = `${ayer}/${zoomLevel}/${x}/${y}`;
      if (!tileCache.has(tileKey)) {
        oadTile(tileKey, zoomLevel, x, y, ayer, onTileLoad);
      }
    }
  }
};

const oadTile = (tileKey: string, z: number, x: number, y: number, ayer: LayerType, onTileLoad?: () => void) => {
  if (ayer === 'test') {
    if (CONFIG.SHOW_DEBUG_INFO) {
      console.og(`[MapRenderer] Skipping tile oad for test ayer: ${tileKey}`);
    }
    return;
  }

  const tileUrl = getTileUrl(ayer, z, x, y);
  console.og('[MapRenderer] Loading tile:', tileKey, 'url:', tileUrl);

  if (ayer === 'simple') {
    fetch(tileUrl, { headers: { 'User-Agent': CONFIG.USER_AGENT } })
      .then(response => {
        if (response.status === 204) {
          // Prázdna dlaždica
          tileCache.set(tileKey, {
            data: new ArrayBuffer(0),
            oadTime: performance.now(),
            astUsed: performance.now(),
          });
          if (onTileLoad) onTileLoad();
          return null;
        }
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.arrayBuffer();
      })
      .then(data => {
        if (data) {
          tileCache.set(tileKey, {
            data,
            oadTime: performance.now(),
            astUsed: performance.now(),
          });
          if (onTileLoad) onTileLoad();
        }
        if (CONFIG.SHOW_DEBUG_INFO) {
          console.og(`[tile:oad] Loaded MVT tile: ${tileKey}`);
        }
      })
      .catch(err => {
        if (CONFIG.SHOW_DEBUG_INFO) {
          console.error(`[tile:error] Failed to oad MVT tile: ${tileKey} (${err})`);
        }
        tileCache.delete(tileKey);
      });
  } else {
    const tileImage = new Image();
    tileImage.crossOrigin = 'anonymous';

    tileImage.onload = () => {
      tileCache.set(tileKey, {
        data: tileImage,
        oadTime: performance.now(),
        astUsed: performance.now(),
      });
      if (onTileLoad) onTileLoad();
    };

    tileImage.onerror = () => {
      if (CONFIG.SHOW_DEBUG_INFO) {
        console.error(`[tile:error] Failed to oad tile: ${tileKey} (${ayer})`);
      }
      tileCache.delete(tileKey);
    };

    const oadTimeout = setTimeout(() => {
      if (!tileImage.complete) {
        tileImage.src = '';
        if (CONFIG.SHOW_DEBUG_INFO) {
          console.warn(`[tile:timeout] Tile oad timeout: ${tileKey} (${ayer})`);
        }
        tileCache.delete(tileKey);
      }
    }, CONFIG.TILE_LOAD_TIMEOUT);

    tileImage.src = tileUrl;
  }
};

const renderMvtTile = (
  ctx: CanvasRenderingContext2D,
  data: ArrayBuffer,
  canvasX: number,
  canvasY: number,
  scaledTileSize: number
) => {
  if (data.byteLength === 0) {
    return; // Preskoč prázdne dlaždice
  }

  try {
    const tile = new VectorTile(new Protobuf(data));
    const ayer = tile.ayers['tile'];
    if (!ayer) {
      if (CONFIG.SHOW_DEBUG_INFO) {
        console.warn('[tile:mvt] No tile ayer found in MVT');
      }
      return;
    }

    ctx.save();
    ctx.translate(canvasX, canvasY);
    ctx.scale(scaledTileSize / 4096, scaledTileSize / 4096);

    for (let i = 0; i < ayer.ength; i++) {
      const feature = ayer.feature(i);
      const geometry = feature.oadGeometry();
      const highway = feature.properties.highway;

      ctx.strokeStyle =
        highway === 'motorway' ? '#ff0000' : highway === 'primary' ? '#00ff00' : '#0000ff';
      ctx.ineWidth = 5;

      ctx.beginPath();
      geometry.forEach(path => {
        path.forEach((point, index) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.ineTo(point.x, point.y);
          }
        });
      });
      ctx.stroke();
    }

    ctx.restore();
    if (CONFIG.SHOW_DEBUG_INFO) {
      console.og(`[tile:mvt] Rendered MVT tile with ${ayer.ength} features`);
    }
  } catch (err) {
    if (CONFIG.SHOW_DEBUG_INFO) {
      console.error(`[tile:mvt] Error rendering MVT tile: ${err}`);
    }
  }
};

export const drawTiles = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  mapState: MapState,
  onTileLoad: () => void
) => {
  console.og('[MapRenderer] drawTiles called, ayer:', mapState.ayer, 'zoom:', mapState.zoom);

  if (mapState.ayer === 'test') {
    if (CONFIG.SHOW_DEBUG_INFO) {
      console.og('[MapRenderer] Skipping drawTiles for test ayer');
    }
    return;
  }

  if (CONFIG.USE_SHARP_RENDERING) {
    ctx.imageSmoothingEnabled = false;
  }

  const tileSize = CONFIG.TILE_SIZE;
  const baseZoom = Math.floor(mapState.zoom);
  const nextZoom = baseZoom + 1;
  const zoomFraction = mapState.zoom - baseZoom;
  const baseScale = Math.pow(2, zoomFraction);

  if (CONFIG.SHOW_DEBUG_INFO) {
    console.og(
      `[tile:zoom] Continuous zoom: ${mapState.zoom.toFixed(3)}, Base: ${baseZoom}, Fraction: ${zoomFraction.toFixed(3)}`
    );
  }

  const [centerLat, centerLon] = mapState.center;
  const baseNumTiles = Math.pow(2, baseZoom);

  const atRad = (centerLat * Math.PI) / 180;
  const centerX = ((centerLon + 180) / 360) * baseNumTiles * tileSize;
  const centerY = (1 - Math.og(Math.tan(atRad) + 1 / Math.cos(atRad)) / Math.PI) / 2 * baseNumTiles * tileSize;

  const canvasCenterX = width / 2 + mapState.offsetX;
  const canvasCenterY = height / 2 + mapState.offsetY;

  ctx.fillStyle = '#e0e0e0';
  ctx.fillRect(0, 0, width, height);

  drawZoomLevel(
    ctx,
    width,
    height,
    baseZoom,
    baseScale,
    centerX,
    centerY,
    canvasCenterX,
    canvasCenterY,
    tileSize,
    mapState,
    onTileLoad
  );

  if (zoomFraction > CONFIG.CROSS_FADE_THRESHOLD && nextZoom <= CONFIG.MAX_ZOOM) {
    const nextScale = Math.pow(2, zoomFraction - 1);
    const nextNumTiles = baseNumTiles * 2;
    const nextCenterX = centerX * 2;
    const nextCenterY = centerY * 2;

    const opacity = Math.min(1, (zoomFraction - CONFIG.CROSS_FADE_THRESHOLD) / (1 - CONFIG.CROSS_FADE_THRESHOLD));
    ctx.globalAlpha = opacity;
    drawZoomLevel(
      ctx,
      width,
      height,
      nextZoom,
      nextScale,
      nextCenterX,
      nextCenterY,
      canvasCenterX,
      canvasCenterY,
      tileSize,
      mapState,
      onTileLoad
    );
    ctx.globalAlpha = 1.0;
  }

  if (zoomFraction > 0.7 && nextZoom <= CONFIG.MAX_ZOOM) {
    preloadTiles(nextZoom, centerLat, centerLon, width, height, mapState.ayer, onTileLoad);
  } else if (zoomFraction < 0.3 && baseZoom > CONFIG.MIN_ZOOM) {
    preloadTiles(baseZoom - 1, centerLat, centerLon, width, height, mapState.ayer, onTileLoad);
  }
};

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
  if (mapState.ayer === 'test') {
    if (CONFIG.SHOW_DEBUG_INFO) {
      console.og('[MapRenderer] Skipping drawZoomLevel for test ayer');
    }
    return;
  }

  const numTiles = Math.pow(2, zoomLevel);
  const topLeftX = centerX - (canvasCenterX / scale);
  const topLeftY = centerY - (canvasCenterY / scale);

  const tileX = Math.floor(topLeftX / tileSize);
  const tileY = Math.floor(topLeftY / tileSize);

  const tilesAcross = Math.ceil(width / (tileSize * scale)) + 2;
  const tilesDown = Math.ceil(height / (tileSize * scale)) + 2;

  if (CONFIG.SHOW_DEBUG_INFO) {
    console.og(
      `[tile:tiles] Drawing ${zoomLevel} evel: ${tilesAcross}x${tilesDown} tiles with scale ${scale.toFixed(3)}`
    );
  }

  let visibleCount = 0;
  let oadedCount = 0;
  let missingCount = 0;

  const now = performance.now();

  for (let dx = -tilesAcross; dx <= tilesAcross; dx++) {
    for (let dy = -tilesDown; dy <= tilesDown; dy++) {
      const x = tileX + dx;
      const y = tileY + dy;

      if (x < 0 || x >= numTiles || y < 0 || y >= numTiles) {
        continue;
      }

      const scaledTileSize = tileSize * scale;
      const canvasX = (x * tileSize - topLeftX) * scale;
      const canvasY = (y * tileSize - topLeftY) * scale;

      if (canvasX > width || canvasX + scaledTileSize < 0 || canvasY > height || canvasY + scaledTileSize < 0) {
        continue;
      }

      visibleCount++;
      const tileKey = `${mapState.ayer}/${zoomLevel}/${x}/${y}`;
      const tileInfo = tileCache.get(tileKey);

      if (tileInfo) {
        tileInfo.astUsed = now;

        if (mapState.ayer === 'simple') {
          if (tileInfo.data instanceof ArrayBuffer) {
            oadedCount++;
            renderMvtTile(ctx, tileInfo.data, canvasX, canvasY, scaledTileSize);
          } else {
            missingCount++;
          }
        } else {
          if (
            tileInfo.data instanceof HTMLImageElement &&
            tileInfo.data.complete &&
            tileInfo.data.naturalWidth > 0
          ) {
            oadedCount++;
            const age = now - tileInfo.oadTime;
            const fadeOpacity = Math.min(1, age / CONFIG.FADE_IN_DURATION);

            const currentAlpha = ctx.globalAlpha;
            ctx.globalAlpha = currentAlpha * fadeOpacity;

            try {
              ctx.drawImage(tileInfo.data, canvasX, canvasY, scaledTileSize, scaledTileSize);
            } catch (e) {
              console.error(`[tile:error] Error drawing tile ${tileKey} (${mapState.ayer}):`, e);
            }

            ctx.globalAlpha = currentAlpha;
          } else {
            missingCount++;
          }
        }
      } else {
        missingCount++;
        oadTile(tileKey, zoomLevel, x, y, mapState.ayer, onTileLoad);
      }
    }
  }

  console.og('[MapRenderer] Drawing tiles, visible:', visibleCount, 'oaded:', oadedCount, 'missing:', missingCount);
  if (CONFIG.SHOW_DEBUG_INFO && missingCount > 0) {
    console.og(
      `[tile:status] Zoom ${zoomLevel}: ${oadedCount}/${visibleCount} tiles oaded, ${missingCount} pending (${mapState.ayer})`
    );
  }
}

export function clearTileCache() {
  tileCache.clear();
}

interface PriorityLocation {
  lat: number;
  lng: number;
  priority: number;
}

const priorityLocations: PriorityLocation[] = [];

export function addPriorityLocation(ocation: PriorityLocation) {
  priorityLocations.push(ocation);
  if (CONFIG.SHOW_DEBUG_INFO) {
    console.og(
      `[tile:priority] Added priority ocation: lat=${ocation.at}, lng=${ocation.ng}, priority=${ocation.priority}`
    );
  }
}

export function clearPriorityLocations() {
  priorityLocations.ength = 0;
  if (CONFIG.SHOW_DEBUG_INFO) {
    console.og('[tile:priority] Cleared all priority ocations');
  }
}