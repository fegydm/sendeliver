// File: src/components/maps/layers/CountriesLayer.ts
// Last change: Adjusted for Europe-focused GeoJSON with OSM layer compatibility

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

export const loadCountriesData = async (
  zoom: number = 5, // Added default value
  bbox?: [number, number, number, number]
) => {
  if (countriesGeoJson && countriesGeoJson.zoom === zoom) return countriesGeoJson;

  try {
    let url: string;
    if (zoom <= 6) {
      url = `/data/countries-europe-zoom${zoom}.geojson`;
    } else {
      const bboxStr = bbox ? bbox.join(',') : '-25,35,45,70'; // Európa
      url = `/api/countries?zoom=${zoom}&bbox=${bboxStr}`;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    countriesGeoJson = await response.json();
    countriesGeoJson.zoom = zoom;
    return countriesGeoJson;
  } catch (error) {
    console.error('Failed to load countries GeoJSON:', error);
    return null;
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

  const latRadians = (centerLat * Math.PI) / 180;
  const pixelsPerLonDegree = (tileSize * scale) / 360;
  const pixelsPerLatDegree = (tileSize * scale) / (2 * Math.PI);

  const canvasCenterX = width / 2 + mapState.offsetX;
  const canvasCenterY = height / 2 + mapState.offsetY;

  for (const feature of countriesGeoJson.features) {
    const countryCode = feature.properties.ISO_A2 || 'default';
    const fillColor =
      countryColors[countryCode] ||
      `hsla(${(parseInt(countryCode, 36) % 360)}, 70%, 50%, ${zoom > 15 ? 0.3 : 0.15})`;

    const geometries =
      feature.geometry.type === 'MultiPolygon'
        ? feature.geometry.coordinates
        : [feature.geometry.coordinates];

    for (const coordinates of geometries) {
      for (const ring of coordinates) {
        ctx.beginPath();
        for (let i = 0; i < ring.length; i++) {
          const [lon, lat] = ring[i];
          const pointX = (lon - centerLon) * pixelsPerLonDegree;
          const pointY = -Math.log(Math.tan((Math.PI / 4) + (lat * Math.PI / 360))) * pixelsPerLatDegree;
          const canvasX = canvasCenterX + pointX;
          const canvasY = canvasCenterY + pointY;
          if (i === 0) ctx.moveTo(canvasX, canvasY);
          else ctx.lineTo(canvasX, canvasY);
        }
        ctx.closePath();
        ctx.fillStyle = fillColor;
        ctx.fill();
        ctx.strokeStyle = zoom > 15 ? 'rgba(0, 0, 0, 0.5)' : 'rgba(100, 100, 100, 0.3)';
        ctx.lineWidth = zoom > 15 ? 2 : 1;
        ctx.stroke();
      }
    }
  }
};

export const clearCountriesCache = () => {
  countriesGeoJson = null;
};