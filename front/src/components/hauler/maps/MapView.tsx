// File: src/components/hauler/maps/MapView.tsx
// Účel: Finálna, prečistená verzia "hlúpeho" komponentu, ktorý iba vykresľuje mapu.

import React, { useEffect, useRef, useCallback } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Vehicle } from "@/data/mockFleet";
import { MapManager } from "./utils/map-management";
import { addVehicleMarkers } from "./utils/map-markers";
import { addMarkerClickHandlers } from "./utils/MapMarkerHandler";
import mockLocations from '@/data/mockLocations';

interface MapViewProps {
  visibleVehicles: Vehicle[];
  onVehicleSelect: (vehicle: Vehicle) => void;
}

const MapView: React.FC<MapViewProps> = ({
  visibleVehicles,
  onVehicleSelect,
}) => {
  const mapDiv = useRef<HTMLDivElement>(null);
  const mapManagerRef = useRef<MapManager | null>(null);
  const vehicleMarkersRef = useRef<Record<string, L.Marker>>({});

  const handleVehicleClick = useCallback((vehicle: Vehicle) => {
    onVehicleSelect(vehicle);
  }, [onVehicleSelect]);

  useEffect(() => {
    if (!mapDiv.current || mapManagerRef.current) return;
    mapManagerRef.current = new MapManager();
    mapManagerRef.current.initialize(mapDiv.current);
    return () => { mapManagerRef.current?.cleanup(); mapManagerRef.current = null; };
  }, []);

  useEffect(() => {
    if (!mapManagerRef.current) return;
    const mapManager = mapManagerRef.current;
    const layerManager = mapManager.getLayerManager();
    const map = mapManager.getController().getMap();

    if (!layerManager || !map) return;

    layerManager.clearLayers();
    const markers = addVehicleMarkers(map, visibleVehicles, false, mockLocations);
    vehicleMarkersRef.current = markers;
    addMarkerClickHandlers(markers, visibleVehicles, handleVehicleClick);

  }, [visibleVehicles, handleVehicleClick]);
  
  return (
    <div className="dashboard__map-container">
      <div ref={mapDiv} className="dashboard__map-element" />
    </div>
  );
};

export default MapView;