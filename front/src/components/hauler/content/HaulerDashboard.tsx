// File: front/src/components/hauler/content/HaulerDashboard.tsx
// Last change: Cleaned up JSX structure and fixed unbalanced tags

import React, { useState, useEffect, useRef } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./dashboard.css";
import { mockVehicles, mockTrips, Vehicle } from "@/data/mockFleet";

interface VehicleStats {
  export: number;
  import: number;
  ready: number;
  base: number;
}

const destinationCoords: Record<string, [number, number]> = {
  // ...coords...
};
const COLORS = ["#2196f3", "#4caf50", "#ff9800", "#f44336"];

const mapStatusToDashboard = (
  status: string,
  destination: string
): "export" | "import" | "ready" | "base" => {
  if (status === "Pripravená") return "ready";
  if (status === "Parkovisko" || status === "Servis") return "base";
  if (status === "Na trase") {
    const exportCities = [
      "Praha",
      "Viedeň",
      "Budapešť",
      "Brno",
      "Ostrava",
      "Berlín",
      "Varšava",
      "Mnichov",
      "Frankfurt",
    ];
    return exportCities.includes(destination) ? "export" : "import";
  }
  return "base";
};

// Fix Leaflet icon URLs
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const HaulerDashboard: React.FC = () => {
  const [stats, setStats] = useState<VehicleStats>({ export: 0, import: 0, ready: 0, base: 0 });
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [chartType, setChartType] = useState<"bar" | "pie">("bar");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoading(true);
    const processed = mockVehicles.map((v) => {
      const status = v.dashboardStatus ?? mapStatusToDashboard(v.status, v.location || "");
      return { ...v, dashboardStatus: status };
    });
    setVehicles(processed);
    setStats({
      export: processed.filter((v) => v.dashboardStatus === "export").length,
      import: processed.filter((v) => v.dashboardStatus === "import").length,
      ready: processed.filter((v) => v.dashboardStatus === "ready").length,
      base: processed.filter((v) => v.dashboardStatus === "base").length,
    });
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isLoading || !mapRef.current) return;
    mapRef.current.innerHTML = "";
    const map = L.map(mapRef.current).setView([48.1486, 17.1077], 6);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    const list =
      filterStatus === "all"
        ? vehicles
        : vehicles.filter((v) => v.dashboardStatus === filterStatus);

    list.forEach((v) => {
      const trips = mockTrips.filter((t) => t.vehicleId === v.id);
      const latest = trips.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      const coords = latest
        ? destinationCoords[latest.destination]
        : destinationCoords[v.location || "Bratislava"];
      if (!coords) return;
      L.marker(coords)
        .addTo(map)
        .bindPopup(
          `<b>Vehicle:</b> ${v.name}<br>` +
            `<b>Status:</b> ${v.dashboardStatus}<br>` +
            `<b>Driver:</b> ${v.driver || "None"}<br>` +
            `<b>Location:</b> ${latest?.destination || v.location}<br>` +
            `<b>Last Update:</b> ${
              latest ? new Date(latest.date).toLocaleString("en-GB") : "-"
            }`
        );
    });

    return () => { map.remove(); };
  }, [vehicles, isLoading, filterStatus]);

  const chartData = [
    { name: "Export", value: stats.export },
    { name: "Import", value: stats.import },
    { name: "Ready", value: stats.ready },
    { name: "Base", value: stats.base },
  ];

  if (isLoading) {
    return (
      <div className="dashboard-loading animate-in">
        <div className="spinner" />
        <p>Loading data...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header animate-in">
        <h1>VEHICLE OVERVIEW</h1>
        <p className="dashboard-subheader">(Export, Import, Ready, Base)</p>
      </div>

      <div className="dashboard-filter animate-in">
        <label htmlFor="status-filter">Filter by Status:</label>
        <select
          id="status-filter"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All</option>
          <option value="export">Export</option>
          <option value="import">Import</option>
          <option value="ready">Ready</option>
          <option value="base">Base</option>
        </select>
      </div>

      <div className="dashboard-grid">
        {/* Statistiky */}
        <div className="dashboard-stats animate-in">
          <div className="stats-table">
            <div className="stats-row">
              <div className="stat-cell export">
                <div className="stat-value">{stats.export}</div>
                <div className="stat-label">Export</div>
              </div>
              <div className="stat-cell import">
                <div className="stat-value">{stats.import}</div>
                <div className="stat-label">Import</div>
              </div>
            </div>
            <div className="stats-row">
              <div className="stat-cell ready">
                <div className="stat-value">{stats.ready}</div>
                <div className="stat-label">Ready</div>
              </div>
              <div className="stat-cell base">
                <div className="stat-value">{stats.base}</div>
                <div className="stat-label">Base</div>
              </div>
            </div>
          </div>
        </div>

        {/* Mapa */}
        <div className="dashboard-map animate-in">
          <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
        </div>

        {/* Graf */}
        <div className="dashboard-chart animate-in">
          <div className="chart-toggle">
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
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              {chartType === "bar" ? (
                <BarChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value">
                    {chartData.map((entry, idx) => (
                      <Cell
                        key={idx}
                        fill={COLORS[idx % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label
                  >
                    {chartData.map((entry, idx) => (
                      <Cell
                        key={idx}
                        fill={COLORS[idx % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HaulerDashboard;
