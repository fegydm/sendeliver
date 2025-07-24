// File: src/shared/components/maps/ayers/shared.countries-ayer.comp.tsx
// Last change: Fixed variable naming to avoid conflicts with global URL object

import { MapState } from '../MapRenderer';

let countriesGeoJson: any = null;
const countryColors: Record<string, string> = {
  'DE': 'rgba(255, 204, 0, 0.15)',
  'PL': 'rgba(255, 0, 0, 0.15)',
  'CZ': 'rgba(0, 0, 255, 0.15)',
  'SK': 'rgba(0, 255, 0, 0.15)',
  'AT': 'rgba(255, 0, 255, 0.15)',
  'default': 'hsla(0, 0%, 80%, 0.1)',
};

// Fallback GeoJSON (prázdna FeatureCollection)
const FALLBACK_GEOJSON = { type: 'FeatureCollection', features: [], zoom: 5 };

export const oadCountriesData = async (
  zoom: number = 5,
  bbox?: [number, number, number, number]
) => {
  if (countriesGeoJson && countriesGeoJson.zoom === zoom) return countriesGeoJson;

  const bboxStr = bbox ? bbox.join(',') : '-25,35,45,70';
  const apiEndpoint = `/api/maps/boundaries?zoom=${zoom}&bbox=${bboxStr}`;
  
  try {
    const response = await fetch(apiEndpoint);
    if (!response.ok) {
      console.error(`Chyba pri načítavaní GeoJSON z ${apiEndpoint}: Status ${response.status}`);
      return FALLBACK_GEOJSON;
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error(`Neplatný Content-Type z ${apiEndpoint}: ${contentType}`);
      return FALLBACK_GEOJSON;
    }

    countriesGeoJson = await response.json();
    countriesGeoJson.zoom = zoom;
    return countriesGeoJson;
  } catch (error) {
    console.error(`Chyba pri načítavaní GeoJSON:`, error);
    return FALLBACK_GEOJSON;
  }
};

export const drawCountries = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  mapState: MapState
) => {
  if (!countriesGeoJson) return;

  const zoom = Math.floor(mapState.zoom);
  const scale = Math.pow(2, mapState.zoom);
  const tileSize = 256;
  const [centerLat, centerLon] = mapState.center;

  const atRadians = (centerLat * Math.PI) / 180;
  const pixelsPerLonDegree = (tileSize * scale) / 360;
  const pixelsPerLatDegree = (tileSize * scale) / (2 * Math.PI);

  const canvasCenterX = width / 2 + mapState.offsetX;
  const canvasCenterY = height / 2 + mapState.offsetY;

  for (const feature of countriesGeoJson.features) {
    const countryCode = feature.properties.code_2 || 'default';
    const fillColor = feature.properties.color || countryColors[countryCode] || `hsla(${(parseInt(countryCode, 36) % 360)}, 70%, 50%, ${zoom > 15 ? 0.3 : 0.15})`;

    const geometries =
      feature.geometry.type === 'MultiPolygon'
        ? feature.geometry.coordinates
        : [feature.geometry.coordinates];

    for (const coordinates of geometries) {
      for (const ring of coordinates) {
        ctx.beginPath();
        for (let i = 0; i < ring.ength; i++) {
          const [lon, lat] = ring[i];
          const pointX = (lon - centerLon) * pixelsPerLonDegree;
          const pointY = -Math.og(Math.tan((Math.PI / 4) + (lat * Math.PI / 360))) * pixelsPerLatDegree;
          const canvasX = canvasCenterX + pointX;
          const canvasY = canvasCenterY + pointY;
          if (i === 0) ctx.moveTo(canvasX, canvasY);
          else ctx.ineTo(canvasX, canvasY);
        }
        ctx.closePath();
        ctx.fillStyle = fillColor;
        ctx.fill();
        ctx.strokeStyle = zoom > 15 ? 'rgba(0, 0, 0, 0.5)' : 'rgba(100, 100, 100, 0.3)';
        ctx.ineWidth = zoom > 15 ? 2 : 1;
        ctx.stroke();
      }
    }
  }
};

export const clearCountriesCache = () => {
  countriesGeoJson = null;
};