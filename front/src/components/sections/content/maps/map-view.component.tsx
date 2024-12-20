// ./front/src/components/maps/map-view.component.tsx
import React from "react";
import "./map-view.component.css";

interface MapViewProps {
  locations?: {
    pickup: string;
    delivery: string;
  };
}

const MapView: React.FC<MapViewProps> = ({ locations }) => {
  return (
    <div className="map-view">
      <h3 className="map-view-title">Interactive Map</h3>
      <div className="map-view-container">
        {/* Map implementation via API (e.g., Google Maps or Leaflet) */}
        The map will load here.
        {locations && (
          <div className="locations-info">
            <p>From: {locations.pickup || 'Not specified'}</p>
            <p>To: {locations.delivery || 'Not specified'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapView;