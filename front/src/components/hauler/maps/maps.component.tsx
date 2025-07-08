// File: src/components/hauler/maps/maps.component.tsx
// Účel: Finálna, opravená a prečistená verzia "múdreho" kontajnera pre mapu.

import React, { useState, useMemo, useEffect } from "react";
import { io } from "socket.io-client";
import { Vehicle } from "@/data/mockFleet";
import { filterVehicles } from "./utils/map-utils";
import { FilterCategory } from "./utils/map-constants";
import MapView from "./MapView";
import FilterPanel from "./FilterPanel";
import ControlPanel from "./ControlPanel";

import "@/components/hauler/content/dashboard.css";
import "@/components/hauler/content/dashboard.maps.css";
import "@/components/hauler/content/dashboard.filters.css";

const MapsComponent: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filters, setFilters] = useState<FilterCategory[]>([]);
  const [selectedMapVehicles, setSelectedMapVehicles] = useState<Set<string>>(new Set());
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    fetch("http://localhost:4000/api/vehicles")
      .then(res => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then((data: Vehicle[]) => setVehicles(data))
      .catch(err => console.error("Chyba pri načítaní vozidiel:", err));
  }, []);

  useEffect(() => {
    const socket = io("http://localhost:4000");
    socket.on("connect", () => console.log("Pripojený k WebSocket serveru:", socket.id));

    socket.on("vehicle_moved", (data: { vehicleId: string; lat: number; lon: number; speed: number }) => {
      setVehicles(currentVehicles =>
        currentVehicles.map(v =>
          v.id === data.vehicleId
            ? { ...v, gpsLocation: { latitude: data.lat, longitude: data.lon }, speed: data.speed }
            : v
        )
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const filteredVehicles = useMemo<Vehicle[]>(() =>
    filterVehicles(vehicles, filters, new Set()),
    [vehicles, filters]
  );

  const visibleVehicles = useMemo<Vehicle[]>(() =>
    filterVehicles(vehicles, filters, selectedMapVehicles),
    [vehicles, filters, selectedMapVehicles]
  );

  const isAllSelected = useMemo<boolean>(() =>
    filteredVehicles.length > 0 &&
    filteredVehicles.every(vehicle => selectedMapVehicles.has(vehicle.id)),
    [filteredVehicles, selectedMapVehicles]
  );

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedMapVehicles(new Set());
    } else {
      setSelectedMapVehicles(new Set(filteredVehicles.map(v => v.id)));
    }
  };

  const handleSelectVehicleOnMap = (id: string) => {
    const newSelection = new Set(selectedMapVehicles);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedMapVehicles(newSelection);
  };
  
  const handleToggleFilter = (filter: FilterCategory) => {
    setFilters(prev => {
      if (prev.includes(filter)) {
        return prev.filter(f => f !== filter);
      } else {
        return [...prev, filter];
      }
    });
  };

  const handleOpenControlPanel = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const handleCloseControlPanel = () => {
    setSelectedVehicle(null);
  };

  return (
    <div className="dashboard">
      <div className="dashboard__toolbar">
        <h1 className="dashboard__title">Prehľad Flotily na Mape</h1>
        <div className="dashboard__toolbar-actions">
          <span className="dashboard__stats">
            {filteredVehicles.length} z {vehicles.length} vozidiel
            {selectedMapVehicles.size > 0 && ` (${selectedMapVehicles.size} vybraných)`}
          </span>
          <button className="dashboard__toolbar-button">Export</button>
          <button className="dashboard__toolbar-button">Print</button>
          <button className="dashboard__toolbar-button">Refresh</button>
        </div>
      </div>
      
      <div className="dashboard__content">
        <FilterPanel
          vehicles={vehicles}
          filteredVehicles={filteredVehicles}
          selectedVehicles={selectedMapVehicles}
          filters={filters}
          isAllSelected={isAllSelected}
          onSelectAll={handleSelectAll}
          onSelectVehicle={handleSelectVehicleOnMap}
          onToggleFilter={handleToggleFilter}
        />
        
        <MapView
  visibleVehicles={visibleVehicles}
  onVehicleSelect={handleOpenControlPanel}
/>
      </div>

      {selectedVehicle && (
        <ControlPanel 
          vehicle={selectedVehicle} 
          onClose={handleCloseControlPanel} 
        />
      )}
    </div>
  );
};

export default MapsComponent;