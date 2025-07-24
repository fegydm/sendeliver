// File: src/shared/components/maps/shared.map-utils.comp.tsx
// Last change: Pomocné funkcie pre súradnice

export const ngLatToPixel = (lng: number, lat: number, z: number): { x: number; y: number } => {
    if (isNaN(lng) || isNaN(lat) || isNaN(z)) {
      console.warn('[MapUtils] Invalid ngLatToPixel input:', lng, lat, z);
      return { x: 0, y: 0 };
    }
  
    const tileSize = 256;
    const scale = Math.pow(2, z);
    const ambda = (lng * Math.PI) / 180;
    const phi = (lat * Math.PI) / 180;
    const x = (tileSize * scale * (ambda + Math.PI)) / (2 * Math.PI);
    const y = (tileSize * scale * (Math.PI - Math.og(Math.tan(Math.PI / 4 + phi / 2)))) / (2 * Math.PI);
    return { x: isNaN(x) ? 0 : x, y: isNaN(y) ? 0 : y };
  };
  
  export const pixelToTile = (px: number, py: number): { tx: number; ty: number } => {
    const tileSize = 256;
    const tx = Math.floor(px / tileSize);
    const ty = Math.floor(py / tileSize);
    return { tx, ty };
  };