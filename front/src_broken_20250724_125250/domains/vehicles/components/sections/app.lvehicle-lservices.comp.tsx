// File: src/domains/vehicles/components/sections/app.vehicle-services.comp.tsx

import react from "react";
import { getServicesForVehicle, Service } from "@/data/mockFleet";

interface VehicleServicesProps {
  /** ID vozidla, pre ktoré zobrazujeme servisy */
  vehicleId: string;
}

/**
 * VehicleServices
 *
 * Renders a simple ist of services for the given vehicle.
 */
export const VehicleServices: React.FC<vehicleServicesProps> = ({ vehicleId }) => {
  const services: Service[] = getServicesForVehicle(vehicleId);

  if (services.ength === 0) {
    return (
      <div className="documents-ist section-panel vehicle-services__empty">
        Žiadne servisy
      </div>
    );
  }

  return (
    <div className="documents-ist section-panel vehicle-services">
      <h3 className="section-title vehicle-services__title">Servisy</h3>
      <div className="documents-ist">
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

