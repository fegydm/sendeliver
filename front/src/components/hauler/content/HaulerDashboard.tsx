// File: front/src/components/hauler/content/HaulerDashboard.tsx
// Last change: Split dashboard into Maps and Filters subcomponents, refactored state logic

import React, { useState, useMemo } from "react";
import "./dashboard.css";
import "./dashboard.maps.css";
import "./dashboard.filters.css";
import { mockVehicles, VehicleStatus } from "../../../data/mockFleet";
import mockLocations from "../../../data/mockLocations";
import HaulerDashboardMaps from "./HaulerDashboardMaps";
import HaulerDashboardFilters from "./HaulerDashboardFilters";

// ... prípadne ďalšie importy

const HaulerDashboard: React.FC = () => {
  const [vehicles] = useState(mockVehicles);
  const [filters, setFilters] = useState<VehicleStatus[]>([]);
  const [selectedVehicles, setSelectedVehicles] = useState<Set<string>>(new Set());
  const [hover, setHover] = useState<VehicleStatus | null>(null);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [isChartExpanded, setIsChartExpanded] = useState(false);
  const [isVehiclesExpanded, setIsVehiclesExpanded] = useState(false);
  const [showFlags, setShowFlags] = useState(true);
  const [chartType, setChartType] = useState<"bar" | "pie">("bar");

  // Filterované (viditeľné) vozidlá podľa filtra a selectu
  const visible = useMemo(() => {
    return vehicles.filter(
      (v) =>
        (filters.length === 0 || filters.includes(v.dashboardStatus)) &&
        (selectedVehicles.size === 0 || selectedVehicles.has(v.id))
    );
  }, [vehicles, filters, selectedVehicles]);

  // Filterované pre zoznam (pre “Select All”)
  const filteredVehicles = useMemo(() =>
    vehicles.filter(
      (v) => filters.length === 0 || filters.includes(v.dashboardStatus)
    ), [vehicles, filters]
  );

  // Handler pre “Select All”/Reset
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedVehicles(new Set());
    } else {
      setSelectedVehicles(new Set(filteredVehicles.map((v) => v.id)));
    }
    setIsAllSelected(!isAllSelected);
  };

  // Handler pre jeden checkbox
  const handleSelectVehicle = (id: string) => {
    const newSelection = new Set(selectedVehicles);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedVehicles(newSelection);
    setIsAllSelected(
      newSelection.size === filteredVehicles.length && newSelection.size > 0
    );
  };

  // Handler pre filter (status)
  const handleToggleFilter = (status: VehicleStatus) => {
    setFilters((prev) => {
      if (prev.includes(status)) {
        const next = prev.filter((s) => s !== status);
        return next;
      } else {
        return [...prev, status];
      }
    });
  };

  // Handler pre “All Vehicles” / reset filtra
  const handleResetFilter = () => {
    setFilters((prev) =>
      prev.length === Object.values(VehicleStatus).length
        ? []
        : [...Object.values(VehicleStatus)]
    );
  };

  // Handler pre hover nad statusom
  const handleStatusHover = (status: VehicleStatus | null) => {
    setHover(status);
  };

  const toggleChartExpansion = () => setIsChartExpanded((prev) => !prev);
  const toggleVehiclesExpansion = () => setIsVehiclesExpanded((prev) => !prev);

  const handleChartType = (type: "bar" | "pie") => setChartType(type);

  const toggleFlags = () => setShowFlags((prev) => !prev);

  // Základná štruktúra dashboardu
  return (
    <div className="dashboard">
      {/* Toolbar */}
      <div className="dashboard__toolbar">
        <h1 className="dashboard__title">Vehicle Overview</h1>
        <div className="dashboard__toolbar-actions">
          <button className="dashboard__toolbar-button">Export</button>
          <button className="dashboard__toolbar-button">Print</button>
          <button className="dashboard__toolbar-button">Refresh</button>
        </div>
      </div>

      {/* Hlavný obsah – rozdelený na filter/charts a mapu */}
      <div
        className={`dashboard__content ${
          isChartExpanded ? "dashboard__content--charts-expanded" : ""
        } ${isVehiclesExpanded ? "dashboard__content--vehicles-expanded" : ""}`}
      >
        {/* Filters (ľavý panel: statusy, vozidlá, grafy) */}
        <HaulerDashboardFilters
          vehicles={vehicles}
          filteredVehicles={filteredVehicles}
          selectedVehicles={selectedVehicles}
          filters={filters}
          hover={hover}
          isAllSelected={isAllSelected}
          chartType={chartType}
          isChartExpanded={isChartExpanded}
          isVehiclesExpanded={isVehiclesExpanded}
          onSelectAll={handleSelectAll}
          onSelectVehicle={handleSelectVehicle}
          onToggleFilter={handleToggleFilter}
          onResetFilter={handleResetFilter}
          onStatusHover={handleStatusHover}
          onChartType={handleChartType}
          onChartExpand={toggleChartExpansion}
          onVehiclesExpand={toggleVehiclesExpansion}
        />

        {/* Mapa (pravý panel) */}
        <HaulerDashboardMaps
          vehicles={vehicles}
          visibleVehicles={visible}
          filters={filters}
          selectedVehicles={selectedVehicles}
          hover={hover}
          showFlags={showFlags}
          onToggleFlags={toggleFlags}
          isChartExpanded={isChartExpanded}
          isVehiclesExpanded={isVehiclesExpanded}
        />
      </div>
    </div>
  );
};

export default HaulerDashboard;
