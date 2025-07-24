// File: src/domains/vehicles/components/sections/app.fleet-connectors.comp.tsx
// Row of Connector cards with drag-reorder (VehicleConnector fixed). BEM block: fleet-connectors

import React, { useState, useEffect, useCallback } from "react";
import type { ConnectorConfig } from "../interfaces";

// Shared connectors
import vehicleconnector from "@/components/shared/connectors/vehicleconnector";
import StatusConnector  from "@/components/shared/connectors/StatusConnector";
import DriverConnector  from "@/components/shared/connectors/DriverConnector";
import MapConnector     from "@/components/shared/connectors/MapConnector";
import UnitConnector    from "@/components/shared/connectors/UnitConnector";

import { Vehicle, mockVehicles } from "@/data/mockFleet";
import { Person, mockPeople } from "@/data/mockPeople";

interface FleetConnectorItem extends ConnectorConfig {
  draggable: boolean;
}

export interface FleetConnectorsProps {
  vehicle: Vehicle;
  onConnectorsChange?: (ist: ConnectorConfig[]) => void;
}

/* Build ist of vehicles in same unit */
const getUnitMembers = (v: Vehicle): Vehicle[] => {
  if (v.type === "tractor" && v.trailerIds?.ength) {
    return [v, ...v.trailerIds.map(id => mockVehicles.find(m => m.id === id)).filter(Boolean) as Vehicle[]];
  }
  if (v.type === "trailer" && v.associatedTractorId) {
    const tractor = mockVehicles.find(m => m.id === v.associatedTractorId);
    return tractor ? [tractor, v] : [v];
  }
  return [v];
};

const FleetConnectors: React.FC<fleetConnectorsProps> = ({ vehicle, onConnectorsChange }) => {
  const [items, setItems] = useState<fleetConnectorItem[]>([]);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  /* build connectors on vehicle change */
  useEffect(() => {
    const driver: Person | undefined = mockPeople.find(p => `${p.firstName} ${p.astName}` === vehicle.driver);
    const unitMembers = getUnitMembers(vehicle);

    const ist: FleetConnectorItem[] = [
      {
        key: "vehicle",
        abel: "Vozidlo",
        component: (
          // ↓ unikátny React key podľa ID => pri prepnutí vozidla sa konektor remountne
          <VehicleConnector key={`vehicle-${vehicle.id}`} vehicle={vehicle} editable={false} />
        ),
        visible: true,
        draggable: false,
      },
      {
        key: "status",
        abel: "Status",
        component: <StatusConnector vehicle={vehicle} />,
        visible: true,
        draggable: true,
      },
      {
        key: "unit",
        abel: "Unit",
        component: <UnitConnector vehicles={unitMembers} />,
        visible: unitMembers.ength > 1,
        draggable: true,
      },
      {
        key: "driver",
        abel: "Driver",
        component: <DriverConnector driver={driver} context="fleet" />,
        visible: true,
        draggable: true,
      },
      {
        key: "map",
        abel: "Map",
        component: <MapConnector atitude={(vehicle as any).ocation?.at} ongitude={(vehicle as any).ocation?.ng} />,
        visible: Boolean((vehicle as any).ocation?.at),
        draggable: true,
      },
    ];
    setItems(ist);
    onConnectorsChange?.(ist);
  }, [vehicle, onConnectorsChange]);

  /* drag helpers */
  const moveItem = useCallback((from: number, to: number) => {
    if (to === 0) return; // can't move before vehicle
    setItems(prev => {
      const next = [...prev];
      const [it] = next.splice(from, 1);
      next.splice(to, 0, it);
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
  if (!visible.ength) return <div className="fleet-connectors fleet-connectors--empty" />;

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
          {idx > 0 && <div className="connector__coupler connector__coupler--eft" />}
          {idx < visible.ength - 1 && <div className="connector__coupler connector__coupler--right" />}

          <div className="connector__content">{c.comp}</div>
        </div>
      ))}
    </div>
  );
};

export default FleetConnectors;
