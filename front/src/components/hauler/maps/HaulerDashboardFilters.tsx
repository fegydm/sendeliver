// File: front/src/components/hauler/content/HaulerDashboardFilters.tsx
// Last change: Fixed imports to use new modular structure

import React, { useMemo, useState, useCallback } from "react";
import "./dashboard.filters.css";
import { Vehicle } from "@/data/mockFleet";
import { parseStatus, getDirectionColor, getDelayColor } from "./utils/map-utils";
import { 
  statusColors, 
  DYNAMIC_ACTIVITIES, 
  DYNAMIC_DIRECTIONS, 
  STATIC_TYPES,
  FilterCategory,
  FILTER_LABELS 
} from "./utils/map-constants";

interface HaulerDashboardFiltersProps {
  vehicles: Vehicle[];
  filteredVehicles: Vehicle[];
  selectedVehicles: Set<string>;
  filters: FilterCategory[];
  hover: FilterCategory | null;
  isAllSelected: boolean;
  chartType: "bar" | "pie";
  isChartExpanded: boolean;
  isVehiclesExpanded: boolean;
  onSelectAll: () => void;
  onSelectVehicle: (id: string) => void;
  onToggleFilter: (filter: FilterCategory) => void;
  onResetFilter: () => void;
  onStatusHover: (filter: FilterCategory | null) => void;
  onChartType: (type: "bar" | "pie") => void;
  onChartExpand: () => void;
  onVehiclesExpand: () => void;
}

const FILTER_GROUPS = {
  Activity: ['moving', 'waiting', 'break'] as const,
  Direction: ['outbound', 'inbound', 'transit'] as const,
  Standstill: ['standby', 'depot', 'service'] as const,
} as const;

const HaulerDashboardFilters: React.FC<HaulerDashboardFiltersProps> = ({
  vehicles,
  filteredVehicles,
  selectedVehicles,
  filters,
  hover,
  isAllSelected,
  chartType,
  isChartExpanded,
  isVehiclesExpanded,
  onSelectAll,
  onSelectVehicle,
  onToggleFilter,
  onResetFilter,
  onStatusHover,
  onChartType,
  onChartExpand,
  onVehiclesExpand,
}) => {
  const [isAndLogic, setIsAndLogic] = useState(true);

  // Optimized stats calculation with better logic
  const stats = useMemo(() => {
    const activeDirection = filters.filter(f => FILTER_GROUPS.Direction.includes(f as any));
    const activeActivity = filters.filter(f => FILTER_GROUPS.Activity.includes(f as any));
    const activeStandstill = filters.filter(f => FILTER_GROUPS.Standstill.includes(f as any));

    const result: Record<FilterCategory, { current: number; total: number }> = {
      outbound: { current: 0, total: 0 }, inbound: { current: 0, total: 0 }, transit: { current: 0, total: 0 },
      moving: { current: 0, total: 0 }, waiting: { current: 0, total: 0 }, break: { current: 0, total: 0 },
      standby: { current: 0, total: 0 }, depot: { current: 0, total: 0 }, service: { current: 0, total: 0 },
    };

    vehicles.forEach((vehicle) => {
      const parsed = parseStatus(vehicle.dashboardStatus);
      
      if (parsed.category === 'dynamic') {
        // Count totals for dynamic vehicles
        if (parsed.direction) result[parsed.direction].total++;
        if (parsed.activity) result[parsed.activity].total++;

        // Current counts based on filter logic
        const matchesDirection = activeDirection.length === 0 || activeDirection.includes(parsed.direction);
        const matchesActivity = activeActivity.length === 0 || activeActivity.includes(parsed.activity);
        
        const vehicleMatches = isAndLogic 
          ? matchesDirection && matchesActivity 
          : matchesDirection || matchesActivity;

        if (vehicleMatches) {
          if (parsed.direction) result[parsed.direction].current++;
          if (parsed.activity) result[parsed.activity].current++;
        }
      } else if (parsed.category === 'static') {
        // Static vehicles - simple independent filtering
        result[parsed.type].total++;
        
        const vehicleMatches = activeStandstill.length === 0 || activeStandstill.includes(parsed.type);
        if (vehicleMatches) {
          result[parsed.type].current++;
        }
      }
    });

    return result;
  }, [vehicles, filters, isAndLogic]);

  // Cleaner active filter description
  const activeFilterDescription = useMemo(() => {
    const activeDirection = filters.filter(f => FILTER_GROUPS.Direction.includes(f as any));
    const activeActivity = filters.filter(f => FILTER_GROUPS.Activity.includes(f as any));
    const activeStandstill = filters.filter(f => FILTER_GROUPS.Standstill.includes(f as any));

    const parts: string[] = [];
    
    // Dynamic filters with AND/OR logic
    if (activeDirection.length > 0 || activeActivity.length > 0) {
      const dynamicParts = [
        ...activeDirection.map(f => FILTER_LABELS[f]),
        ...activeActivity.map(f => FILTER_LABELS[f])
      ];
      parts.push(dynamicParts.join(isAndLogic ? ' AND ' : ' OR '));
    }
    
    // Static filters - independent
    if (activeStandstill.length > 0) {
      parts.push(activeStandstill.map(f => FILTER_LABELS[f]).join(', '));
    }

    return parts.length === 0 ? "No filters active" : `Active: ${parts.join(' | ')}`;
  }, [filters, isAndLogic]);

  // Memoized vehicle type images
  const vehicleTypeImages = useMemo((): Record<string, string> => ({
    tractor: "/vehicles/truck-icon.svg",
    van: "/vehicles/van-icon.svg", 
    trailer: "/vehicles/trailer-icon.svg",
    truck: "/vehicles/lorry-icon.svg",
  }), []);

  const defaultVehicleImage = "/vehicles/default-icon.svg";

  // Optimized sorted vehicles
  const sortedFilteredVehicles = useMemo(() => {
    return [...filteredVehicles].sort((a, b) => {
      const aCategory = parseStatus(a.dashboardStatus).category;
      const bCategory = parseStatus(b.dashboardStatus).category;
      
      if (aCategory !== bCategory) {
        return aCategory === 'dynamic' ? -1 : 1;
      }
      
      return a.name.localeCompare(b.name);
    });
  }, [filteredVehicles]);

  // Check if all filters are selected
  const allPossibleFilters = [...DYNAMIC_DIRECTIONS, ...DYNAMIC_ACTIVITIES, ...STATIC_TYPES];
  const isAllFiltersSelected = filters.length === allPossibleFilters.length && 
    allPossibleFilters.every(filter => filters.includes(filter));

  // Utility functions
  const getFilterColor = useCallback((filter: FilterCategory): string => {
    return statusColors[filter] || "#808080";
  }, []);

  const getTooltip = useCallback((filter: FilterCategory): string => {
    let group = '';
    if (FILTER_GROUPS.Activity.includes(filter as any)) group = 'Activity';
    else if (FILTER_GROUPS.Direction.includes(filter as any)) group = 'Direction';
    else if (FILTER_GROUPS.Standstill.includes(filter as any)) group = 'Standstill';
    
    return `Filter vehicles by ${FILTER_LABELS[filter]} (${group})`;
  }, []);

  // Improved filter disabled logic
  const isFilterDisabled = useCallback((filter: FilterCategory): boolean => {
    // Standstill filters are never disabled
    if (FILTER_GROUPS.Standstill.includes(filter as any)) return false;

    // For AND logic, disable if current count is 0
    if (isAndLogic && stats[filter].current === 0) return true;
    
    // For complex interactions in AND mode
    if (FILTER_GROUPS.Activity.includes(filter as any)) {
      const activeDirection = filters.filter(f => FILTER_GROUPS.Direction.includes(f as any));
      const activeOtherActivity = filters.filter(f => 
        FILTER_GROUPS.Activity.includes(f as any) && f !== filter
      );
      return isAndLogic && activeDirection.length > 0 && activeOtherActivity.length > 0 && stats[filter].current === 0;
    }
    
    if (FILTER_GROUPS.Direction.includes(filter as any)) {
      const activeActivity = filters.filter(f => FILTER_GROUPS.Activity.includes(f as any));
      const activeOtherDirection = filters.filter(f => 
        FILTER_GROUPS.Direction.includes(f as any) && f !== filter
      );
      return isAndLogic && activeActivity.length > 0 && activeOtherDirection.length > 0 && stats[filter].current === 0;
    }
    
    return false;
  }, [stats, filters, isAndLogic]);

  // Vehicle disabled logic
  const isVehicleDisabled = useCallback((vehicle: Vehicle): boolean => {
    const parsed = parseStatus(vehicle.dashboardStatus);
    const activeDirection = filters.filter(f => FILTER_GROUPS.Direction.includes(f as any));
    const activeActivity = filters.filter(f => FILTER_GROUPS.Activity.includes(f as any));
    const activeStandstill = filters.filter(f => FILTER_GROUPS.Standstill.includes(f as any));

    if (parsed.category === 'dynamic') {
      const matchesDirection = activeDirection.length === 0 || activeDirection.includes(parsed.direction);
      const matchesActivity = activeActivity.length === 0 || activeActivity.includes(parsed.activity);
      return isAndLogic ? !(matchesDirection && matchesActivity) : !(matchesDirection || matchesActivity);
    } else {
      return activeStandstill.length > 0 && !activeStandstill.includes(parsed.type);
    }
  }, [filters, isAndLogic]);

  // Render filter stat component
  const renderFilterStat = useCallback((filter: FilterCategory, group: keyof typeof FILTER_GROUPS) => {
    const filterColor = getFilterColor(filter);
    const disabled = isFilterDisabled(filter);
    const isStandstill = group === 'Standstill';
    
    return (
      <div
        key={filter}
        className={`dashboard__stat dashboard__stat--${filter} ${
          filters.includes(filter) ? "dashboard__stat--active" : ""
        } ${hover === filter && !disabled ? "dashboard__stat--hover" : ""} ${
          disabled ? "dashboard__stat--disabled" : ""
        }`}
        style={{
          background: filterColor,
          "--status-color": filterColor,
          width: "70px",
          fontWeight: 400,
          opacity: disabled ? 0.6 : 1,
          transition: 'opacity 0.2s ease',
        } as React.CSSProperties}
        title={getTooltip(filter)}
        onMouseEnter={() => !disabled && onStatusHover(filter)}
        onMouseLeave={() => !disabled && onStatusHover(null)}
        onClick={() => !disabled && onToggleFilter(filter)}
      >
        <div className="dashboard__stat-value">
          {isStandstill ? (
            stats[filter].total
          ) : (
            stats[filter].current === stats[filter].total 
              ? stats[filter].current 
              : (
                <>
                  {stats[filter].current}
                  <span className="total-count">({stats[filter].total})</span>
                </>
              )
          )}
        </div>
        <div className="dashboard__stat-label">
          {FILTER_LABELS[filter]}
          {filter === 'moving' && (
            <div className="dashboard__moving-indicator">▶</div>
          )}
        </div>
        {filters.includes(filter) && (
          <div className="dashboard__stat-indicator" />
        )}
      </div>
    );
  }, [filters, hover, stats, getFilterColor, isFilterDisabled, getTooltip, onStatusHover, onToggleFilter]);

  return (
    <>
      <div className="dashboard__filters-column">
        <button className="dashboard__reset-filter" onClick={onResetFilter}>
          {isAllFiltersSelected ? "Reset" : "Select All"}
        </button>
        
        <div className="dashboard__status-filters">
          {/* Activity Section */}
          <div className="dashboard__filter-section">
            <h4 className="dashboard__filter-section-title">Activity</h4>
            <div className="dashboard__filter-group">
              {FILTER_GROUPS.Activity.map(filter => renderFilterStat(filter, 'Activity'))}
            </div>
          </div>

          {/* AND/OR Toggle - only affects dynamic sections */}
          <div className="dashboard__filter-logic">
            <button 
              className={`dashboard__logic-button ${isAndLogic ? 'active' : ''}`}
              onClick={() => setIsAndLogic(true)}
              aria-label="Use AND logic for dynamic filters"
            >
              AND
            </button>
            <button 
              className={`dashboard__logic-button ${!isAndLogic ? 'active' : ''}`}
              onClick={() => setIsAndLogic(false)}
              aria-label="Use OR logic for dynamic filters"
            >
              OR
            </button>
          </div>

          {/* Direction Section */}
          <div className="dashboard__filter-section">
            <h4 className="dashboard__filter-section-title">Direction</h4>
            <div className="dashboard__filter-group">
              {FILTER_GROUPS.Direction.map(filter => renderFilterStat(filter, 'Direction'))}
            </div>
          </div>

          {/* Standstill Section */}
          <div className="dashboard__filter-section">
            <h4 className="dashboard__filter-section-title">Standstill</h4>
            <div className="dashboard__filter-group">
              {FILTER_GROUPS.Standstill.map(filter => renderFilterStat(filter, 'Standstill'))}
            </div>
          </div>
        </div>
      </div>

      <div className={`dashboard__vehicles-column ${isVehiclesExpanded ? "expanded" : ""}`}>
        <div className="dashboard__vehicles-header">
          <h3>Vehicles</h3>
          <div className="dashboard__vehicles-actions">
            <div className="dashboard__select-all">
              <input
                type="checkbox"
                id="selectAll"
                checked={isAllSelected}
                onChange={onSelectAll}
                disabled={filters.length > 0 && sortedFilteredVehicles.length === 0}
              />
              <label htmlFor="selectAll">Select All</label>
            </div>
            <button
              className="dashboard__vehicles-toggle"
              onClick={onVehiclesExpand}
              aria-label={isVehiclesExpanded ? "Collapse vehicles" : "Expand vehicles"}
            >
              {isVehiclesExpanded ? "«" : "»"}
            </button>
          </div>
        </div>
        
        <div className={`dashboard__vehicles-list${filters.length === 0 ? " dashboard__vehicles-list--dimmed" : ""}`}>
          {sortedFilteredVehicles.length > 0 ? (
            sortedFilteredVehicles.map((vehicle) => {
              const locationName = vehicle.currentLocation || vehicle.location || "No location";
              const parsed = parseStatus(vehicle.dashboardStatus);
              const isMoving = parsed.category === "dynamic" && parsed.activity === "moving";
              const disabled = isVehicleDisabled(vehicle);
              
              return (
                <div
                  key={vehicle.id}
                  className={`dashboard__vehicle-item ${disabled ? "dashboard__vehicle-item--disabled" : ""}`}
                  style={{ opacity: disabled ? 0.6 : 1 }}
                >
                  <div className="dashboard__vehicle-row">
                    <input
                      type="checkbox"
                      checked={selectedVehicles.has(vehicle.id)}
                      onChange={() => onSelectVehicle(vehicle.id)}
                      disabled={disabled}
                      aria-label={`Select vehicle ${vehicle.plateNumber}`}
                    />
                    <div className="dashboard__vehicle-plate">
                      {vehicle.plateNumber}
                      {isMoving && (
                        <span className="dashboard__vehicle-moving" title="Moving">▶</span>
                      )}
                    </div>
                    <img
                      src={vehicleTypeImages[vehicle.type as keyof typeof vehicleTypeImages] || defaultVehicleImage}
                      alt={vehicle.type}
                      className="dashboard__vehicle-icon"
                    />
                  </div>
                  <div className="dashboard__vehicle-destination">
                    <div
                      className={`dashboard__vehicle-status dashboard__vehicle-status--${parsed.category}`}
                      style={{ 
                        color: getDelayColor(vehicle.dashboardStatus),
                        borderLeft: `3px solid ${getDirectionColor(vehicle.dashboardStatus)}`
                      }}
                    >
                      {locationName}
                      {vehicle.speed && vehicle.speed > 0 && (
                        <span className="dashboard__vehicle-speed">
                          {vehicle.speed} km/h
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="dashboard__no-vehicles">
              No vehicles match current filters
            </div>
          )}
        </div>

        {/* Active Filters - moved after vehicle list */}
        <div className="dashboard__active-filters">
          {activeFilterDescription}
        </div>
      </div>

      <div className={`dashboard__charts-sidebar ${isChartExpanded ? "expanded" : ""}`}>
        <div className="dashboard__charts-header">
          <h3>Charts</h3>
          <button 
            className="dashboard__charts-toggle" 
            onClick={onChartExpand}
            aria-label={isChartExpanded ? "Collapse charts" : "Expand charts"}
          >
            {isChartExpanded ? "«" : "»"}
          </button>
        </div>
        
        {isChartExpanded ? (
          <div className="dashboard__chart-expanded">
            <div className="dashboard__chart-type-toggle">
              <button
                className={chartType === "bar" ? "active" : ""}
                onClick={() => onChartType("bar")}
              >
                Bar
              </button>
              <button
                className={chartType === "pie" ? "active" : ""}
                onClick={() => onChartType("pie")}
              >
                Pie
              </button>
            </div>
            <div className="dashboard__chart">
              <div style={{ padding: "1em", color: "#888", fontSize: "12px" }}>
                {chartType === "bar" ? "Bar" : "Pie"} chart placeholder
              </div>
            </div>
          </div>
        ) : (
          <div className="dashboard__chart-thumbnails">
            <div className="dashboard__thumbnail" onClick={() => { onChartType("bar"); onChartExpand(); }}>
              <svg className="dashboard__thumbnail-svg dashboard__thumbnail-svg--bar">
                <rect x="5" y="10" width="8" height="30" fill={statusColors.outbound} />
                <rect x="18" y="15" width="8" height="25" fill={statusColors.inbound} />
                <rect x="31" y="5" width="8" height="35" fill={statusColors.transit} />
                <rect x="44" y="25" width="8" height="15" fill={statusColors.standby} />
              </svg>
              <span>Bar Chart</span>
            </div>
            <div className="dashboard__thumbnail" onClick={() => { onChartType("pie"); onChartExpand(); }}>
              <svg className="dashboard__thumbnail-svg dashboard__thumbnail-svg--pie">
                <circle cx="30" cy="25" r="20" fill="transparent" stroke="#ccc" strokeWidth="20" strokeDasharray="40 85" />
                <circle cx="30" cy="25" r="20" fill="transparent" stroke={statusColors.outbound} strokeWidth="20" strokeDasharray="25 100" strokeDashoffset="-40" />
                <circle cx="30" cy="25" r="20" fill="transparent" stroke={statusColors.inbound} strokeWidth="20" strokeDasharray="15 110" strokeDashoffset="-65" />
                <circle cx="30" cy="25" r="20" fill="transparent" stroke={statusColors.transit} strokeWidth="20" strokeDasharray="20 105" strokeDashoffset="-80" />
              </svg>
              <span>Pie Chart</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default HaulerDashboardFilters;