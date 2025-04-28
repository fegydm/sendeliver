// File: ./front/src/components/hauler/content/HaulerDashboard.tsx
// Last change: Fixed Leaflet integration using react-leaflet with properly structured components

import React, { useState, useEffect, useRef } from "react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./dashboard.css";
import { mockVehicles, mockTrips, Vehicle, Trip } from "@/data/mockFleet";
import { mockPeople, Person } from "@/data/mockPeople";

// Oprava predvolenej ikony pre Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Typy pre štatistiky
interface VehicleStats {
  export: number;
  import: number;
  ready: number;
  base: number;
}

// GPS súradnice pre destinácie
const destinationCoords: { [key: string]: [number, number] } = {
  Praha: [50.0755, 14.4378],
  Viedeň: [48.2082, 16.3738],
  Budapešť: [47.4979, 19.0402],
  Brno: [49.1951, 16.6068],
  Ostrava: [49.8209, 18.2625],
  Berlín: [52.5200, 13.4050],
  Varšava: [52.2297, 21.0122],
  Žilina: [49.2231, 18.7394],
  "Banská Bystrica": [48.7357, 19.1451],
  Košice: [48.7164, 21.2611],
  Prešov: [48.9984, 21.2339],
  Mnichov: [48.1351, 11.5820],
  Frankfurt: [50.1109, 8.6821],
  Bratislava: [48.1486, 17.1077],
  Nitra: [48.3069, 18.0859],
  Trenčín: [48.8945, 18.0444],
};

// Farby pre grafy
const COLORS = ["#2196f3", "#4caf50", "#ff9800", "#f44336"];

// Mapovanie slovenských stavov na dashboard stavy
const mapStatusToDashboard = (status: string, destination: string): "export" | "import" | "ready" | "base" => {
  if (status === "Pripravená") return "ready";
  if (status === "Parkovisko" || status === "Servis") return "base";
  if (status === "Na trase") {
    if (["Praha", "Viedeň", "Budapešť", "Brno", "Ostrava", "Berlín", "Varšava", "Mnichov", "Frankfurt"].includes(destination)) {
      return "export";
    }
    return "import";
  }
  return "base";
};

const HaulerDashboard: React.FC = () => {
  const [stats, setStats] = useState<VehicleStats>({ export: 0, import: 0, ready: 0, base: 0 });
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [chartType, setChartType] = useState<"bar" | "pie">("bar");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef<HTMLDivElement>(null);

  // Načítanie a spracovanie dát
  useEffect(() => {
    const processData = () => {
      setIsLoading(true);

      const processedVehicles = mockVehicles.map(vehicle => {
        const vehicleTrips = mockTrips
          .filter(trip => trip.vehicleId === vehicle.id)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const latestTrip = vehicleTrips[0];

        const dashboardStatus = latestTrip
          ? mapStatusToDashboard(vehicle.status, latestTrip.destination)
          : mapStatusToDashboard(vehicle.status, vehicle.location || "");

        return { ...vehicle, dashboardStatus };
      });

      const statsData: VehicleStats = {
        export: processedVehicles.filter(v => v.dashboardStatus === "export").length,
        import: processedVehicles.filter(v => v.dashboardStatus === "import").length,
        ready: processedVehicles.filter(v => v.dashboardStatus === "ready").length,
        base: processedVehicles.filter(v => v.dashboardStatus === "base").length,
      };

      setVehicles(processedVehicles);
      setStats(statsData);
      setIsLoading(false);
    };

    processData();
  }, []);

  // Inicializácia Leaflet mapy priamo použitím DOM
  useEffect(() => {
    if (isLoading || !mapRef.current) return;

    // Vyčistenie predchádzajúcej mapy, ak existuje
    mapRef.current.innerHTML = '';
    
    // Vytvorenie novej mapy
    const map = L.map(mapRef.current).setView([48.1486, 17.1077], 6);

    // Pridanie OpenStreetMap podkladovej vrstvy
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Filtrované vozidlá
    const filteredVehicles = filterStatus === "all" 
      ? vehicles 
      : vehicles.filter(v => v.dashboardStatus === filterStatus);

    // Pridanie markerov pre vozidlá
    filteredVehicles.forEach(vehicle => {
      const latestTrip = mockTrips
        .filter(trip => trip.vehicleId === vehicle.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      
      const coords = latestTrip
        ? destinationCoords[latestTrip.destination]
        : destinationCoords[vehicle.location || "Bratislava"];
      
      if (!coords) return;

      const marker = L.marker(coords).addTo(map);
      
      marker.bindPopup(`
        <b>Vehicle:</b> ${vehicle.name}<br>
        <b>Status:</b> ${vehicle.dashboardStatus}<br>
        <b>Driver:</b> ${vehicle.driver || "None"}<br>
        <b>Location:</b> ${latestTrip?.destination || vehicle.location}<br>
        <b>Last Update:</b> ${latestTrip ? new Date(latestTrip.date).toLocaleString("en-GB") : "-"}
      `);
    });

    // Cleanup pri odmountovaní
    return () => {
      map.remove();
    };
  }, [vehicles, isLoading, filterStatus]);

  // Dáta pre graf
  const chartData = [
    { name: "Export", value: stats.export },
    { name: "Import", value: stats.import },
    { name: "Ready", value: stats.ready },
    { name: "Base", value: stats.base },
  ];

  // Nájdenie vodiča podľa mena (nepoužíva sa v tejto verzii)
  const findDriver = (driverName: string | undefined): Person | undefined => {
    return mockPeople.find(person => `${person.firstName} ${person.lastName}` === driverName);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header animate-in">
        <h1>VEHICLE OVERVIEW</h1>
        <p className="dashboard-subheader">(Exporting, Importing, Ready, Base)</p>
      </div>

      {isLoading ? (
        <div className="dashboard-loading animate-in">
          <div className="spinner"></div>
          <p>Loading data...</p>
        </div>
      ) : (
        <>
          {/* Filter */}
          <div className="dashboard-filter">
            <label htmlFor="status-filter">Filter by Status: </label>
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
            {/* Ľavá sekcia: Tabuľa so štatistikami */}
            <div className="dashboard-stats animate-in">
              <div className="stat-card export">
                <h2>EXPORT</h2>
                <div className="stat-value">{stats.export}</div>
              </div>
              <div className="stat-card import">
                <h2>IMPORT</h2>
                <div className="stat-value">{stats.import}</div>
              </div>
              <div className="stat-card ready">
                <h2>READY</h2>
                <div className="stat-value">{stats.ready}</div>
              </div>
              <div className="stat-card base">
                <h2>BASE</h2>
                <div className="stat-value">{stats.base}</div>
              </div>
            </div>

            {/* Stredná sekcia: Mapa */}
            <div className="dashboard-map animate-in">
              <div ref={mapRef} style={{ height: "100%", width: "100%" }}></div>
            </div>

            {/* Pravá sekcia: Graf */}
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
                      <Bar dataKey="value" fill="#8884d8">
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
        </>
      )}
    </div>
  );
};

export default HaulerDashboard;