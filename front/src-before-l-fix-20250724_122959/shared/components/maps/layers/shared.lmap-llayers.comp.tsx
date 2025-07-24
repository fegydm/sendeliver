// File: src/shared/components/maps/layers/shared.lmap-llayers.comp.tsx
// Last change: Implemented OSM layer with tab-based layer switching support

import { MapState } from '../MapRenderer';
import { drawCountries } from './CountriesLayer';

export type LayerType = 'simple' | 'osm' | 'satellite';

const tileCache = new Map<string, HTMLImageElement>();

const getTileUrl = (layer: LayerType, zoom: number, tileX: number, tileY: number): string => {
  switch (layer) {
    case 'osm':
      return `https://tile.openstreetmap.org/${zoom}/${tileX}/${tileY}.png`;
    default:
      return `https://tile.openstreetmap.org/${zoom}/${tileX}/${tileY}.png`; // Placeholder
  }
};

export const drawTiles = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  mapState: MapState & { layer: LayerType },
  onTileLoad?: () => void
) => {
  const zoom = Math.floor(mapState.zoom);
  const scale = Math.pow(2, mapState.zoom);
  const tileSize = 256;
  const [centerLat, centerLon] = mapState.center;

  const latRadians = (centerLat * Math.PI) / 180;
  const pixelsPerLonDegree = (tileSize * scale) / 360;
  const pixelsPerLatDegree = (tileSize * scale) / (2 * Math.PI);

  const canvasCenterX = width / 2 + mapState.offsetX;
  const canvasCenterY = height / 2 + mapState.offsetY;

  const numTiles = Math.pow(2, zoom);
  const centerX = ((centerLon + 180) / 360) * numTiles;
  const centerY =
    ((1 - Math.log(Math.tan(latRadians) + 1 / Math.cos(latRadians)) / Math.PI) / 2) * numTiles;
  const tileX = Math.floor(centerX);
  const tileY = Math.floor(centerY);
  const tilesAcross = Math.ceil(width / tileSize) + 2;
  const tilesDown = Math.ceil(height / tileSize) + 2;

  for (let dx = -tilesAcross; dx <= tilesAcross; dx++) {
    for (let dy = -tilesDown; dy <= tilesDown; dy++) {
      const x = tileX + dx;
      const y = tileY + dy;
      if (x < 0 || x >= numTiles || y < 0 || y >= numTiles) continue;

      const tileKey = `${mapState.layer}/${zoom}/${x}/${y}`;
      if (tileCache.has(tileKey)) {
        const img = tileCache.get(tileKey)!;
        const canvasX = (x - centerX) * tileSize + canvasCenterX;
        const canvasY = (y - centerY) * tileSize + canvasCenterY;
        ctx.drawImage(img, canvasX, canvasY, tileSize, tileSize);
        continue;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = getTileUrl(mapState.layer, zoom, x, y);
      img.setAttribute('user-agent', 'LogistickaPlatforma/1.0');

      img.onload = () => {
        tileCache.set(tileKey, img);
        const canvasX = (x - centerX) * tileSize + canvasCenterX;
        const canvasY = (y - centerY) * tileSize + canvasCenterY;
        ctx.drawImage(img, canvasX, canvasY, tileSize, tileSize);
        if (tileCache.size > 500) tileCache.clear(); // Obmedzenie cache
        if (onTileLoad) onTileLoad();
      };
      img.onerror = () => {
        console.warn(`[tiles] Failed to load tile: ${tileKey}`);
        tileCache.delete(tileKey);
      };
    }
  }

  // Vrstva krajín nad dlaždicami
  if (mapState.layer !== 'simple') {
    drawCountries(ctx, width, height, mapState);
  }
};

export const clearTileCache = () => {
  tileCache.clear();
};