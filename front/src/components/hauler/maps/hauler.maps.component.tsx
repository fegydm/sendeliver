// File: front/src/components/hauler/maps/hauler.maps.component.tsx
// Účel: Hlavný komponent pre kartu "Mapa", založený na pôvodnom HaulerDashboard.

import React, { useState, useMemo } from "react";
import { mockVehicles, Vehicle } from "@/data/mockFleet";
import { filterVehicles } from "@/components/hauler/maps/utils/map-utils";
import { FilterCategory } from "@/components/hauler/maps/utils/map-constants";

// Predpokladáme, že tieto komponenty budú tiež presunuté alebo ich cesty upravené
import HaulerDashboardMaps from "@/components/hauler/maps/HaulerDashboardMaps";
import HaulerDashboardFilters from "@/components/hauler/maps/HaulerDashboardFilters";

// CSS štýly z pôvodného dashboardu
import "@/components/hauler/content/dashboard.css";
import "@/components/hauler/content/dashboard.maps.css";
import "@/components/hauler/content/dashboard.filters.css";


const HaulerMapsComponent: React.FC = () => {
  // Všetka pôvodná logika pre stav a filtre zostáva, je relevantná
  const [vehicles] = useState(mockVehicles);
  const [filters, setFilters] = useState<FilterCategory[]>([]);
  const [selectedVehicles, setSelectedVehicles] = useState<Set<string>>(new Set());
  
  const [hover, setHover] = useState<FilterCategory | null>(null);
  const [isChartExpanded, setIsChartExpanded] = useState(false);
  const [isVehiclesExpanded, setIsVehiclesExpanded] = useState(false);
  const [showFlags, setShowFlags] = useState(true);
  const [chartType, setChartType] = useState<"bar" | "pie">("bar");

  // Logika pre filtrovanie a zobrazenie zostáva nezmenená
  const filteredVehicles = useMemo(() => 
    filterVehicles(vehicles, filters, new Set()),
    [vehicles, filters]
  );

  const visibleVehicles = useMemo(() => 
    filterVehicles(vehicles, filters, selectedVehicles),
    [vehicles, filters, selectedVehicles]
  );

  const isAllSelected = useMemo(() => 
    filteredVehicles.length > 0 && 
    filteredVehicles.every(vehicle => selectedVehicles.has(vehicle.id)),
    [filteredVehicles, selectedVehicles]
  );

  // Všetky handlery zostávajú rovnaké
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
    setFilters(prev => prev.length === allFilters.length ? [] : [...allFilters]);
  };

  // Ostatné handlery...
  const handleStatusHover = (status: FilterCategory | null) => setHover(status);
  const toggleChartExpansion = () => setIsChartExpanded(prev => !prev);
  const toggleVehiclesExpansion = () => setIsVehiclesExpanded(prev => !prev);
  const handleChartType = (type: "bar" | "pie") => setChartType(type);
  const toggleFlags = () => setShowFlags(prev => !prev);

  return (
    // Použijeme rovnaké CSS triedy, ale hlavný kontajner môžeme premenovať pre jasnosť
    <div className="dashboard"> 
      <div className="dashboard__toolbar">
        <h1 className="dashboard__title">Prehľad Flotily na Mape</h1>
        <div className="dashboard__toolbar-actions">
          <span className="dashboard__stats">
            {filteredVehicles.length} z {vehicles.length} vozidiel
            {selectedVehicles.size > 0 && ` (${selectedVehicles.size} vybraných)`}
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
          vehicles={visibleVehicles} 
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

export default HaulerMapsComponent;