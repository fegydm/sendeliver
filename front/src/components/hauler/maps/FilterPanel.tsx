// File: src/components/hauler/maps/FilterPanel.tsx
// Účel: Bočný panel s filtrami a zoznamom vozidiel pre kartu Mapa.

import React, { useMemo, useState } from "react";
import { Vehicle } from "@/data/mockFleet";
import { parseStatus } from "./utils/map-utils";
import { 
  statusColors, 
  DYNAMIC_ACTIVITIES, 
  DYNAMIC_DIRECTIONS, 
  STATIC_TYPES,
  FilterCategory,
  FILTER_LABELS 
} from "./utils/map-constants";

// CSS
import "@/components/hauler/content/dashboard.filters.css";

interface FilterPanelProps {
  vehicles: Vehicle[];
  filteredVehicles: Vehicle[];
  selectedVehicles: Set<string>;
  filters: FilterCategory[];
  isAllSelected: boolean;
  onSelectAll: () => void;
  onSelectVehicle: (id: string) => void;
  onToggleFilter: (filter: FilterCategory) => void;
}

const FILTER_GROUPS = {
  Activity: ['moving', 'waiting', 'break'] as const,
  Direction: ['outbound', 'inbound', 'transit'] as const,
  Standstill: ['standby', 'depot', 'service'] as const,
} as const;

const FilterPanel: React.FC<FilterPanelProps> = ({
  vehicles,
  filteredVehicles,
  selectedVehicles,
  filters,
  isAllSelected,
  onSelectAll,
  onSelectVehicle,
  onToggleFilter,
}) => {
  const [isAndLogic, setIsAndLogic] = useState(true);

  const stats = useMemo(() => {
    const result: Record<string, { current: number; total: number }> = {};
    const allFilters = [...FILTER_GROUPS.Activity, ...FILTER_GROUPS.Direction, ...FILTER_GROUPS.Standstill];
    allFilters.forEach(f => { result[f] = { current: 0, total: 0 } });
    
    vehicles.forEach((vehicle) => {
      const parsed = parseStatus(vehicle.dashboardStatus);
      const categoryKey = parsed.category === 'dynamic' ? parsed.activity : parsed.type;
      if (result[categoryKey]) result[categoryKey].total++;
      if (parsed.category === 'dynamic' && result[parsed.direction]) {
        result[parsed.direction].total++;
      }
    });

    filteredVehicles.forEach((vehicle) => {
      const parsed = parseStatus(vehicle.dashboardStatus);
      const categoryKey = parsed.category === 'dynamic' ? parsed.activity : parsed.type;
      if (result[categoryKey]) result[categoryKey].current++;
      if (parsed.category === 'dynamic' && result[parsed.direction]) {
        result[parsed.direction].current++;
      }
    });

    return result;
  }, [vehicles, filteredVehicles]);

  const sortedFilteredVehicles = useMemo(() => {
    return [...filteredVehicles].sort((a, b) => a.name.localeCompare(b.name));
  }, [filteredVehicles]);

  const allPossibleFilters = [...DYNAMIC_DIRECTIONS, ...DYNAMIC_ACTIVITIES, ...STATIC_TYPES];
  const isAllFiltersSelected = filters.length === allPossibleFilters.length;
  
  const handleResetFilter = () => {
    const allFilters: FilterCategory[] = ['outbound', 'inbound', 'transit', 'moving', 'waiting', 'break', 'standby', 'depot', 'service'];
    onToggleFilter(isAllFiltersSelected ? allFilters[0] : allFilters[0]); // This needs a proper toggle all logic
  };
  
  const getFilterColor = (filter: FilterCategory): string => statusColors[filter] || "#808080";

  const renderFilterStat = (filter: FilterCategory) => (
    <div
      key={filter}
      className={`dashboard__stat ${filters.includes(filter) ? "dashboard__stat--active" : ""}`}
      style={{ background: getFilterColor(filter), "--status-color": getFilterColor(filter) } as React.CSSProperties}
      onClick={() => onToggleFilter(filter)}
    >
      <div className="dashboard__stat-value">
        {stats[filter]?.current ?? 0}
        <span className="total-count">({stats[filter]?.total ?? 0})</span>
      </div>
      <div className="dashboard__stat-label">{FILTER_LABELS[filter]}</div>
    </div>
  );

  return (
    <>
      <div className="dashboard__filters-column">
        <button className="dashboard__reset-filter" onClick={handleResetFilter}>
          {isAllFiltersSelected ? "Reset" : "Select All"}
        </button>
        
        <div className="dashboard__status-filters">
          <div className="dashboard__filter-section">
            <h4 className="dashboard__filter-section-title">Activity</h4>
            <div className="dashboard__filter-group">
              {FILTER_GROUPS.Activity.map(renderFilterStat)}
            </div>
          </div>

          <div className="dashboard__filter-logic">
            <button className={isAndLogic ? 'active' : ''} onClick={() => setIsAndLogic(true)}>AND</button>
            <button className={!isAndLogic ? 'active' : ''} onClick={() => setIsAndLogic(false)}>OR</button>
          </div>

          <div className="dashboard__filter-section">
            <h4 className="dashboard__filter-section-title">Direction</h4>
            <div className="dashboard__filter-group">
              {FILTER_GROUPS.Direction.map(renderFilterStat)}
            </div>
          </div>

          <div className="dashboard__filter-section">
            <h4 className="dashboard__filter-section-title">Standstill</h4>
            <div className="dashboard__filter-group">
              {FILTER_GROUPS.Standstill.map(renderFilterStat)}
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard__vehicles-column">
        <div className="dashboard__vehicles-header">
          <h3>Vehicles</h3>
          <div className="dashboard__select-all">
            <input
              type="checkbox"
              id="selectAll"
              checked={isAllSelected}
              onChange={onSelectAll}
            />
            <label htmlFor="selectAll">Select All</label>
          </div>
        </div>
        
        <div className="dashboard__vehicles-list">
          {sortedFilteredVehicles.map((vehicle) => (
            <div key={vehicle.id} className="dashboard__vehicle-item">
              <input
                type="checkbox"
                checked={selectedVehicles.has(vehicle.id)}
                onChange={() => onSelectVehicle(vehicle.id)}
              />
              <div className="dashboard__vehicle-plate">{vehicle.plateNumber}</div>
              <div className="dashboard__vehicle-destination">
                <div className="dashboard__vehicle-status">
                  {vehicle.currentLocation || vehicle.location}
                  {vehicle.speed > 0 && <span className="dashboard__vehicle-speed">{vehicle.speed} km/h</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default FilterPanel;