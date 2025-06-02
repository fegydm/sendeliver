// File: front/src/components/hauler/content/HaulerDashboard.tsx
// Last change: Refactored to remove duplicities and use unified filter logic

import React, { useState, useMemo } from "react";
import "./dashboard.css";
import "./dashboard.maps.css";
import "./dashboard.filters.css";
import { mockVehicles } from "@/data/mockFleet";
import { filterVehicles } from "./map-utils";
import { FilterCategory, ALL_STATUSES } from "./map-constants";
import HaulerDashboardMaps from "./HaulerDashboardMaps";
import HaulerDashboardFilters from "./HaulerDashboardFilters";

const HaulerDashboard: React.FC = () => {
  // Core state
  const [vehicles] = useState(mockVehicles);
  const [filters, setFilters] = useState<FilterCategory[]>([]);
  const [selectedVehicles, setSelectedVehicles] = useState<Set<string>>(new Set());
  
  // UI state
  const [hover, setHover] = useState<FilterCategory | null>(null);
  const [isChartExpanded, setIsChartExpanded] = useState(false);
  const [isVehiclesExpanded, setIsVehiclesExpanded] = useState(false);
  const [showFlags, setShowFlags] = useState(true);
  const [chartType, setChartType] = useState<"bar" | "pie">("bar");

  // Unified filter logic using map-utils
  const filteredVehicles = useMemo(() => 
    filterVehicles(vehicles, filters, new Set()), // No vehicle selection filter at this level
    [vehicles, filters]
  );

  // Vehicles visible on map (filtered + selected)
  const visibleVehicles = useMemo(() => 
    filterVehicles(vehicles, filters, selectedVehicles),
    [vehicles, filters, selectedVehicles]
  );

  // Check if all filtered vehicles are selected
  const isAllSelected = useMemo(() => 
    filteredVehicles.length > 0 && 
    filteredVehicles.every(vehicle => selectedVehicles.has(vehicle.id)),
    [filteredVehicles, selectedVehicles]
  );

  // Event handlers
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedVehicles(new Set());
    } else {
      setSelectedVehicles(new Set(filteredVehicles.map(v => v.id)));
    }
  };

  const handleSelectVehicle = (id: string) => {
    const newSelection = new Set(selectedVehicles);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedVehicles(newSelection);
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

  const handleResetFilter = () => {
    const allFilters: FilterCategory[] = ['outbound', 'inbound', 'transit', 'moving', 'waiting', 'break', 'standby', 'depot', 'service'];
    
    setFilters(prev => {
      // Toggle between all filters and no filters
      return prev.length === allFilters.length ? [] : [...allFilters];
    });
  };

  const handleStatusHover = (status: FilterCategory | null) => {
    setHover(status);
  };

  const toggleChartExpansion = () => setIsChartExpanded(prev => !prev);
  const toggleVehiclesExpansion = () => setIsVehiclesExpanded(prev => !prev);
  const handleChartType = (type: "bar" | "pie") => setChartType(type);
  const toggleFlags = () => setShowFlags(prev => !prev);

  return (
    <div className="dashboard">
      <div className="dashboard__toolbar">
        <h1 className="dashboard__title">Vehicle Overview</h1>
        <div className="dashboard__toolbar-actions">
          <span className="dashboard__stats">
            {filteredVehicles.length} of {vehicles.length} vehicles
            {selectedVehicles.size > 0 && ` (${selectedVehicles.size} selected)`}
          </span>
          <button className="dashboard__toolbar-button">Export</button>
          <button className="dashboard__toolbar-button">Print</button>
          <button className="dashboard__toolbar-button">Refresh</button>
        </div>
      </div>
      
      <div
        className={`dashboard__content ${
          isChartExpanded ? "dashboard__content--charts-expanded" : ""
        } ${isVehiclesExpanded ? "dashboard__content--vehicles-expanded" : ""}`}
      >
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
        
        <HaulerDashboardMaps
          vehicles={vehicles}
          visibleVehicles={visibleVehicles}
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