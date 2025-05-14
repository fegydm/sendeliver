// File: front/src/components/hauler/content/HaulerDashboard.tsx
// Description: Dashboard component for vehicle fleet management with map, filters, and charts
// Last change: Optimized performance with useMemo, lazy loading markers, fixed marker positions

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
import { mockVehicles, VehicleStatus } from "../../../data/mockFleet";
import mockLocations from "../../../data/mockLocations";

// Enum for delay status
enum DelayStatus {
  None = "none",
  Minor = "minor",
  Major = "major",
}

// Map positionColor to DelayStatus
const positionColorToDelayStatus: Record<string, DelayStatus> = {
  G: DelayStatus.None,
  O: DelayStatus.Minor,
  R: DelayStatus.Major,
};

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
  [VehicleStatus.Service]: "#d726ff",
};

const statusLabels: Record<VehicleStatus, string> = {
  [VehicleStatus.Outbound]: "Out bound",
  [VehicleStatus.Inbound]: "In bound",
  [VehicleStatus.Transit]: "Transit",
  [VehicleStatus.Standby]: "Standby",
  [VehicleStatus.Depot]: "Depot",
  [VehicleStatus.Service]: "Service",
};

// Interface for vehicle data
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
  positionColor?: "G" | "O" | "R";
}

// Vehicle type images
const vehicleTypeImages: Record<string, string> = {
  tractor: "/vehicles/truck-icon.svg",
  van: "/vehicles/van-icon.svg",
  trailer: "/vehicles/trailer-icon.svg",
  rigid: "/vehicles/lorry-icon.svg",
};

const defaultVehicleImage = "/vehicles/default-icon.svg";

type VehicleStats = Record<VehicleStatus, number>;
const emptyStats = (): VehicleStats =>
  STATUS_ORDER.reduce(
    (a, s) => ({ ...a, [s]: 0 }),
    {} as VehicleStats,
  );

// Two-line tick formatter
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
  const [filters, setFilters] = useState<VehicleStatus[]>([]);
  const [hover, setHover] = useState<VehicleStatus | null>(null);
  const [chartType, setChartType] = useState<"bar" | "pie">("bar");
  const [selectedVehicles, setSelectedVehicles] = useState<Set<string>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [isChartExpanded, setIsChartExpanded] = useState(false);
  const [isVehiclesExpanded, setIsVehiclesExpanded] = useState(false);
  const [showFlags, setShowFlags] = useState(true);

  // Memoize filtered vehicles to avoid unnecessary recalculations
  const visible = React.useMemo(() => {
    return vehicles.filter(
      (v) =>
        (filters.length === 0 || filters.includes(v.dashboardStatus)) &&
        (selectedVehicles.size === 0 || selectedVehicles.has(v.id))
    );
  }, [vehicles, filters, selectedVehicles]);

  // Refs for map
  const mapDiv = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markers = useRef<Record<string, L.Marker>>({});
  const routeLayers = useRef<Record<string, L.Polyline>>({});
  const startMarkers = useRef<Record<string, L.Marker>>({});
  const destinationMarkers = useRef<Record<string, L.Marker>>({});

  // Calculate stats on data load
  useEffect(() => {
    const s = emptyStats();
    vehicles.forEach((v) => (s[v.dashboardStatus] += 1));
    setStats(s);
  }, [vehicles]);

  // Initialize Leaflet map (runs only once)
  useEffect(() => {
    if (!mapDiv.current) return;

    // Clean up any existing map
    if (mapRef.current) {
      mapRef.current.off();
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Clear Leaflet attributes from container
    mapDiv.current.innerHTML = "";
    delete mapDiv.current.dataset.leafletId;

    const map = L.map(mapDiv.current, {
      zoomAnimation: false, // Disable zoom animation to reduce tile requests
      fadeAnimation: false, // Disable fade animation for faster rendering
    }).setView([49, 15], 6);
    mapRef.current = map;

    // Use OpenTopoMap with enhanced caching
    L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
      attribution: "Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)",
      subdomains: ["a", "b", "c"],
      maxZoom: 17,
      tileSize: 256,
      updateWhenIdle: true,
      keepBuffer: 6, // Increased buffer for smoother panning
      crossOrigin: true // Enable CORS for better caching
      // Optional: Switch to MapTiler if OpenTopoMap rate limits persist
      // L.tileLayer("https://api.maptiler.com/maps/topo-v2/{z}/{x}/{y}.png?key=YOUR_MAPTILER_API_KEY", {
      //   attribution: "Map data: © MapTiler, © OpenStreetMap contributors",
      //   maxZoom: 17,
      //   tileSize: 256,
      //   updateWhenIdle: true,
      //   keepBuffer: 6,
      // })
    }).addTo(map);

    // Handle zoom and move updates
    let debounceTimeout: NodeJS.Timeout | null = null;
    const handleMapUpdate = () => {
      if (!mapRef.current) return;
      if (debounceTimeout) clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        mapRef.current!.invalidateSize();
        Object.values(markers.current).forEach(marker => {
          if (marker.getElement()) marker.setIcon(marker.getIcon());
        });
        Object.values(startMarkers.current).forEach(marker => {
          if (marker.getElement()) marker.setIcon(marker.getIcon());
        });
        Object.values(destinationMarkers.current).forEach(marker => {
          if (marker.getElement()) marker.setIcon(marker.getIcon());
        });
      }, 300); // Increased debounce to 300ms for zoom/move
    };
    map.on('zoomend moveend', handleMapUpdate); // Handle both zoom and move

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.off('zoomend moveend', handleMapUpdate);
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (debounceTimeout) clearTimeout(debounceTimeout);
    };
  }, []);

  // Update markers and routes
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers and routes
    Object.values(markers.current).forEach(marker => marker.remove());
    Object.values(routeLayers.current).forEach(route => route.remove());
    Object.values(startMarkers.current).forEach(marker => marker.remove());
    Object.values(destinationMarkers.current).forEach(marker => marker.remove());
    markers.current = {};
    routeLayers.current = {};
    startMarkers.current = {};
    destinationMarkers.current = {};

    // Helper: Create colored divIcon for vehicle markers
    const statusIcon = (status: VehicleStatus, positionColor?: "G" | "O" | "R") => {
      const isDynamic = [VehicleStatus.Outbound, VehicleStatus.Inbound, VehicleStatus.Transit].includes(status);
      const delayClass = positionColor ? `delay--${positionColorToDelayStatus[positionColor]}` : "";
      const iconSize: [number, number] = isDynamic ? [26, 26] : [18, 18];
      const iconAnchor: [number, number] = isDynamic ? [13, 26] : [9, 18]; // Adjusted anchor to center marker
      return L.divIcon({
        className: `vehicle-marker ${isDynamic ? "dynamic" : "static"} status-icon--${status} ${delayClass}`,
        iconSize,
        iconAnchor,
        html: `<div class="marker-inner"></div>`,
      });
    };

    // Helper: Create divIcon for start marker (dark gray flag with white 'S')
    const startIcon = (status: VehicleStatus) => L.divIcon({
      className: "start-marker",
      iconSize: [24, 24],
      iconAnchor: [4, 24], // Adjusted anchor to align with pole
      html: `
        <svg width="24" height="24" viewBox="0 0 24 24">
          <!-- Flag: dark gray with white 'S' -->
          <rect x="4" y="0" width="20" height="16" fill="#4a4a4a" stroke="#000" stroke-width="1"/>
          <text x="14" y="12" font-size="10" font-weight="bold" fill="#fff" text-anchor="middle">S</text>
          <!-- Pole -->
          <line x1="4" y1="0" x2="4" y2="24" stroke="#000" stroke-width="2"/>
          <!-- Status-colored circle -->
          <circle cx="12" cy="20" r="5" fill="${statusHex[status]}"/>
        </svg>
      `,
    });

    // Helper: Create divIcon for destination marker (checkered flag)
    const destinationIcon = (status: VehicleStatus) => L.divIcon({
      className: "destination-marker",
      iconSize: [24, 24],
      iconAnchor: [4, 24], // Adjusted anchor to align with pole
      html: `
        <svg width="24" height="24" viewBox="0 0 24 24">
          <!-- Checkered flag: 4x4 grid -->
          <rect x="4" y="0" width="20" height="16" fill="#fff" stroke="#000" stroke-width="1"/>
          <rect x="4" y="0" width="5" height="4" fill="#000"/>
          <rect x="14" y="0" width="5" height="4" fill="#000"/>
          <rect x="9" y="4" width="5" height="4" fill="#000"/>
          <rect x="19" y="4" width="5" height="4" fill="#000"/>
          <rect x="4" y="8" width="5" height="4" fill="#000"/>
          <rect x="14" y="8" width="5" height="4" fill="#000"/>
          <rect x="9" y="12" width="5" height="4" fill="#000"/>
          <rect x="19" y="12" width="5" height="4" fill="#000"/>
          <!-- Pole -->
          <line x1="4" y1="0" x2="4" y2="24" stroke="#000" stroke-width="2"/>
          <!-- Status-colored circle -->
          <circle cx="12" cy="20" r="5" fill="${statusHex[status]}"/>
        </svg>
      `,
    });

    visible.forEach((v) => {
      // Vehicle marker
      const locationId = v.currentLocation || v.location;
      if (!locationId) return;
      const location = mockLocations.find((loc) => loc.id === locationId);
      if (!location) return;

      const coords: [number, number] = [location.latitude, location.longitude];
      // Skip markers outside current map bounds
      const bounds = mapRef.current!.getBounds();
      if (!bounds.contains(coords)) return;

      // Routes and start/destination markers for dynamic statuses (added first for layering)
      if ([VehicleStatus.Outbound, VehicleStatus.Inbound, VehicleStatus.Transit].includes(v.dashboardStatus)) {
        const routePoints: [number, number][] = [];
        // Start
        if (v.start && showFlags) {
          const startLoc = mockLocations.find((loc) => loc.id === v.start);
          if (startLoc) {
            routePoints.push([startLoc.latitude, startLoc.longitude]);
            const startMarker = L.marker([startLoc.latitude, startLoc.longitude], {
              icon: startIcon(v.dashboardStatus),
              zIndexOffset: 900,
            })
              .addTo(mapRef.current!)
              .bindPopup(`Start: ${startLoc.city}`);
            startMarkers.current[v.id] = startMarker;
          }
        } else if (v.start) {
          const startLoc = mockLocations.find((loc) => loc.id === v.start);
          if (startLoc) {
            routePoints.push([startLoc.latitude, startLoc.longitude]);
          }
        }
        // Current location
        if (v.currentLocation) {
          routePoints.push([location.latitude, location.longitude]);
        }
        // Destination
        if (v.destination && showFlags) {
          const destLoc = mockLocations.find((loc) => loc.id === v.destination);
          if (destLoc) {
            routePoints.push([destLoc.latitude, destLoc.longitude]);
            const destMarker = L.marker([destLoc.latitude, destLoc.longitude], {
              icon: destinationIcon(v.dashboardStatus),
              zIndexOffset: 900,
            })
              .addTo(mapRef.current!)
              .bindPopup(`Destination: ${destLoc.city}`);
            destinationMarkers.current[v.id] = destMarker;
          }
        } else if (v.destination) {
          const destLoc = mockLocations.find((loc) => loc.id === v.destination);
          if (destLoc) {
            routePoints.push([destLoc.latitude, destLoc.longitude]);
          }
        }
        // Draw route
        if (routePoints.length >= 2) {
          const polyline = L.polyline(routePoints, {
            color: statusHex[v.dashboardStatus],
            weight: 3,
            opacity: 0.6,
          }).addTo(mapRef.current!);
          routeLayers.current[v.id] = polyline;
        }
      }

      // Vehicle marker (added after routes for layering)
      const popupContent = `
        <b>${v.name}</b><br>
        ${v.plateNumber}<br>
        ${statusLabels[v.dashboardStatus]}<br>
        ${v.start ? `Start: ${mockLocations.find(loc => loc.id === v.start)?.city || v.start}<br>` : ""}
        ${v.currentLocation ? `Current: ${mockLocations.find(loc => loc.id === v.currentLocation)?.city || v.currentLocation}<br>` : ""}
        ${v.destination ? `Destination: ${mockLocations.find(loc => loc.id === v.destination)?.city || v.destination}` : v.location ? mockLocations.find(loc => loc.id === v.location)?.city || v.location : "No location"}
      `;

      const marker = L.marker(coords, {
        icon: statusIcon(v.dashboardStatus, v.positionColor),
        zIndexOffset: 1000,
      })
        .addTo(mapRef.current!)
        .bindPopup(popupContent);

      markers.current[v.id] = marker;
    });

    // Fit bounds to include all markers and routes
    const allLayers: L.Layer[] = [];
    Object.values(markers.current).forEach(marker => allLayers.push(marker));
    Object.values(startMarkers.current).forEach(marker => allLayers.push(marker));
    Object.values(destinationMarkers.current).forEach(marker => allLayers.push(marker));
    Object.values(routeLayers.current).forEach(route => allLayers.push(route));

    if (allLayers.length > 0) {
      const bounds = L.featureGroup(allLayers).getBounds();
      // Ensure bounds are valid
      if (bounds.isValid()) {
        if (allLayers.length === 1) {
          mapRef.current!.fitBounds(bounds, {
            padding: [50, 50],
            maxZoom: 10,
          });
        } else {
          mapRef.current!.fitBounds(bounds, {
            padding: [50, 50],
            maxZoom: 15, // Increased maxZoom for better visibility
          });
        }
      } else {
        console.warn("Invalid bounds, falling back to default view");
        mapRef.current!.setView([49, 15], 6);
      }
    }

    // Handle column expansion/collapse
    const timeout = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 300); // Increased delay to debounce
    return () => clearTimeout(timeout); // Clean up timeout
  }, [vehicles, filters, selectedVehicles, isChartExpanded, isVehiclesExpanded, showFlags, visible]);

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

  // Filter vehicles based on current filters
  const filteredVehicles = vehicles.filter(
    (v) => filters.length === 0 || filters.includes(v.dashboardStatus)
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

  // Handle status filter toggle
  const handleToggleFilter = (status: VehicleStatus) => {
    setFilters((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  // Handle reset filter (toggle all)
  const handleResetFilter = () => {
    setFilters((prev) =>
      prev.length === STATUS_ORDER.length ? [] : [...STATUS_ORDER]
    );
  };

  // Toggle chart expansion
  const toggleChartExpansion = () => {
    setIsChartExpanded(!isChartExpanded);
    const timeout = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 300);
    return () => clearTimeout(timeout);
  };

  // Toggle vehicles column expansion
  const toggleVehiclesExpansion = () => {
    setIsVehiclesExpanded(!isVehiclesExpanded);
    const timeout = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 300);
    return () => clearTimeout(timeout);
  };

  // Toggle flags visibility
  const toggleFlags = () => {
    setShowFlags(!showFlags);
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
        } ${isVehiclesExpanded ? "dashboard__content--vehicles-expanded" : ""}`}
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
                  filters.includes(st) ? "dashboard__stat--active" : ""
                } ${hover === st ? "dashboard__stat--hover" : ""}`}
                style={{ background: statusHex[st], "--status-color": statusHex[st] } as React.CSSProperties}
                onMouseEnter={() => setHover(st)}
                onMouseLeave={() => setHover(null)}
                onClick={() => handleToggleFilter(st)}
              >
                <div className="dashboard__stat-value">{stats[st]}</div>
                <div className="dashboard__stat-label">{statusLabels[st]}</div>
                {filters.includes(st) && <div className="dashboard__stat-indicator" />}
              </div>
            ))}
          </div>
        </div>

        {/* Middle - vehicles list */}
        <div className={`dashboard__vehicles-column ${isVehiclesExpanded ? "expanded" : ""}`}>
          <div className="dashboard__vehicles-header">
            <h3>Vehicles</h3>
            <div className="dashboard__vehicles-actions">
              <div className="dashboard__select-all">
                <input
                  type="checkbox"
                  id="selectAll"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                />
                <label htmlFor="selectAll">Select All</label>
              </div>
              <button className="dashboard__vehicles-toggle" onClick={toggleVehiclesExpansion}>
                {isVehiclesExpanded ? "«" : "»"}
              </button>
            </div>
          </div>

          <div className="dashboard__vehicles-list">
            {filteredVehicles.length > 0 ? (
              filteredVehicles.map((vehicle) => {
                const locationId = vehicle.currentLocation || vehicle.location;
                const locationName = locationId
                  ? mockLocations.find((loc) => loc.id === locationId)?.city || "No location"
                  : "No location";

                return (
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
                        {locationName}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="dashboard__no-vehicles">No vehicles match the current filter</div>
            )}
          </div>
        </div>

        {/* Right column - Map */}
        <div className="dashboard__map-container">
          <div className="dashboard__map-controls">
            <label className="dashboard__flag-toggle">
              <input
                type="checkbox"
                checked={showFlags}
                onChange={toggleFlags}
              />
              Show Start/Destination Flags
            </label>
          </div>
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
      </div>
    </div>
  );
};

export default HaulerDashboard;