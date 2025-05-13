// File: front/src/components/hauler/content/HaulerDashboard.tsx
// Description: Dashboard component for vehicle fleet management with map, filters, and charts
// Last change: Updated map to grayscale relief, replaced Maintenance with Service, narrowed columns

import React, { useEffect, useRef, useState } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./dashboard.css";

// Enum for vehicle status
enum VehicleStatus {
  Outbound = "outbound",
  Inbound = "inbound",
  Transit = "transit",
  Standby = "standby",
  Depot = "depot",
  Service = "service", // Replaced Maintenance with Service
}

// Enum for delay status
enum DelayStatus {
  None = "none",
  Minor = "minor",
  Major = "major",
}

// Constants for status ordering and styling
const STATUS_ORDER: VehicleStatus[] = [
  VehicleStatus.Outbound,
  VehicleStatus.Inbound,
  VehicleStatus.Transit,
  VehicleStatus.Standby,
  VehicleStatus.Depot,
  VehicleStatus.Service,
];

const statusHex: Record<VehicleStatus, string> = {
  [VehicleStatus.Outbound]: "#2389ff",
  [VehicleStatus.Inbound]: "#1fbac7",
  [VehicleStatus.Transit]: "#7a63ff",
  [VehicleStatus.Standby]: "#b5bd00",
  [VehicleStatus.Depot]: "#6b7684",
  [VehicleStatus.Service]: "#d726ff", // Same color as Maintenance
};

const statusLabels: Record<VehicleStatus, string> = {
  [VehicleStatus.Outbound]: "Out bound",
  [VehicleStatus.Inbound]: "In bound",
  [VehicleStatus.Transit]: "Transit",
  [VehicleStatus.Standby]: "Standby",
  [VehicleStatus.Depot]: "Depot",
  [VehicleStatus.Service]: "Service",
};

// Mock vehicle data
interface ExtendedVehicle {
  id: string;
  name: string;
  plateNumber: string;
  type: string;
  dashboardStatus: VehicleStatus;
  location?: string;
  start?: string;
  destination?: string;
  currentLocation?: string;
  delayStatus?: DelayStatus;
}

const mockVehicles: ExtendedVehicle[] = [
  {
    id: "1",
    name: "Truck 1",
    plateNumber: "BA123AB",
    type: "Truck",
    dashboardStatus: VehicleStatus.Outbound,
    location: "Bratislava",
    start: "Praha",
    destination: "Bratislava",
    currentLocation: "Brno",
    delayStatus: DelayStatus.Minor,
  },
  {
    id: "2",
    name: "Van 1",
    plateNumber: "ZA456CD",
    type: "Van",
    dashboardStatus: VehicleStatus.Inbound,
    location: "Viedeň",
    start: "Budapešť",
    destination: "Viedeň",
    currentLocation: "Trnava",
    delayStatus: DelayStatus.None,
  },
  {
    id: "3",
    name: "Lorry 1",
    plateNumber: "BB789EF",
    type: "Lorry",
    dashboardStatus: VehicleStatus.Transit,
    location: "Berlín",
    start: "Frankfurt",
    destination: "Berlín",
    currentLocation: "Mníchov",
    delayStatus: DelayStatus.Major,
  },
  {
    id: "4",
    name: "Trailer 1",
    plateNumber: "KE101GH",
    type: "Trailer",
    dashboardStatus: VehicleStatus.Standby,
    location: "Žilina",
  },
  {
    id: "5",
    name: "Truck 2",
    plateNumber: "NR202IJ",
    type: "Truck",
    dashboardStatus: VehicleStatus.Depot,
    location: "Trnava",
  },
  {
    id: "6",
    name: "Van 2",
    plateNumber: "TT303KL",
    type: "Van",
    dashboardStatus: VehicleStatus.Service,
    location: "Brno",
  },
];

/* ------------------------------------------------------------------ */
/* Helpers & Lookup Tables                                            */
/* ------------------------------------------------------------------ */

// Coordinates for European cities (demo)
const destinationCoords: Record<string, [number, number]> = {
  Bratislava: [48.1486, 17.1077],
  Praha: [50.0755, 14.4378],
  Viedeň: [48.2082, 16.3738],
  Budapešť: [47.4979, 19.0402],
  Brno: [49.1951, 16.6068],
  Berlín: [52.52, 13.405],
  Frankfurt: [50.1109, 8.6821],
  Mníchov: [48.1351, 11.582],
  Žilina: [49.2231, 18.7394],
  Trnava: [48.3774, 17.5872],
};

// Lookup for vehicle type images
const vehicleTypeImages: Record<string, string> = {
  Truck: "/vehicles/truck-icon.svg",
  Van: "/vehicles/van-icon.svg",
  Lorry: "/vehicles/lorry-icon.svg",
  Trailer: "/vehicles/trailer-icon.svg",
};

const defaultVehicleImage = "/vehicles/default-icon.svg";

type VehicleStats = Record<VehicleStatus, number>;
const emptyStats = (): VehicleStats =>
  STATUS_ORDER.reduce(
    (a, s) => ({ ...a, [s]: 0 }),
    {} as VehicleStats,
  );

// Two-line tick formatter (e.g., Out\nbound)
const twoLine = (s: string) => s.replace(" ", "\n");

/* ------------------------------------------------------------------ */
/* Leaflet Sprite Fix                                                 */
/* ------------------------------------------------------------------ */
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* ------------------------------------------------------------------ */
/* Main Component                                                     */
/* ------------------------------------------------------------------ */
const HaulerDashboard: React.FC = () => {
  const [vehicles] = useState<ExtendedVehicle[]>(mockVehicles);
  const [stats, setStats] = useState<VehicleStats>(emptyStats);
  const [filter, setFilter] = useState<VehicleStatus | "all">("all");
  const [hover, setHover] = useState<VehicleStatus | null>(null);
  const [chartType, setChartType] = useState<"bar" | "pie">("bar");
  const [selectedVehicles, setSelectedVehicles] = useState<Set<string>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [isChartExpanded, setIsChartExpanded] = useState(false);

  // Refs for map
  const mapDiv = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markers = useRef<Record<string, L.Marker>>({});

  // Calculate stats on data load
  useEffect(() => {
    const s = emptyStats();
    vehicles.forEach((v) => (s[v.dashboardStatus] += 1));
    setStats(s);
  }, [vehicles]);

// Initialize Leaflet map
useEffect(() => {
  if (!mapDiv.current) return;

  // Remove old map
  mapRef.current?.remove();
  markers.current = {};

  const map = L.map(mapDiv.current).setView([49, 15], 6);
  mapRef.current = map;

  // Use OpenTopoMap with grayscale applied via CSS
  L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
    attribution: "Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)",
    subdomains: ["a", "b", "c"],
  }).addTo(map);

    // Helper: Create colored divIcon with delay status
    const statusIcon = (st: VehicleStatus, delay?: DelayStatus) =>
      L.divIcon({
        className: `status-icon status-icon--${st} ${delay ? `delay--${delay}` : ""}`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

    // Filter vehicles by status and selection
    const visible = vehicles.filter(
      (v) =>
        (filter === "all" || v.dashboardStatus === filter) &&
        (selectedVehicles.size === 0 || selectedVehicles.has(v.id))
    );

    visible.forEach((v) => {
      if (!v.currentLocation && !v.location) return;
      const coords = destinationCoords[v.currentLocation || v.location || ""];
      if (!coords) return;

      const popupContent = `
        <b>${v.name}</b><br>
        ${v.plateNumber}<br>
        ${statusLabels[v.dashboardStatus]}<br>
        ${v.start ? `Start: ${v.start}<br>` : ""}
        ${v.currentLocation ? `Current: ${v.currentLocation}<br>` : ""}
        ${v.destination ? `Destination: ${v.destination}` : v.location || "No location"}
      `;

      const marker = L.marker(coords, {
        icon: statusIcon(v.dashboardStatus, v.delayStatus),
      })
        .addTo(map)
        .bindPopup(popupContent);

      markers.current[v.id] = marker;
    });

    // Fit bounds if we have markers
    if (Object.keys(markers.current).length > 0) {
      const markerArray = Object.values(markers.current);
      const bounds = L.featureGroup(markerArray).getBounds();

      if (markerArray.length === 1) {
        map.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 10,
        });
      } else {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }

    // Handle chart expansion/collapse - resize map
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [vehicles, filter, selectedVehicles, isChartExpanded]);

  // Update marker visibility on hover
  useEffect(() => {
    Object.entries(markers.current).forEach(([id, m]) => {
      const el = m.getElement();
      if (!el) return;
      const st = vehicles.find((v) => v.id === id)?.dashboardStatus;
      if (!st) return;
      el.classList.toggle("marker--hidden", !!hover && st !== hover);
    });
  }, [hover, vehicles]);

  // Chart data
  const chartData = STATUS_ORDER.map((s) => ({
    name: statusLabels[s],
    value: stats[s],
  }));

  // Filter vehicles based on current filter
  const filteredVehicles = vehicles.filter(
    (v) => filter === "all" || v.dashboardStatus === filter
  );

  // Handle select all vehicles
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedVehicles(new Set());
    } else {
      setSelectedVehicles(new Set(filteredVehicles.map((v) => v.id)));
    }
    setIsAllSelected(!isAllSelected);
  };

  // Handle individual vehicle selection
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

  // Reset status filter
  const handleResetFilter = () => {
    setFilter("all");
  };

  // Toggle chart expansion
  const toggleChartExpansion = () => {
    setIsChartExpanded(!isChartExpanded);
    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 300);
  };

  return (
    <div className="dashboard">
      {/* Top toolbar */}
      <div className="dashboard__toolbar">
        <h1 className="dashboard__title">Vehicle Overview</h1>
        <div className="dashboard__toolbar-actions">
          <button className="dashboard__toolbar-button">Export</button>
          <button className="dashboard__toolbar-button">Print</button>
          <button className="dashboard__toolbar-button">Refresh</button>
        </div>
      </div>

      {/* Main content */}
      <div
        className={`dashboard__content ${
          isChartExpanded ? "dashboard__content--charts-expanded" : ""
        }`}
      >
        {/* Left column - status filters */}
        <div className="dashboard__filters-column">
          <button className="dashboard__reset-filter" onClick={handleResetFilter}>
            All Vehicles
          </button>

          <div className="dashboard__status-filters">
            {STATUS_ORDER.map((st, index) => (
              <div
                key={st}
                className={`dashboard__stat dashboard__stat--${st} ${
                  filter === st ? "dashboard__stat--active" : ""
                } ${hover === st ? "dashboard__stat--hover" : ""}`}
                style={{ background: statusHex[st], "--status-color": statusHex[st] } as React.CSSProperties}
                onMouseEnter={() => setHover(st)}
                onMouseLeave={() => setHover(null)}
                onClick={() => setFilter(st)}
              >
                <div className="dashboard__stat-value">{stats[st]}</div>
                <div className="dashboard__stat-label">{statusLabels[st]}</div>
                {filter === st && <div className="dashboard__stat-indicator" />}
              </div>
            ))}
          </div>
        </div>

        {/* Middle - vehicles list */}
        <div className="dashboard__vehicles-column">
          <div className="dashboard__vehicles-header">
            <h3>Vehicles</h3>
            <div className="dashboard__select-all">
              <input
                type="checkbox"
                id="selectAll"
                checked={isAllSelected}
                onChange={handleSelectAll}
              />
              <label htmlFor="selectAll">Select All</label>
            </div>
          </div>

          <div className="dashboard__vehicles-list">
            {filteredVehicles.length > 0 ? (
              filteredVehicles.map((vehicle) => (
                <div key={vehicle.id} className="dashboard__vehicle-item">
                  <div className="dashboard__vehicle-row">
                    <input
                      type="checkbox"
                      checked={selectedVehicles.has(vehicle.id)}
                      onChange={() => handleSelectVehicle(vehicle.id)}
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
                      {vehicle.location || "No destination"}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="dashboard__no-vehicles">No vehicles match the current filter</div>
            )}
          </div>
        </div>

        {/* Right column - Map */}
        <div className="dashboard__map-container">
          <div ref={mapDiv} className="dashboard__map-element" />
        </div>

        {/* Charts sidebar */}
        <div className={`dashboard__charts-sidebar ${isChartExpanded ? "expanded" : ""}`}>
          <div className="dashboard__charts-header">
            <h3>Charts</h3>
            <button className="dashboard__charts-toggle" onClick={toggleChartExpansion}>
              {isChartExpanded ? "«" : "»"}
            </button>
          </div>

          {isChartExpanded ? (
            /* Expanded chart view */
            <div className="dashboard__chart-expanded">
              <div className="dashboard__chart-type-toggle">
                <button
                  className={chartType === "bar" ? "active" : ""}
                  onClick={() => setChartType("bar")}
                >
                  Bar
                </button>
                <button
                  className={chartType === "pie" ? "active" : ""}
                  onClick={() => setChartType("pie")}
                >
                  Pie
                </button>
              </div>

              <div className="dashboard__chart">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === "bar" ? (
                    <BarChart data={chartData}>
                      <XAxis
                        dataKey="name"
                        tickFormatter={twoLine}
                        interval={0}
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="value">
                        {chartData.map((_, i) => (
                          <Cell key={i} fill={statusHex[STATUS_ORDER[i]]} />
                        ))}
                      </Bar>
                    </BarChart>
                  ) : (
                    <PieChart>
                      <Pie
                        data={chartData}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        outerRadius={110}
                        label
                      >
                        {chartData.map((_, i) => (
                          <Cell key={i} fill={statusHex[STATUS_ORDER[i]]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            /* Collapsed thumbnails */
            <div className="dashboard__chart-thumbnails">
              <div
                className="dashboard__thumbnail"
                onClick={() => {
                  setChartType("bar");
                  setIsChartExpanded(true);
                }}
              >
                <svg className="dashboard__thumbnail-svg dashboard__thumbnail-svg--bar">
                  <rect x="5" y="10" width="8" height="30" fill={statusHex.outbound} />
                  <rect x="18" y="15" width="8" height="25" fill={statusHex.inbound} />
                  <rect x="31" y="5" width="8" height="35" fill={statusHex.transit} />
                  <rect x="44" y="25" width="8" height="15" fill={statusHex.standby} />
                </svg>
                <span>Bar Chart</span>
              </div>
              <div
                className="dashboard__thumbnail"
                onClick={() => {
                  setChartType("pie");
                  setIsChartExpanded(true);
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
                    stroke={statusHex.outbound}
                    strokeWidth="20"
                    strokeDasharray="25 100"
                    strokeDashoffset="-40"
                  />
                  <circle
                    cx="30"
                    cy="25"
                    r="20"
                    fill="transparent"
                    stroke={statusHex.inbound}
                    strokeWidth="20"
                    strokeDasharray="15 110"
                    strokeDashoffset="-65"
                  />
                  <circle
                    cx="30"
                    cy="25"
                    r="20"
                    fill="transparent"
                    stroke={statusHex.transit}
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
      </div>
    </div>
  );
};

export default HaulerDashboard;