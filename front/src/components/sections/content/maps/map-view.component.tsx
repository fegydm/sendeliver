// ./front/src/components/maps/map-view.component.tsx
import React from "react";
import "./map-view.component.css"; // Import CSS file

const MapView: React.FC = () => {
  return (
    <div className="map-view">
      <h3 className="map-view-title">Interactive Map</h3>
      <div className="map-view-container">
        {/* Map implementation via API (e.g., Google Maps or Leaflet) */}
        The map will load here.
      </div>
    </div>
  );
};

export default MapView;
