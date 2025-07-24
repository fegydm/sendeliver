// File: src/domains/vehicles/components/connectors/app.lfleet-lunit-lmodule.comp.tsx
import react from "react";
import { Vehicle } from "@/data/mockFleet";

interface FleetUnitModuleProps {
  vehicle: Vehicle;       // selected vehicle, either tractor or trailer
}

export const FleetUnitModule: React.FC<fleetUnitModuleProps> = ({ vehicle }) => {
  // Determine coupling: if tractor, list its trailers; if trailer, show its tractor
  let label: string;
  let coupledIds: string[] = [];

  if (vehicle.type === 'tractor') {
    label = 'Trailers';
    coupledIds = vehicle.trailerIds ?? [];
  } else if (vehicle.type === 'trailer') {
    label = 'Tractor';
    coupledIds = vehicle.associatedTractorId ? [vehicle.associatedTractorId] : [];
  } else {
    return null;
  }

  // Hide module if no coupling exists
  if (coupledIds.length === 0) {
    return null;
  }

  return (
    <div className="fleet-module fleet-module-unit p-3 border rounded">
      {/* Module header */}
      <h3 className="font-semibold mb-2">Unit</h3>

      {/* Coupling display */}
      <div>
        <strong>{label}:</strong> {coupledIds.join(' + ')}
      </div>
    </div>
  );
};
