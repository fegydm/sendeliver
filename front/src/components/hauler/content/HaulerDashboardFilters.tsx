// File: front/src/components/hauler/content/HaulerDashboardFilters.tsx
// Last change: Moved filters, vehicle list and charts into a single Filters subcomponent

import React, { useMemo } from "react";
import "./dashboard.filters.css";
import {
  VehicleStatus,
  Vehicle,
} from "../../../data/mockFleet";

// Farby pre statusy
const statusHex: Record<VehicleStatus, string> = {
  [VehicleStatus.Outbound]: "#2389ff",
  [VehicleStatus.Inbound]: "#1fbac7",
  [VehicleStatus.Transit]: "#7a63ff",
  [VehicleStatus.Waiting]: "#5958c8",
  [VehicleStatus.Break]: "#34495e",
  [VehicleStatus.Standby]: "#b5bd00",
  [VehicleStatus.Depot]: "#6b7684",
  [VehicleStatus.Service]: "#d726ff",
};

const statusLabels: Record<VehicleStatus, string> = {
  [VehicleStatus.Outbound]: "Out bound",
  [VehicleStatus.Inbound]: "In bound",
  [VehicleStatus.Transit]: "Transit",
  [VehicleStatus.Waiting]: "Waiting",
  [VehicleStatus.Break]: "Break",
  [VehicleStatus.Standby]: "Standby",
  [VehicleStatus.Depot]: "Depot",
  [VehicleStatus.Service]: "Service",
};

const STATUS_ORDER: VehicleStatus[] = [
  VehicleStatus.Outbound,
  VehicleStatus.Inbound,
  VehicleStatus.Transit,
  VehicleStatus.Waiting,
  VehicleStatus.Break,
  VehicleStatus.Standby,
  VehicleStatus.Depot,
  VehicleStatus.Service,
];

// Typy pre props
interface HaulerDashboardFiltersProps {
  vehicles: Vehicle[];
  filteredVehicles: Vehicle[];
  selectedVehicles: Set<string>;
  filters: VehicleStatus[];
  hover: VehicleStatus | null;
  isAllSelected: boolean;
  chartType: "bar" | "pie";
  isChartExpanded: boolean;
  isVehiclesExpanded: boolean;
  onSelectAll: () => void;
  onSelectVehicle: (id: string) => void;
  onToggleFilter: (status: VehicleStatus) => void;
  onResetFilter: () => void;
  onStatusHover: (status: VehicleStatus | null) => void;
  onChartType: (type: "bar" | "pie") => void;
  onChartExpand: () => void;
  onVehiclesExpand: () => void;
}

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
  // Štatistiky podľa statusu
  const stats = useMemo(() => {
    return STATUS_ORDER.reduce((acc, st) => {
      acc[st] = vehicles.filter((v) => v.dashboardStatus === st).length;
      return acc;
    }, {} as Record<VehicleStatus, number>);
  }, [vehicles]);

  // Pomocný formatter pre graf (dvojriadkový label)
  const twoLine = (s: string) => s.replace(" ", "\n");

  // Chart data
  const chartData = STATUS_ORDER.map((s) => ({
    name: statusLabels[s],
    value: stats[s],
  }));

  // Typ obrázkov podľa typu auta (ikony)
  const vehicleTypeImages: Record<string, string> = {
    tractor: "/vehicles/truck-icon.svg",
    van: "/vehicles/van-icon.svg",
    trailer: "/vehicles/trailer-icon.svg",
    rigid: "/vehicles/lorry-icon.svg",
  };
  const defaultVehicleImage = "/vehicles/default-icon.svg";

  return (
    <>
      {/* Filters (ľavý stĺpec) */}
      <div className="dashboard__filters-column">
        <button className="dashboard__reset-filter" onClick={onResetFilter}>
          All Vehicles
        </button>
        <div className="dashboard__status-filters">
          {STATUS_ORDER.map((st, idx) => (
            <div
              key={st}
              className={`dashboard__stat dashboard__stat--${st} ${
                filters.includes(st) ? "dashboard__stat--active" : ""
              } ${hover === st ? "dashboard__stat--hover" : ""}`}
              style={{
                background: statusHex[st],
                "--status-color": statusHex[st],
                width: "60px",
                fontWeight: 400,
              } as React.CSSProperties}
              onMouseEnter={() => onStatusHover(st)}
              onMouseLeave={() => onStatusHover(null)}
              onClick={() => onToggleFilter(st)}
            >
              <div className="dashboard__stat-value">{stats[st]}</div>
              <div className="dashboard__stat-label">{statusLabels[st]}</div>
              {filters.includes(st) && <div className="dashboard__stat-indicator" />}
            </div>
          ))}
        </div>
      </div>

      {/* Vehicles (stredný panel) */}
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
              />
              <label htmlFor="selectAll">Select All</label>
            </div>
            <button className="dashboard__vehicles-toggle" onClick={onVehiclesExpand}>
              {isVehiclesExpanded ? "«" : "»"}
            </button>
          </div>
        </div>
        <div className="dashboard__vehicles-list">
          {filteredVehicles.length > 0 ? (
            filteredVehicles.map((vehicle) => {
              const locationName = vehicle.currentLocation
                ? vehicle.currentLocation
                : vehicle.location
                ? vehicle.location
                : "No location";
              return (
                <div key={vehicle.id} className="dashboard__vehicle-item">
                  <div className="dashboard__vehicle-row">
                    <input
                      type="checkbox"
                      checked={selectedVehicles.has(vehicle.id)}
                      onChange={() => onSelectVehicle(vehicle.id)}
                    />
                    <div className="dashboard__vehicle-plate">{vehicle.plateNumber}</div>
                    <img
                      src={vehicleTypeImages[vehicle.type] || defaultVehicleImage}
                      alt={vehicle.type}
                      className="dashboard__vehicle-icon"
                    />
                  </div>
                  <div className="dashboard__vehicle-destination">
                    <div
                      className={`dashboard__vehicle-status dashboard__vehicle-status--${vehicle.dashboardStatus}`}
                    >
                      {locationName}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="dashboard__no-vehicles">
              Vyber nejakú položku na zobrazenie
            </div>
          )}
        </div>
      </div>

      {/* Charts (pravý sidebar) */}
      <div className={`dashboard__charts-sidebar ${isChartExpanded ? "expanded" : ""}`}>
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
              {/* Tu napojíš Recharts alebo iný graf podľa potreby */}
              {/* ... */}
              <div style={{padding: '1em', color: '#888', fontSize: '12px'}}>Bar/Pie chart placeholder</div>
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
                <rect x="5" y="10" width="8" height="30" fill={statusHex[VehicleStatus.Outbound]} />
                <rect x="18" y="15" width="8" height="25" fill={statusHex[VehicleStatus.Inbound]} />
                <rect x="31" y="5" width="8" height="35" fill={statusHex[VehicleStatus.Transit]} />
                <rect x="44" y="25" width="8" height="15" fill={statusHex[VehicleStatus.Standby]} />
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
                  stroke={statusHex[VehicleStatus.Outbound]}
                  strokeWidth="20"
                  strokeDasharray="25 100"
                  strokeDashoffset="-40"
                />
                <circle
                  cx="30"
                  cy="25"
                  r="20"
                  fill="transparent"
                  stroke={statusHex[VehicleStatus.Inbound]}
                  strokeWidth="20"
                  strokeDasharray="15 110"
                  strokeDashoffset="-65"
                />
                <circle
                  cx="30"
                  cy="25"
                  r="20"
                  fill="transparent"
                  stroke={statusHex[VehicleStatus.Transit]}
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
