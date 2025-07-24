// File: src/domains/vehicles/components/sections/app.lbottom-lsections.comp.tsx
import React from "react";
import { VehicleTrips } from "./VehicleTrips";
import { VehicleServices } from "./VehicleServices";

export interface BottomSectionsProps {
  vehicleId: string;
  showTrips: boolean;
  showServices: boolean;
}

/**
 * BottomSections
 * – jednoduchý wrapper na sekcie Jazdy a Servisy.
 */
export const BottomSections: React.FC<BottomSectionsProps> = ({
  vehicleId,
  showTrips,
  showServices,
}) => (
  <div className="bottom-sections">
    {showTrips && <VehicleTrips vehicleId={vehicleId} />}
    {showServices && <VehicleServices vehicleId={vehicleId} />}
  </div>
);

export default BottomSections;
