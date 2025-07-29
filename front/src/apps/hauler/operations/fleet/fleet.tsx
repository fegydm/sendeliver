// File: src/apps/hauler/operations/fleet/fleet.tsx
// Last change: Fixed variable hoisting issues by reordering code properly

import React, { useState, useEffect, useCallback, useMemo } from "react";

// Mock data (temporary - will be moved to domain services)
import { Vehicle, mockVehicles } from "@/data/mockFleet";

// Child components (updated paths)
import { ToolbarFleet } from "./toolbar.fleet";
import FleetSideFilter from "./sidebar.fleet"; 
import FleetConnectors from "./connectors.fleet";
import { DetailForm } from "./detail-form.fleet";
import { BottomSections } from "./bottom-sections.fleet";

// Types
import type { ConnectorConfig } from "./interfaces.fleet";

// CSS imports (moved to end)
 import "./toolbar.fleet.css";
// import "./sidebar.fleet.css";
import "./connectors.fleet.css";
import "./fleet.css";

const FleetComponent: React.FC = () => {
  // 1. ALL STATE VARIABLES FIRST
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selected, setSelected] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectors, setConnectors] = useState<ConnectorConfig[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTableView, setIsTableView] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // 2. COMPUTED VALUES WITH useMemo
  const filteredVehicles = useMemo(() => {
    return searchTerm
      ? vehicles.filter(v =>
          v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          v.plateNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          v.type?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : vehicles;
  }, [vehicles, searchTerm]);

  // 3. DERIVED VALUES (using computed values)
  const canNavigatePrevious = currentIndex > 0;
  const canNavigateNext = currentIndex < filteredVehicles.length - 1;
  
  // 4. HANDLERS AND CALLBACKS
  const handleNavigatePrevious = () => {
    if (canNavigatePrevious) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setSelected(filteredVehicles[newIndex]);
    }
  };
  
  const handleNavigateNext = () => {
    if (canNavigateNext) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setSelected(filteredVehicles[newIndex]);
    }
  };
  
  const handleToggleView = () => setIsTableView(prev => !prev);

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

  const handleAddVehicle = () => {
    const newVehicle: Vehicle = {
      id: `new-${Date.now()}`,
      name: "New vehicle",
      type: "Truck",
      status: "Available",
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
      dashboardStatus: "transit",
      notes: "",
      speed: 0
    };
    setVehicles(v => [newVehicle, ...v]);
    setSelected(newVehicle);
  };

  const handleDeleteVehicle = () => {
    if (!selected) return;
    if (window.confirm(`Really delete vehicle "${selected.name}"?`)) {
      setVehicles(vs => vs.filter(v => v.id !== selected.id));
      setSelected(null);
    }
  };

  const handleVehicleChange = (field: keyof Vehicle, value: any) => {
    if (!selected) return;
    const updated = { ...selected, [field]: value } as Vehicle;
    setSelected(updated);
    setVehicles(vs => vs.map(v => (v.id === updated.id ? updated : v)));
  };

  const handleResetFilters = () => setSearchTerm("");
  const toggleExpand = () => setIsExpanded((prev: boolean) => !prev);

  // 5. EFFECTS (using all above variables)
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setVehicles(mockVehicles);
      setSelected(mockVehicles[0] ?? null);
      setIsLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    if (selected) {
      const index = filteredVehicles.findIndex(v => v.id === selected.id);
      if (index !== -1) setCurrentIndex(index);
    }
  }, [selected, filteredVehicles]);

  // 6. RENDER
  return (
    <div className="fleet">
      {/* Toolbar - Direct usage without wrapper */}
      <ToolbarFleet
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onReset={handleResetFilters}
        modules={connectors}
        onToggleModule={toggleConnector}
        onMoveModule={moveConnector}
        totalVehicles={vehicles.length}
        filteredVehicles={filteredVehicles.length}
        selectedVehicle={selected}
        currentIndex={currentIndex}
        onNavigatePrevious={handleNavigatePrevious}
        onNavigateNext={handleNavigateNext}
        canNavigatePrevious={canNavigatePrevious}
        canNavigateNext={canNavigateNext}
        onAddVehicle={handleAddVehicle}
        onDeleteVehicle={handleDeleteVehicle}
        onToggleExpand={toggleExpand}
        onToggleView={handleToggleView}
        isTableView={isTableView}
      />

      {/* Grid */}
      <div className={`fleet__content${isExpanded ? " fleet__content--expanded" : ""}`}>
        {/* Sidebar */}
        <div className="fleet__sidebar">
          {isLoading ? (
            <div className="fleet__loading-msg">Loading...</div>
          ) : (
            <FleetSideFilter
              vehicles={filteredVehicles}
              selectedId={selected?.id}
              onSelect={setSelected}
              isLoading={isLoading}
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
            <div className="fleet__no-selection">Select a vehicle from the list</div>
          )}
        </div>
      </div>
    </div>
  );
};

export { FleetComponent as FleetOperations };
export default FleetComponent;