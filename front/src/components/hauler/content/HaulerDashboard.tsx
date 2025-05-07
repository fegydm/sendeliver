// File: front/src/components/hauler/content/HaulerDashboard.tsx
// 6-status dashboard (outbound, inbound, transit, standby, depot, maintenance)
// BEM block: dashboard

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

import { mockVehicles, Vehicle } from "@/data/mockFleet";
import {
  VehicleStatus,
  STATUS_ORDER,
  statusHex,
  statusLabels,
} from "@/constants/vehicleStatus";

/* ------------------------------------------------------------------ */
/* helpers & lookup tables                                            */
/* ------------------------------------------------------------------ */

/** Pozície pre pár európskych miest (demo) */
const destinationCoords: Record<string, [number, number]> = {
  Bratislava: [48.1486, 17.1077],
  Praha: [50.0755, 14.4378],
  Viedeň: [48.2082, 16.3738],
  Budapešť: [47.4979, 19.0402],
  Brno: [49.1951, 16.6068],
  Berlín: [52.52, 13.405],
  Frankfurt: [50.1109, 8.6821],
  Mníchov: [48.1351, 11.582],
  Žilina:     [49.2231, 18.7394],
  Trnava:     [48.3774, 17.5872],
};

type VehicleStats = Record<VehicleStatus, number>;
const emptyStats = (): VehicleStats =>
  STATUS_ORDER.reduce(
    (a, s) => ({ ...a, [s]: 0 }),
    {} as VehicleStats,
  );

/** dvojriadkový tick (Out\nbound) */
const twoLine = (s: string) => s.replace(" ", "\n");

/* ------------------------------------------------------------------ */
/* leaflet sprite fix                                                 */
/* ------------------------------------------------------------------ */
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* ------------------------------------------------------------------ */
/* main component                                                     */
/* ------------------------------------------------------------------ */
const HaulerDashboard: React.FC = () => {
  const [vehicles] = useState<Vehicle[]>(mockVehicles);
  const [stats, setStats] = useState<VehicleStats>(emptyStats);
  const [filter, setFilter] = useState<VehicleStatus | "all">("all");
  const [hover, setHover] = useState<VehicleStatus | null>(null);
  const [chartType, setChartType] = useState<"bar" | "pie">("bar");

  /* refs pre mapu */
  const mapDiv = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markers = useRef<Record<string, L.Marker>>({});

  /* ❶ spočítaj štatistiky po načítaní dát */
  useEffect(() => {
    const s = emptyStats();
    vehicles.forEach((v) => (s[v.dashboardStatus] += 1));
    setStats(s);
  }, [vehicles]);

 /* --- (re-)initialise Leaflet map ---------------------------------- */
useEffect(() => {
  if (!mapDiv.current) return;

  /* remove old map */
  mapRef.current?.remove();
  markers.current = {};

  const map = L.map(mapDiv.current).setView([49, 15], 6);
  mapRef.current = map;

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);

  /* helper: create coloured divIcon */
  const statusIcon = (st: VehicleStatus) =>
    L.divIcon({
      className: `status-icon status-icon--${st}`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });

  const visible =
    filter === "all"
      ? vehicles
      : vehicles.filter((v) => v.dashboardStatus === filter);

  visible.forEach((v) => {
    if (!v.location) return;
    const coords = destinationCoords[v.location];
    if (!coords) return;

    const marker = L.marker(coords, { icon: statusIcon(v.dashboardStatus) })
      .addTo(map)
      .bindPopup(
        `<b>${v.name}</b><br>${statusLabels[v.dashboardStatus]}`
      );

    markers.current[v.id] = marker;
  });
}, [vehicles, filter]);


  /* ❸ hover → skry marker */
  useEffect(() => {
    Object.entries(markers.current).forEach(([id, m]) => {
      const el = m.getElement();
      if (!el) return;
      const st = vehicles.find((v) => v.id === id)?.dashboardStatus;
      if (!st) return;
      el.classList.toggle("marker--hidden", !!hover && st !== hover);
    });
  }, [hover, vehicles]);

  /* ❹ data pre graf */
  const chartData = STATUS_ORDER.map((s) => ({
    name: statusLabels[s],
    value: stats[s],
  }));

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <h1 className="dashboard__title">Vehicle Overview</h1>
      </header>

      {/* filter */}
      <div className="dashboard__filter">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
        >
          <option value="all">All</option>
          {STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {statusLabels[s]}
            </option>
          ))}
        </select>
      </div>

      {/* grid: stats | map | chart */}
      <div className="dashboard__grid">
        {/* 2×3 squares */}
        <div className="dashboard__stats">
          {[
            "outbound",
            "inbound",
            "transit",
            "standby",
            "depot",
            "maintenance",
          ].map((st) => (
            <div
              key={st}
              className={`dashboard__stat dashboard__stat--${st}${
                hover === st ? " dashboard__stat--active" : ""
              }`}
              style={{ background: statusHex[st as VehicleStatus] }}
              onMouseEnter={() => setHover(st as VehicleStatus)}
              onMouseLeave={() => setHover(null)}
              onClick={() => setFilter(st as VehicleStatus)}
            >
              <div className="dashboard__stat-value">
                {stats[st as VehicleStatus]}
              </div>
              <div className="dashboard__stat-label">
                {statusLabels[st as VehicleStatus]}
              </div>
            </div>
          ))}
        </div>

        {/* middle big map */}
        <div className="dashboard__map">
          <div ref={mapDiv} style={{ width: "100%", height: "100%" }} />
        </div>

        {/* right chart */}
        <div className="dashboard__chart">
          <div className="dashboard__chart-toggle">
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

          <ResponsiveContainer width="100%" height={300}>
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
                  outerRadius={80}
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
    </div>
  );
};

export default HaulerDashboard;
