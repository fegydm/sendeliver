// File: src/domains/vehicles/components/connectors/app.lfleet-lstatus-lmodule.comp.tsx
// File: front/src/components/hauler/fleet/modules/FleetStatusModule.tsx
import React from "react";
import type { Vehicle } from "@/data/mockFleet";

interface FleetStatusModuleProps {
  vehicle: Vehicle;
}

export const FleetStatusModule: React.FC<FleetStatusModuleProps> = ({ vehicle }) => {
  return (
    <div className="fleet-module fleet-module-status">
      {/* Status fields */}
      <div className="status-row"><strong>Status:</strong> {vehicle.status}</div>
      <div className="status-row"><strong>Plate:</strong> {vehicle.plateNumber}</div>
      <div className="status-row"><strong>Odometer:</strong> {vehicle.odometerKm} km</div>
      <div className="status-row"><strong>Free Capacity:</strong> {vehicle.capacityFree}</div>
      <div className="status-row"><strong>Availability:</strong> {vehicle.availability}</div>
    </div>
  );
};
