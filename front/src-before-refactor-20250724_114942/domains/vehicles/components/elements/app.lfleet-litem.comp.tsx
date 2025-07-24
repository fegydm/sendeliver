// File: src/domains/vehicles/components/elements/app.lfleet-litem.comp.tsx
// Last change: Created vehicle item component for sidebar

import React from "react";
import StatusChip from "./StatusChip";
import { Vehicle } from "../../../../data/mockFleet"; // Import typu Vehicle

interface FleetItemProps {
  vehicle: Vehicle;
  isSelected: boolean;
  onClick: (vehicle: Vehicle) => void;
}

/**
 * Komponent pre zobrazenie položky vozidla v bočnom paneli
 */
const FleetItem: React.FC<FleetItemProps> = ({ vehicle, isSelected, onClick }) => {
  return (
    <div 
      className={`vehicle-item ${isSelected ? 'selected' : ''}`}
      onClick={() => onClick(vehicle)}
    >
      <div className="vehicle-thumbnail-container">
        <img 
          src={vehicle.image} 
          alt={vehicle.name} 
          className="vehicle-thumbnail" 
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/fleet/placeholder.jpg";
            target.classList.add("fallback-image");
          }}
          loading="lazy"
        />
      </div>
      <div className="vehicle-info">
        <div className="vehicle-name">{vehicle.name}</div>
        <div className="vehicle-meta">
          <span>{vehicle.type}</span>
          <span>•</span>
          <StatusChip status={vehicle.status} />
        </div>
      </div>
    </div>
  );
};

export default FleetItem;