// ./front/src/components/maps/map-view.component.tsx
import React from "react";

const MapView: React.FC = () => {
  return (
    <div className="p-4">
      <h3 className="text-lg font-bold mb-4">Interaktívna mapa</h3>
      <div className="w-full h-64 bg-gray-200 dark:bg-gray-700">
        {/* Implementácia mapy cez API (napr. Google Maps alebo Leaflet) */}
        Mapa sa načíta tu.
      </div>
    </div>
  );
};

export default MapView;
