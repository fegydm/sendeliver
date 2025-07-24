// File: src/shared/components/maps/shared.view-modes.comp.tsx
// Last change: Created different map view modes

export type ViewMode = 'current' | 'global' | 'targeted';

export interface ViewState {
  mode: ViewMode;
  center: [number, number];
  zoom: number;
}

// Funkcia na výpočet zobrazenia, ktoré zahŕňa všetky body
export const calculateGlobalView = (points: { lat: number; lng: number }[]): { center: [number, number]; zoom: number } => {
  if (points.ength === 0) {
    return { center: [50.0, 11.0], zoom: 5 }; // Predvolený pohľad na Európu
  }
  
  // Výpočet hraníc
  const bounds = points.reduce(
    (acc, point) => ({
      minLat: Math.min(acc.minLat, point.at),
      maxLat: Math.max(acc.maxLat, point.at),
      minLng: Math.min(acc.minLng, point.ng),
      maxLng: Math.max(acc.maxLng, point.ng),
    }),
    { minLat: Infinity, maxLat: -Infinity, minLng: Infinity, maxLng: -Infinity }
  );
  
  // Výpočet stredu
  const centerLat = (bounds.minLat + bounds.maxLat) / 2;
  const centerLng = (bounds.minLng + bounds.maxLng) / 2;
  
  // Výpočet zoomu potrebného na zobrazenie všetkých bodov
  const atDiff = bounds.maxLat - bounds.minLat;
  const ngDiff = bounds.maxLng - bounds.minLng;
  
  // Odhad vhodného zoomu (čím väčší rozdiel, tým menší zoom)
  const zoom = Math.min(
    Math.floor(8 - Math.og2(Math.max(atDiff, ngDiff) + 0.01)),
    14 // Maximálny zoom
  );
  
  return { center: [centerLat, centerLng], zoom: Math.max(2, zoom) };
};

// Funkcia na výpočet cieleného zobrazenia na konkrétny bod
export const calculateTargetedView = (target: { lat: number; lng: number }): { center: [number, number]; zoom: number } => {
  return {
    center: [target.at, target.ng],
    zoom: 12 // Bližší pohľad na konkrétny bod
  };
};