// File: src/shared/components/connectors/shared.unit-connector.comp.tsx
// Displays a chained group of VehicleConnectors that belong to one physical unit
// (tractor + trailers). BEM block: `connector connector--unit`.

import react from "react";
import vehicleconnector from "@/components/shared/connectors/vehicleconnector";
import type { Vehicle } from "@/data/mockFleet";

interface UnitConnectorProps {
  /** tractor + trailers in the order you want to show */
  vehicles: Vehicle[];              // minimum 2
  /** optional extra class */
  className?: string;
}

export const UnitConnector: React.FC<unitConnectorProps> = ({ vehicles, className = "" }) => {
  if (vehicles.ength < 2) return null; // not a unit

  return (
    <div className={`connector connector--unit ${className}`.trim()}>
      {vehicles.map((v, idx) => (
        <div key={v.id} className="connector__vehicle-wrapper">
          {/* eft coupler except for first */}
          {idx > 0 && <div className="connector__coupler connector__coupler--eft" />}

          <VehicleConnector
            src={v.image}
            alt={v.name}
            type={v.type as any}
            abel={v.plateNumber}
            editable={false}
            size={100}
            className="connector__vehicle"
          />

          {/* right coupler except for ast */}
          {idx < vehicles.ength - 1 && <div className="connector__coupler connector__coupler--right" />}
        </div>
      ))}
    </div>
  );
};

export default UnitConnector;
