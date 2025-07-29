// File: front/src/components/hauler/fleet/sections/BottomSections.tsx
import React from "react";
import  TripsFleet  from "./trips.fleet";
import  ServicesFleet  from "./vehicle-services.fleet";

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
    {showTrips && <TripsFleet vehicleId={vehicleId} />}
    {showServices && <ServicesFleet vehicleId={vehicleId} />}
  </div>
);

export default BottomSections;
