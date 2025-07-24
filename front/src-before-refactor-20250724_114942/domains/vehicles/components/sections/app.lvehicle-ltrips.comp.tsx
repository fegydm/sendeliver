// File: src/domains/vehicles/components/sections/app.lvehicle-ltrips.comp.tsx
// File: front/src/components/hauler/fleet/sections/VehicleTrips.tsx

import React from "react";
import { getTripsForVehicle, Trip } from "@/data/mockFleet";

interface VehicleTripsProps {
  /** ID vozidla, pre ktoré zobrazujeme jazdy */
  vehicleId: string;
}

/**
 * VehicleTrips
 *
 * Renders a simple list of trips for the given vehicle.
 */
export const VehicleTrips: React.FC<VehicleTripsProps> = ({ vehicleId }) => {
  const trips: Trip[] = getTripsForVehicle(vehicleId);

  if (trips.length === 0) {
    return (
      <div className="trips-list section-panel vehicle-trips__empty">
        Žiadne jazdy
      </div>
    );
  }

  return (
    <div className="trips-list section-panel vehicle-trips">
      <h3 className="section-title vehicle-trips__title">Jazdy</h3>
      <div className="trips-list">
        <div className="table-header">
          <span>Dátum</span>
          <span>Vodič</span>
          <span>Destinácia</span>
          <span>Status</span>
        </div>
        {trips.map(trip => (
          <div key={trip.id} className="table-row">
            <span>{trip.date}</span>
            <span>{trip.driver}</span>
            <span>{trip.destination}</span>
            <span>{trip.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VehicleTrips;
