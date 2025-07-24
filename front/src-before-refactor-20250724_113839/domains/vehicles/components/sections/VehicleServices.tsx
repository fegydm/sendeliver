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
    return (
      <div className="documents-list section-panel vehicle-services__empty">
        Žiadne servisy
      </div>
    );
  }

  return (
    <div className="documents-list section-panel vehicle-services">
      <h3 className="section-title vehicle-services__title">Servisy</h3>
      <div className="documents-list">
        <div className="table-header">
          <span>Dátum</span>
          <span>Typ</span>
          <span>Status</span>
          <span>Náklady</span>
        </div>
        {services.map(s => (
          <div key={s.id} className="table-row">
            <span>{s.date}</span>
            <span>{s.type}</span>
            <span>{s.status}</span>
            <span>{s.cost} €</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VehicleServices;

