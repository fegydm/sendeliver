// File: front/src/components/hauler/fleet/sections/VehicleServices.tsx

import React from "react";
import { getServicesForVehicle, Service } from "@/data/mockFleet";

interface VehicleServicesProps {
  /** ID vozidla, pre ktoré zobrazujeme servisy */
  vehicleId: string;
}

/**
 * VehicleServices
 *
 * Renders a simple list of services for the given vehicle.
 */
export const VehicleServices: React.FC<VehicleServicesProps> = ({ vehicleId }) => {
  const services: Service[] = getServicesForVehicle(vehicleId);

  if (services.length === 0) {
    return <div className="section-card">Žiadne servisy</div>;
  }

  return (
    <div className="section-card">
      <h3>Servisy</h3>
      <table className="services-table">
        <thead>
          <tr>
            <th>Dátum</th>
            <th>Typ</th>
            <th>Status</th>
            <th>Náklady</th>
          </tr>
        </thead>
        <tbody>
          {services.map(s => (
            <tr key={s.id}>
              <td>{s.date}</td>
              <td>{s.type}</td>
              <td>{s.status}</td>
              <td>{s.cost} €</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VehicleServices;
