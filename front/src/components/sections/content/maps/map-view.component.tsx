// ./front/src/components/maps/map-view.component.tsx
import React from "react";

const MapView: React.FC = () => {
  return (
    <div className="p-4">
      <h3 className="text-lg font-bold mb-4">Interactive Map</h3>
      <div className="w-full h-64 bg-gray-200 dark:bg-gray-700">
        {/* Map implementation via API (e.g., Google Maps or Leaflet) */}
        The map will load here.
      </div>
    </div>
  );
};

export default MapView;
