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
    return <div className="section-card">Žiadne jazdy</div>;
  }

  return (
    <div className="section-card">
      <h3>Jazdy</h3>
      <table className="trips-table">
        <thead>
          <tr>
            <th>Dátum</th>
            <th>Vodič</th>
            <th>Destinácia</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {trips.map(trip => (
            <tr key={trip.id}>
              <td>{trip.date}</td>
              <td>{trip.driver}</td>
              <td>{trip.destination}</td>
              <td>{trip.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VehicleTrips;
