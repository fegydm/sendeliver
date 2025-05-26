
// File: front/src/components/hauler/content/HaulerDashboard.tsx
// Last change: Fixed TS2339 by replacing speed with activity in filter logic

import React, { useState, useMemo } from "react";
import "./dashboard.css";
import "./dashboard.maps.css";
import "./dashboard.filters.css";
import { mockVehicles } from "@/data/mockFleet";
import { parseStatus } from "@/data/mockFleet";
import HaulerDashboardMaps from "./HaulerDashboardMaps";
import HaulerDashboardFilters from "./HaulerDashboardFilters";

// Filter categories from HaulerDashboardFilters
type FilterCategory = 'outbound' | 'inbound' | 'transit' | 'moving' | 'waiting' | 'break' | 'standby' | 'depot' | 'service';

const HaulerDashboard: React.FC = () => {
  const [vehicles] = useState(mockVehicles);
  const [filters, setFilters] = useState<FilterCategory[]>([]);
  const [selectedVehicles, setSelectedVehicles] = useState<Set<string>>(new Set());
  const [hover, setHover] = useState<FilterCategory | null>(null);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [isChartExpanded, setIsChartExpanded] = useState(false);
  const [isVehiclesExpanded, setIsVehiclesExpanded] = useState(false);
  const [showFlags, setShowFlags] = useState(true);
  const [chartType, setChartType] = useState<"bar" | "pie">("bar");

  const visible = useMemo(() => {
    return vehicles.filter(
      (v) =>
        (filters.length === 0 || filters.some(filter => {
          const parsed = parseStatus(v.dashboardStatus);
          return (
            (parsed.category === 'dynamic' && (parsed.direction === filter || parsed.activity === filter)) ||
            (parsed.category === 'static' && parsed.type === filter)
          );
        })) &&
        (selectedVehicles.size === 0 || selectedVehicles.has(v.id))
    );
  }, [vehicles, filters, selectedVehicles]);

  const filteredVehicles = useMemo(() =>
    vehicles.filter(
      (v) => filters.length === 0 || filters.some(filter => {
        const parsed = parseStatus(v.dashboardStatus);
        return (
          (parsed.category === 'dynamic' && (parsed.direction === filter || parsed.activity === filter)) ||
          (parsed.category === 'static' && parsed.type === filter)
        );
      })
    ), [vehicles, filters]
  );

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedVehicles(new Set());
    } else {
      setSelectedVehicles(new Set(filteredVehicles.map((v) => v.id)));
    }
    setIsAllSelected(!isAllSelected);
  };

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

  const handleToggleFilter = (status: FilterCategory) => {
    setFilters((prev) => {
      if (prev.includes(status)) {
        const next = prev.filter((s) => s !== status);
        return next;
      } else {
        return [...prev, status];
      }
    });
  };

  const handleResetFilter = () => {
    setFilters((prev) => {
      const allStatuses: FilterCategory[] = [
        "outbound",
        "inbound",
        "transit",
        "moving",
        "waiting",
        "break",
        "standby",
        "depot",
        "service",
      ];
      return prev.length === allStatuses.length ? [] : [...allStatuses];
    });
  };

  const handleStatusHover = (status: FilterCategory | null) => {
    setHover(status);
  };

  const toggleChartExpansion = () => setIsChartExpanded((prev) => !prev);
  const toggleVehiclesExpansion = () => setIsVehiclesExpanded((prev) => !prev);

  const handleChartType = (type: "bar" | "pie") => setChartType(type);

  const toggleFlags = () => setShowFlags((prev) => !prev);

  return (
    <div className="dashboard">
      <div className="dashboard__toolbar">
        <h1 className="dashboard__title">Vehicle Overview</h1>
        <div className="dashboard__toolbar-actions">
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