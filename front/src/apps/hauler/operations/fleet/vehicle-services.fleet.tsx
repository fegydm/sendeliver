// File: src/apps/hauler/operations/fleet/services.fleet.tsx
// Last change: Fixed duplicate export and Service interface property issue

import React from "react";
import { getServicesForVehicle, Service } from "@/data/mockFleet";
import "./services.fleet.css"; // Import CSS file

interface ServicesFleetProps {
  /** Vehicle ID for which to display services */
  vehicleId: string;
}

/**
 * ServicesFleet Component
 * 
 * Displays maintenance and service records for a specific vehicle
 * Used in the vehicle details panel within Fleet operations
 */
const ServicesFleet: React.FC<ServicesFleetProps> = ({ vehicleId }) => {
  const services: Service[] = getServicesForVehicle(vehicleId);

  if (services.length === 0) {
    return (
      <div className="services-fleet services-fleet--empty">
        <div className="services-fleet__empty-icon">🔧</div>
        <div className="services-fleet__empty-text">No service records</div>
        <div className="services-fleet__empty-subtext">
          Service history will appear here once recorded
        </div>
      </div>
    );
  }

  return (
    <div className="services-fleet">
      <div className="services-fleet__header">
        <h3 className="services-fleet__title">Service History</h3>
        <div className="services-fleet__count">
          {services.length} record{services.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      <div className="services-fleet__content">
        <div className="services-fleet__table">
          <div className="services-fleet__table-header">
            <div className="services-fleet__table-cell services-fleet__table-cell--date">
              Date
            </div>
            <div className="services-fleet__table-cell services-fleet__table-cell--type">
              Type
            </div>
            <div className="services-fleet__table-cell services-fleet__table-cell--status">
              Status
            </div>
            <div className="services-fleet__table-cell services-fleet__table-cell--cost">
              Cost
            </div>
          </div>
          
          <div className="services-fleet__table-body">
            {services.map(service => (
              <div key={service.id} className="services-fleet__table-row">
                <div className="services-fleet__table-cell services-fleet__table-cell--date">
                  {service.date}
                </div>
                <div className="services-fleet__table-cell services-fleet__table-cell--type">
                  {service.type}
                </div>
                <div className="services-fleet__table-cell services-fleet__table-cell--status">
                  <span className={`services-fleet__status services-fleet__status--${service.status.toLowerCase()}`}>
                    {service.status}
                  </span>
                </div>
                <div className="services-fleet__table-cell services-fleet__table-cell--cost">
                  €{(service as any).cost || (service as any).price || 'N/A'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesFleet;