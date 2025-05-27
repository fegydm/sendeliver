// File: front/src/components/hauler/content/HaulerDashboardFilters.tsx
// Last change: Changed AND/OR to proper toggle switch, moved between Activity and Direction sections, Standstill filters are independent

import React, { useMemo, useState } from "react";
import "./dashboard.filters.css";
import {
  Vehicle,
  parseStatus,
  getDirectionColor,
  getDelayColor,
  statusColors,
  delayColors,
  DYNAMIC_ACTIVITIES,
  DYNAMIC_DIRECTIONS,
  STATIC_TYPES,
} from "../../../data/mockFleet";

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

type FilterCategory = 'outbound' | 'inbound' | 'transit' | 'moving' | 'waiting' | 'break' | 'standby' | 'depot' | 'service';

const FILTER_GROUPS: Record<'Activity' | 'Direction' | 'Standstill', FilterCategory[]> = {
  Activity: ['moving', 'waiting', 'break'],
  Direction: ['outbound', 'inbound', 'transit'],
  Standstill: ['standby', 'depot', 'service'],
};

const FILTER_LABELS: Record<FilterCategory, string> = {
  outbound: "Outbound",
  inbound: "Inbound",
  transit: "Transit",
  moving: "Moving",
  waiting: "Waiting",
  break: "Break",
  standby: "Standby",
  depot: "Depot",
  service: "Service",
};

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

  const stats = useMemo(() => {
    const activeDirection = filters.filter(f => FILTER_GROUPS.Direction.includes(f));
    const activeActivity = filters.filter(f => FILTER_GROUPS.Activity.includes(f));
    const activeStandstill = filters.filter(f => FILTER_GROUPS.Standstill.includes(f));

    const result: Record<FilterCategory, { current: number; total: number }> = {
      outbound: { current: 0, total: 0 }, inbound: { current: 0, total: 0 }, transit: { current: 0, total: 0 },
      moving: { current: 0, total: 0 }, waiting: { current: 0, total: 0 }, break: { current: 0, total: 0 },
      standby: { current: 0, total: 0 }, depot: { current: 0, total: 0 }, service: { current: 0, total: 0 },
    };

    vehicles.forEach((v) => {
      const parsed = parseStatus(v.dashboardStatus);
      const isDynamic = parsed.category === 'dynamic';
      const direction = isDynamic ? parsed.direction : null;
      const activity = isDynamic ? parsed.activity : null;
      const type = parsed.category === 'static' ? parsed.type : null;

      // Total counts
      if (isDynamic) {
        if (direction) result[direction].total++;
        if (activity) result[activity].total++;
      } else if (type) {
        result[type].total++;
      }

      // Current counts based on active filters
      let matches = false;
      if (isDynamic) {
        const matchesDirection = activeDirection.length === 0 || (direction && activeDirection.includes(direction));
        const matchesActivity = activeActivity.length === 0 || (activity && activeActivity.includes(activity));
        matches = isAndLogic ? (matchesDirection ?? false) && (matchesActivity ?? false) : (matchesDirection ?? false) || (matchesActivity ?? false);
      } else if (type) {
        // Standstill filters are independent - simple on/off
        matches = activeStandstill.length === 0 || activeStandstill.includes(type);
      }

      if (matches) {
        if (isDynamic) {
          if (direction) result[direction].current++;
          if (activity) result[activity].current++;
        } else if (type) {
          result[type].current++;
        }
      }
    });

    return result;
  }, [vehicles, filters, isAndLogic]);

  const activeFilterDescription = useMemo(() => {
    const activeDirection = filters.filter(f => FILTER_GROUPS.Direction.includes(f)).map(f => FILTER_LABELS[f]);
    const activeActivity = filters.filter(f => FILTER_GROUPS.Activity.includes(f)).map(f => FILTER_LABELS[f]);
    const activeStandstill = filters.filter(f => FILTER_GROUPS.Standstill.includes(f)).map(f => FILTER_LABELS[f]);

    const parts: string[] = [];
    if (activeDirection.length > 0) parts.push(activeDirection.join(', '));
    if (activeActivity.length > 0) parts.push(activeActivity.join(', '));
    if (activeStandstill.length > 0) parts.push(activeStandstill.join(', '));

    if (parts.length === 0) return "No filters active";
    return `Active: ${parts.join(isAndLogic ? ' AND ' : ' OR ')}`;
  }, [filters, isAndLogic]);

  const vehicleTypeImages: Record<string, string> = {
    tractor: "/vehicles/truck-icon.svg",
    van: "/vehicles/van-icon.svg",
    trailer: "/vehicles/trailer-icon.svg",
    truck: "/vehicles/lorry-icon.svg",
  };
  const defaultVehicleImage = "/vehicles/default-icon.svg";

  const sortedFilteredVehicles = useMemo(() => {
    return filteredVehicles.slice().sort((a, b) => {
      const aCategory = parseStatus(a.dashboardStatus).category;
      const bCategory = parseStatus(b.dashboardStatus).category;
      
      if (aCategory !== bCategory) {
        return aCategory === 'dynamic' ? -1 : 1;
      }
      
      return a.name.localeCompare(b.name);
    });
  }, [filteredVehicles]);

  const allPossibleFilters = [...DYNAMIC_DIRECTIONS, ...DYNAMIC_ACTIVITIES, ...STATIC_TYPES];
  const isAllFiltersSelected = filters.length === allPossibleFilters.length && allPossibleFilters.every((filter) => filters.includes(filter));

  const getFilterColor = (filter: FilterCategory): string => {
    return statusColors[filter] || "#808080";
  };

  const getTooltip = (filter: FilterCategory): string => {
    const group = Object.keys(FILTER_GROUPS).find(g => FILTER_GROUPS[g as keyof typeof FILTER_GROUPS].includes(filter)) || '';
    return `Filter vehicles by ${FILTER_LABELS[filter]} (${group})`;
  };

  const isFilterDisabled = (filter: FilterCategory): boolean => {
    // Standstill filters are never disabled - they are independent
    const group = Object.keys(FILTER_GROUPS).find(g => FILTER_GROUPS[g as keyof typeof FILTER_GROUPS].includes(filter));
    if (group === 'Standstill') return false;

    if (isAndLogic && stats[filter].current === 0) return true;
    
    if (group === 'Activity') {
      const activeDirection = filters.filter(f => FILTER_GROUPS.Direction.includes(f));
      const activeOtherActivity = filters.filter(f => FILTER_GROUPS.Activity.includes(f) && f !== filter);
      return activeDirection.length > 0 && activeOtherActivity.length > 0 && stats[filter].current === 0;
    }
    if (group === 'Direction') {
      const activeActivity = filters.filter(f => FILTER_GROUPS.Activity.includes(f));
      const activeOtherDirection = filters.filter(f => FILTER_GROUPS.Direction.includes(f) && f !== filter);
      return activeActivity.length > 0 && activeOtherDirection.length > 0 && stats[filter].current === 0;
    }
    return false;
  };

  const isVehicleDisabled = (vehicle: Vehicle): boolean => {
    const parsed = parseStatus(vehicle.dashboardStatus);
    const activeDirection = filters.filter(f => FILTER_GROUPS.Direction.includes(f));
    const activeActivity = filters.filter(f => FILTER_GROUPS.Activity.includes(f));
    const activeStandstill = filters.filter(f => FILTER_GROUPS.Standstill.includes(f));

    if (parsed.category === 'dynamic') {
      const matchesDirection = activeDirection.length === 0 || activeDirection.includes(parsed.direction);
      const matchesActivity = activeActivity.length === 0 || activeActivity.includes(parsed.activity);
      return isAndLogic ? !(matchesDirection && matchesActivity) : !(matchesDirection || matchesActivity);
    } else {
      // Standstill - simple on/off filtering
      return activeStandstill.length > 0 && !activeStandstill.includes(parsed.type);
    }
  };

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
              {FILTER_GROUPS.Activity.map((filter) => {
                const filterColor = getFilterColor(filter);
                const disabled = isFilterDisabled(filter);
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
  {stats[filter].current === stats[filter].total 
    ? stats[filter].current 
    : `${stats[filter].current}`
  }
  {stats[filter].current !== stats[filter].total && (
    <span className="total-count">({stats[filter].total})</span>
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
              })}
            </div>
          </div>

          {/* AND/OR Toggle */}
          <div className="dashboard__filter-logic">
            <div className="dashboard__logic-toggle">
              <span className={`dashboard__logic-label ${isAndLogic ? 'active' : ''}`}>AND</span>
              <div 
                className="dashboard__logic-switch"
                onClick={() => setIsAndLogic(!isAndLogic)}
              >
                <div className={`dashboard__logic-slider ${isAndLogic ? '' : 'or'}`}></div>
              </div>
              <span className={`dashboard__logic-label ${!isAndLogic ? 'active' : ''}`}>OR</span>
            </div>
          </div>

          {/* Direction Section */}
          <div className="dashboard__filter-section">
            <h4 className="dashboard__filter-section-title">Direction</h4>
            <div className="dashboard__filter-group">
              {FILTER_GROUPS.Direction.map((filter) => {
                const filterColor = getFilterColor(filter);
                const disabled = isFilterDisabled(filter);
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
                    <div className="dashboard__stat-value">{`${stats[filter].current}(${stats[filter].total})`}</div>
                    <div className="dashboard__stat-label">
                      {FILTER_LABELS[filter]}
                    </div>
                    {filters.includes(filter) && (
                      <div className="dashboard__stat-indicator" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Standstill Section */}
          <div className="dashboard__filter-section">
            <h4 className="dashboard__filter-section-title">Standstill</h4>
            <div className="dashboard__filter-group">
              {FILTER_GROUPS.Standstill.map((filter) => {
                const filterColor = getFilterColor(filter);
                return (
                  <div
                    key={filter}
                    className={`dashboard__stat dashboard__stat--${filter} ${
                      filters.includes(filter) ? "dashboard__stat--active" : ""
                    } ${hover === filter ? "dashboard__stat--hover" : ""}`}
                    style={{
                      background: filterColor,
                      "--status-color": filterColor,
                      width: "70px",
                      fontWeight: 400,
                      transition: 'opacity 0.2s ease',
                    } as React.CSSProperties}
                    title={getTooltip(filter)}
                    onMouseEnter={() => onStatusHover(filter)}
                    onMouseLeave={() => onStatusHover(null)}
                    onClick={() => onToggleFilter(filter)}
                  >
                    <div className="dashboard__stat-value">{`${stats[filter].current}(${stats[filter].total})`}</div>
                    <div className="dashboard__stat-label">
                      {FILTER_LABELS[filter]}
                    </div>
                    {filters.includes(filter) && (
                      <div className="dashboard__stat-indicator" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="dashboard__active-filters">
            {activeFilterDescription}
          </div>
        </div>
      </div>

      <div
        className={`dashboard__vehicles-column ${
          isVehiclesExpanded ? "expanded" : ""
        }`}
      >
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
            >
              {isVehiclesExpanded ? "«" : "»"}
            </button>
          </div>
        </div>
        <div
          className={`dashboard__vehicles-list${
            filters.length === 0 ? " dashboard__vehicles-list--dimmed" : ""
          }`}
        >
          {sortedFilteredVehicles.length > 0 ? (
            sortedFilteredVehicles.map((vehicle) => {
              const locationName = vehicle.currentLocation
                ? vehicle.currentLocation
                : vehicle.location
                ? vehicle.location
                : "No location";
              
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
                    />
                    <div className="dashboard__vehicle-plate">
                      {vehicle.plateNumber}
                      {isMoving && (
                        <span className="dashboard__vehicle-moving" title="Moving">
                          ▶
                        </span>
                      )}
                    </div>
                    <img
                      src={vehicleTypeImages[vehicle.type] || defaultVehicleImage}
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
              Choose any item
            </div>
          )}
        </div>
      </div>

      <div
        className={`dashboard__charts-sidebar ${
          isChartExpanded ? "expanded" : ""
        }`}
      >
        <div className="dashboard__charts-header">
          <h3>Charts</h3>
          <button className="dashboard__charts-toggle" onClick={onChartExpand}>
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
              <div
                style={{
                  padding: "1em",
                  color: "#888",
                  fontSize: "12px",
                }}
              >
                Bar/Pie chart placeholder
              </div>
            </div>
          </div>
        ) : (
          <div className="dashboard__chart-thumbnails">
            <div
              className="dashboard__thumbnail"
              onClick={() => {
                onChartType("bar");
                onChartExpand();
              }}
            >
              <svg className="dashboard__thumbnail-svg dashboard__thumbnail-svg--bar">
                <rect
                  x="5"
                  y="10"
                  width="8"
                  height="30"
                  fill={statusColors.outbound}
                />
                <rect
                  x="18"
                  y="15"
                  width="8"
                  height="25"
                  fill={statusColors.inbound}
                />
                <rect
                  x="31"
                  y="5"
                  width="8"
                  height="35"
                  fill={statusColors.transit}
                />
                <rect
                  x="44"
                  y="25"
                  width="8"
                  height="15"
                  fill={statusColors.standby}
                />
              </svg>
              <span>Bar Chart</span>
            </div>
            <div
              className="dashboard__thumbnail"
              onClick={() => {
                onChartType("pie");
                onChartExpand();
              }}
            >
              <svg className="dashboard__thumbnail-svg dashboard__thumbnail-svg--pie">
                <circle
                  cx="30"
                  cy="25"
                  r="20"
                  fill="transparent"
                  stroke="#ccc"
                  strokeWidth="20"
                  strokeDasharray="40 85"
                />
                <circle
                  cx="30"
                  cy="25"
                  r="20"
                  fill="transparent"
                  stroke={statusColors.outbound}
                  strokeWidth="20"
                  strokeDasharray="25 100"
                  strokeDashoffset="-40"
                />
                <circle
                  cx="30"
                  cy="25"
                  r="20"
                  fill="transparent"
                  stroke={statusColors.inbound}
                  strokeWidth="20"
                  strokeDasharray="15 110"
                  strokeDashoffset="-65"
                />
                <circle
                  cx="30"
                  cy="25"
                  r="20"
                  fill="transparent"
                  stroke={statusColors.transit}
                  strokeWidth="20"
                  strokeDasharray="20 105"
                  strokeDashoffset="-80"
                />
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