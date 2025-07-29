// File: src/apps/hauler/operations/fleet/connectors.fleet.tsx
// Last change: Fixed TypeScript errors with Vehicle type and added proper typing

import React, { useState, useEffect, useCallback } from "react";
import type { ConnectorConfig } from "./interfaces.fleet";

// Shared connectors
import VehicleConnector from "@/shared/connectors/vehicle.connector";
import StatusConnector from "@/shared/connectors/status.connector";
import DriverConnector from "@/shared/connectors/driver.connector";
import MapConnector from "@/shared/connectors/map.connector";
import UnitConnector from "@/shared/connectors/unit.connector";

import { Vehicle, mockVehicles } from "@/data/mockFleet";
import { Person, mockPeople } from "@/data/mockPeople";

interface FleetConnectorItem extends ConnectorConfig {
  draggable: boolean;
}

export interface FleetConnectorsProps {
  vehicle: Vehicle;
  onConnectorsChange?: (list: ConnectorConfig[]) => void;
}

/* Build list of vehicles in same unit */
const getUnitMembers = (v: Vehicle): Vehicle[] => {
  // Extended Vehicle type check with proper typing
  const extendedVehicle = v as Vehicle & {
    trailerIds?: string[];
    associatedTractorId?: string;
  };

  if (v.type === "tractor" && extendedVehicle.trailerIds?.length) {
    return [
      v, 
      ...extendedVehicle.trailerIds
        .map((id: string) => mockVehicles.find(m => m.id === id))
        .filter(Boolean) as Vehicle[]
    ];
  }
  
  if (v.type === "trailer" && extendedVehicle.associatedTractorId) {
    const tractor = mockVehicles.find(m => m.id === extendedVehicle.associatedTractorId);
    return tractor ? [tractor, v] : [v];
  }
  
  return [v];
};

const FleetConnectors: React.FC<FleetConnectorsProps> = ({ vehicle, onConnectorsChange }) => {
  const [items, setItems] = useState<FleetConnectorItem[]>([]);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  /* build connectors on vehicle change */
  useEffect(() => {
    const driver: Person | undefined = mockPeople.find(
      p => `${p.firstName} ${p.lastName}` === vehicle.driver
    );
    const unitMembers = getUnitMembers(vehicle);

    const list: FleetConnectorItem[] = [
      {
        key: "vehicle",
        label: "Vozidlo",
        component: (
          <VehicleConnector 
            key={`vehicle-${vehicle.id}`} 
            vehicle={vehicle} 
            editable={false} 
          />
        ),
        visible: true,
        draggable: false,
      },
      {
        key: "status",
        label: "Status",
        component: <StatusConnector vehicle={vehicle} />,
        visible: true,
        draggable: true,
      },
      {
        key: "unit",
        label: "Unit",
        component: <UnitConnector vehicles={unitMembers} />,
        visible: unitMembers.length > 1,
        draggable: true,
      },
      {
        key: "driver",
        label: "Driver",
        component: <DriverConnector driver={driver} context="fleet" />,
        visible: true,
        draggable: true,
      },
      {
        key: "map",
        label: "Map",
        component: (
          <MapConnector 
            latitude={(vehicle as any).location?.lat} 
            longitude={(vehicle as any).location?.lng} 
          />
        ),
        visible: Boolean((vehicle as any).location?.lat),
        draggable: true,
      },
    ];
    
    setItems(list);
    onConnectorsChange?.(list);
  }, [vehicle, onConnectorsChange]);

  /* drag helpers */
  const moveItem = useCallback((from: number, to: number) => {
    if (to === 0) return; // can't move before vehicle
    setItems(prev => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }, []);

  const onDragStart = (e: React.DragEvent, idx: number) => {
    if (!items[idx].draggable) return;
    e.dataTransfer.setData("text/plain", String(idx));
    e.dataTransfer.effectAllowed = "move";
    setDraggingIndex(idx);
  };

  const onDragOver = (e: React.DragEvent) => e.preventDefault();

  const onDrop = (e: React.DragEvent, idx: number) => {
    const from = parseInt(e.dataTransfer.getData("text/plain"), 10);
    if (Number.isNaN(from) || from === idx) return;
    moveItem(from, idx);
    setDraggingIndex(null);
  };

  const visible = items.filter(i => i.visible);
  if (!visible.length) return <div className="fleet-connectors fleet-connectors--empty" />;

  return (
    <div className="fleet-connectors">
      {visible.map((c, idx) => (
        <div
          key={c.key}
          className={`connector connector--${c.key}${draggingIndex === idx ? " connector--dragging" : ""}`}
          draggable={c.draggable}
          onDragStart={e => onDragStart(e, idx)}
          onDragOver={onDragOver}
          onDrop={e => onDrop(e, idx)}
        >
          {idx > 0 && <div className="connector__coupler connector__coupler--left" />}
          {idx < visible.length - 1 && <div className="connector__coupler connector__coupler--right" />}

          <div className="connector__content">{c.component}</div>
        </div>
      ))}
    </div>
  );
};

export { FleetConnectors };
export default FleetConnectors;