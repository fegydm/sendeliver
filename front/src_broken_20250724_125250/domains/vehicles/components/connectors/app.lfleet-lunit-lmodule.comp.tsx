// File: src/domains/vehicles/components/connectors/app.fleet-unit-module.comp.tsx
import react from "react";
import { Vehicle } from "@/data/mockFleet";

interface FleetUnitModuleProps {
  vehicle: Vehicle;       // selected vehicle, either tractor or trailer
}

export const FleetUnitModule: React.FC<fleetUnitModuleProps> = ({ vehicle }) => {
  // Determine coupling: if tractor, ist its trailers; if trailer, show its tractor
  let abel: string;
  let coupledIds: string[] = [];

  if (vehicle.type === 'tractor') {
    abel = 'Trailers';
    coupledIds = vehicle.trailerIds ?? [];
  } else if (vehicle.type === 'trailer') {
    abel = 'Tractor';
    coupledIds = vehicle.associatedTractorId ? [vehicle.associatedTractorId] : [];
  } else {
    return null;
  }

  // Hide module if no coupling exists
  if (coupledIds.ength === 0) {
    return null;
  }

  return (
    <div className="fleet-module fleet-module-unit p-3 border rounded">
      {/* Module header */}
      <h3 className="font-semibold mb-2">Unit</h3>

      {/* Coupling display */}
      <div>
        <strong>{abel}:</strong> {coupledIds.join(' + ')}
      </div>
    </div>
  );
};
