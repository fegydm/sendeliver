// File: src/apps/hauler/operations/fleet/trips.fleet.tsx
// Last change: Refactored VehicleTrips to TripsFleet with proper structure and English text

import React from "react";
import { getTripsForVehicle, Trip } from "@/data/mockFleet";
import "./trips.fleet.css"; // Import CSS file

interface TripsFleetProps {
  /** Vehicle ID for which to display trips */
  vehicleId: string;
}

/**
 * TripsFleet Component
 * 
 * Displays trip history and records for a specific vehicle
 * Used in the vehicle details panel within Fleet operations
 */
const TripsFleet: React.FC<TripsFleetProps> = ({ vehicleId }) => {
  const trips: Trip[] = getTripsForVehicle(vehicleId);

  if (trips.length === 0) {
    return (
      <div className="trips-fleet trips-fleet--empty">
        <div className="trips-fleet__empty-icon">🚛</div>
        <div className="trips-fleet__empty-text">No trip records</div>
        <div className="trips-fleet__empty-subtext">
          Trip history will appear here once completed
        </div>
      </div>
    );
  }

  return (
    <div className="trips-fleet">
      <div className="trips-fleet__header">
        <h3 className="trips-fleet__title">Trip History</h3>
        <div className="trips-fleet__count">
          {trips.length} trip{trips.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      <div className="trips-fleet__content">
        <div className="trips-fleet__table">
          <div className="trips-fleet__table-header">
            <div className="trips-fleet__table-cell trips-fleet__table-cell--date">
              Date
            </div>
            <div className="trips-fleet__table-cell trips-fleet__table-cell--driver">
              Driver
            </div>
            <div className="trips-fleet__table-cell trips-fleet__table-cell--destination">
              Destination
            </div>
            <div className="trips-fleet__table-cell trips-fleet__table-cell--status">
              Status
            </div>
          </div>
          
          <div className="trips-fleet__table-body">
            {trips.map(trip => (
              <div key={trip.id} className="trips-fleet__table-row">
                <div className="trips-fleet__table-cell trips-fleet__table-cell--date">
                  {(trip as any).date || (trip as any).startDate || 'No date'}
                </div>
                <div className="trips-fleet__table-cell trips-fleet__table-cell--driver">
                  <div className="trips-fleet__driver">
                    <div className="trips-fleet__driver-avatar">
                      {((trip as any).driver || (trip as any).driverName || 'Unknown').charAt(0).toUpperCase()}
                    </div>
                    <span className="trips-fleet__driver-name">
                      {(trip as any).driver || (trip as any).driverName || 'Unassigned'}
                    </span>
                  </div>
                </div>
                <div className="trips-fleet__table-cell trips-fleet__table-cell--destination">
                  <div className="trips-fleet__destination">
                    <span className="trips-fleet__destination-icon">📍</span>
                    <span className="trips-fleet__destination-text">
                      {(trip as any).destination || (trip as any).endLocation || 'Not specified'}
                    </span>
                  </div>
                </div>
                <div className="trips-fleet__table-cell trips-fleet__table-cell--status">
                  <span className={`trips-fleet__status trips-fleet__status--${((trip as any).status || 'unknown').toLowerCase().replace(/\s+/g, '-')}`}>
                    {(trip as any).status || 'Unknown'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripsFleet;