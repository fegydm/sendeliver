// File: src/pages/test2/app.lmap-llibre-lmap.comp.tsx

import React, { useEffect, useRef } from 'react';
import maplibre from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface MapLibreMapProps {
  center?: [number, number];
  zoom?: number;
  styleUrl?: string;
}

// MapLibre GL React component with layer control
export default function MapLibreMap({
  center = [0, 0],
  zoom = 2,
  styleUrl = 'https://demotiles.maplibre.org/style.json',
}: MapLibreMapProps) {
  const mapContainer = useRef<hTMLDivElement>(null);
  const mapRef = useRef<maplibre.Map | null>(null);

  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return;

    // Initialize MapLibre map
    mapRef.current = new maplibre.Map({
      container: mapContainer.current,
      style: styleUrl,
      center,
      zoom,
    });

    // Add default navigation controls
    mapRef.current.addControl(new maplibre.NavigationControl(), 'top-right');

    return () => {
      // Cleanup on unmount
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [center, zoom, styleUrl]);

  return (
    <div style={{ position: 'relative' }}>
      <div
        ref={mapContainer}
        style={{ width: '100%', height: '100%', minHeight: 400 }}
      />
      {/* Optional layer selector */}
      <div style={{ position: 'absolute', top: 10, left: 10, background: 'white', padding: 8, borderRadius: 4 }}>
        <label htmlFor="layer-select">Vyberte vrstvu: </label>
        <select
          id="layer-select"
          onChange={e => {
            const style = e.target.value;
            mapRef.current?.setStyle(style);
          }}
          defaultValue={styleUrl}
        >
          <option value="https://demotiles.maplibre.org/style.json">Topo & streets</option>
          <option value="https://api.maptiler.com/maps/basic/style.json?key=SD9pdKPFfnFfuzYyS57z">Basic (MapTiler)</option>
          <option value="https://api.maptiler.com/maps/streets/style.json?key=SD9pdKPFfnFfuzYyS57z">Streets (MapTiler)</option>
          {/* Pridajte vlastné style URL podľa potreby */}
        </select>
      </div>
    </div>
  );
}
