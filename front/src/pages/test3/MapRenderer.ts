// File: src/components/maps/MapRenderer.ts
// Last change: Changed tile provider to OpenStreetMap

import { lngLatToPixel, pixelToTile } from './MapUtils';

export interface MapState {
  zoom: number;
  center: [number, number];
  offsetX: number;
  offsetY: number;
}

export const drawTiles = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  mapState: MapState,
  tileCache: Map<string, HTMLImageElement>,
  setIsLoading: (loading: boolean) => void
) => {
  console.log('[MapRenderer] Drawing tiles');

  const tileSize = 256;
  const { zoom, center, offsetX, offsetY } = mapState;

  const centerPx = lngLatToPixel(center[1], center[0], zoom);
  const topLeftPx = {
    x: centerPx.x - width / 2 - offsetX,
    y: centerPx.y - height / 2 - offsetY,
  };

  const buffer = 1;
  const minTile = pixelToTile(topLeftPx.x - tileSize * buffer, topLeftPx.y - tileSize * buffer);
  const maxTile = pixelToTile(topLeftPx.x + width + tileSize * buffer, topLeftPx.y + height + tileSize * buffer);

  let pendingTiles = 0;

  for (let tx = minTile.tx; tx <= maxTile.tx; tx++) {
    for (let ty = minTile.ty; ty <= maxTile.ty; ty++) {
      if (tx < 0 || ty < 0 || tx >= Math.pow(2, zoom) || ty >= Math.pow(2, zoom)) continue;

      const tileKey = `${zoom}/${tx}/${ty}`;

      if (tileCache.has(tileKey)) {
        const img = tileCache.get(tileKey)!;
        const px = tx * tileSize - centerPx.x + width / 2 + offsetX;
        const py = ty * tileSize - centerPx.y + height / 2 + offsetY;
        ctx.drawImage(img, Math.round(px), Math.round(py), tileSize, tileSize);
        console.log('[MapRenderer] Cached tile drawn:', tileKey);
      } else {
        pendingTiles++;
        console.log('[MapRenderer] Loading tile:', tileKey, 'pending:', pendingTiles);
        const img = new Image();
        img.crossOrigin = 'anonymous';
        // Changed to OpenStreetMap tiles
        img.src = `https://tile.openstreetmap.org/${zoom}/${tx}/${ty}.png`;

        const tileTimeout = setTimeout(() => {
          pendingTiles--;
          console.log('[MapRenderer] Tile timeout:', tileKey, 'pending:', pendingTiles);
        }, 3000);

        img.onload = () => {
          clearTimeout(tileTimeout);
          pendingTiles--;
          tileCache.set(tileKey, img);
          console.log('[MapRenderer] Loaded tile:', tileKey, 'pending:', pendingTiles);
          const px = tx * tileSize - centerPx.x + width / 2 + offsetX;
          const py = ty * tileSize - centerPx.y + height / 2 + offsetY;
          ctx.drawImage(img, Math.round(px), Math.round(py), tileSize, tileSize);
        };

        img.onerror = () => {
          clearTimeout(tileTimeout);
          pendingTiles--;
          console.error('[MapRenderer] Tile load failed:', tileKey, 'pending:', pendingTiles);
        };
      }
    }
  }

  if (pendingTiles === 0) {
    console.log('[MapRenderer] No pending tiles initially');
  }
};