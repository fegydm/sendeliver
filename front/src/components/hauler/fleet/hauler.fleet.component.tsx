// File: ./front/src/components/hauler/fleet/hauler.fleet.component.tsx
// Purpose: Fleet page wired with Connector system – fixed infinite render loop by memoising handlers.

import React, { useState, useEffect, useCallback } from "react";
import { FleetToolbar } from "./elements/FleetToolbar";
import type { ConnectorConfig } from "./interfaces";
import { Vehicle, mockVehicles } from "@/data/mockFleet";
import FleetSideFilter from "./sections/FleetSideFilter";
import FleetConnectors from "./sections/FleetConnectors";
import { DetailForm } from "./sections/DetailForm";
import { BottomSections } from "./sections/BottomSections";

// CSS
import "./toolbar.css";
import "./sidebar.css";
import "./connectors.css";
import "./fleet.css";

const HaulerFleetComponent: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selected, setSelected] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectors, setConnectors] = useState<ConnectorConfig[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  /* Fetch mock */
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setVehicles(mockVehicles);
      setSelected(mockVehicles[0] ?? null);
      setIsLoading(false);
    }, 500);
  }, []);

  /* ---- stable callbacks for children -----------------------------------*/
  const handleConnectorsChange = useCallback((next: ConnectorConfig[]) => {
    setConnectors(next);
  }, []);

  const toggleConnector = useCallback((key: string) => {
    setConnectors(prev => prev.map(c => (c.key === key ? { ...c, visible: !c.visible } : c)));
  }, []);

  const moveConnector = useCallback((from: number, to: number) => {
    setConnectors(prev => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }, []);

  /* Vehicle mutators -----------------------------------------------------*/
  const handleAddVehicle = () => {
    const newVehicle: Vehicle = {
      id: `new-${Date.now()}`,
      name: "Nové vozidlo",
      type: "Nákladné",
      status: "Dostupné",
      image: "/fleet/placeholder.jpg",
      driver: "",
      location: undefined,
      plateNumber: "XX123YY",
      brand: "Unknown",
      manufactureYear: 2023,
      capacity: "0t",
      odometerKm: 0,
      capacityFree: "0t",
      availability: "available",
      dashboardStatus: "transit"
    };
    setVehicles(v => [newVehicle, ...v]);
    setSelected(newVehicle);
  };

  const handleDeleteVehicle = () => {
    if (!selected) return;
    if (window.confirm(`Naozaj chcete odstrániť vozidlo "${selected.name}"?`)) {
      setVehicles(vs => vs.filter(v => v.id !== selected.id));
      setSelected(undefined as any);
    }
  };

  const handleVehicleChange = (field: keyof Vehicle, value: any) => {
    if (!selected) return;
    const updated = { ...selected, [field]: value } as Vehicle;
    setSelected(updated);
    setVehicles(vs => vs.map(v => (v.id === updated.id ? updated : v)));
  };

  /* Search filter */
  const filteredVehicles = searchTerm
    ? vehicles.filter(v =>
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.plateNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.type.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : vehicles;

  const handleResetFilters = () => setSearchTerm("");
  const toggleExpand = () => setIsExpanded(p => !p);

  /* -------------------------------- Render ----------------------------- */
  return (
    <div className="fleet">
      {/* Toolbar */}
      <div className="fleet__toolbar">
        <FleetToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onReset={handleResetFilters}
          modules={connectors}
          onToggleModule={toggleConnector}
          onMoveModule={moveConnector}
          totalVehicles={vehicles.length}
          selectedVehicles={filteredVehicles.length}
          onAddVehicle={handleAddVehicle}
          onDeleteVehicle={handleDeleteVehicle}
          onToggleExpand={toggleExpand}
        />
      </div>

      {/* Grid */}
      <div className={`fleet__content${isExpanded ? " fleet__content--expanded" : ""}`}>
        {/* Sidebar */}
        <div className="fleet__sidebar">
          {isLoading ? (
            <div className="fleet__loading-msg">Načítavam...</div>
          ) : (
            <FleetSideFilter
              vehicles={filteredVehicles}
              selectedId={selected?.id}
              onSelect={setSelected}
            />
          )}
        </div>

        {/* Details */}
        <div className="fleet__details">
          {selected ? (
            <>
              <div className="fleet__connectors-wrapper">
                <FleetConnectors vehicle={selected} onConnectorsChange={handleConnectorsChange} />
              </div>

              <div className="fleet__details-scroll">
                <DetailForm vehicle={selected} onChange={handleVehicleChange} />
                <BottomSections vehicleId={selected.id} showTrips showServices />
              </div>
            </>
          ) : (
            <div className="fleet__no-selection">Vyberte vozidlo zo zoznamu</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HaulerFleetComponent;
