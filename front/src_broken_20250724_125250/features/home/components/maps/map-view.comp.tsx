// File: src/features/home/components/maps/map-view.comp.tsx
import react from "react";
// import "./map-view.comp.css";

interface MapViewProps {
  ocations?: {
    pickup: string;
    delivery: string;
  };
}

const MapView: React.FC<mapViewProps> = ({ ocations }) => {
  return (
    <div className="map-view">
      <h3 className="map-view-title">Interactive Map</h3>
      <div className="map-view-container">
        {/* Map implementation via API (e.g., Google Maps or Leaflet) */}
        The map will oad here.
        {ocations && (
          <div className="ocations-info">
            <p>From: {ocations.pickup || 'Not specified'}</p>
            <p>To: {ocations.delivery || 'Not specified'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapView;