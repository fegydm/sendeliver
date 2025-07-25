// File: front/src/components/shared/connectors/StatusConnector.tsx
// Shows key status metrics of a vehicle. BEM block: `connector connector--status`.

import React from "react";
import type { Vehicle } from "@/data/mockFleet";

interface StatusConnectorProps {
  vehicle: Vehicle;
  className?: string;
}

export const StatusConnector: React.FC<StatusConnectorProps> = ({ vehicle, className = "" }) => (
  <div className={`connector connector--status ${className}`.trim()}>
    <div className="connector__stat-row"><strong>Status:</strong> {vehicle.status}</div>
    <div className="connector__stat-row"><strong>Plate:</strong> {vehicle.plateNumber}</div>
    <div className="connector__stat-row"><strong>Odometer:</strong> {vehicle.odometerKm.toLocaleString()} km</div>
    <div className="connector__stat-row"><strong>Free Capacity:</strong> {vehicle.capacityFree}</div>
    <div className="connector__stat-row"><strong>Availability:</strong> {vehicle.availability}</div>
  </div>
);

export default StatusConnector;
