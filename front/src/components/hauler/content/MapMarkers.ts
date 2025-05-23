// File: front/src/components/hauler/content/MapMarkers.ts
// Last change: Updated addParkingMarkers to include SVG icon and free/occupied status colors

import L from "leaflet";
import { Vehicle, VehicleStatus, statusHex } from "@/data/mockFleet";
import StartFlag from "@/assets/flags/StartFlag.svg";
import FinishFlag from "@/assets/flags/FinishFlag.svg";
import "./MapMarkers.css";

const DYNAMIC_STATUSES: VehicleStatus[] = [
  VehicleStatus.Outbound,
  VehicleStatus.Inbound,
  VehicleStatus.Transit,
  VehicleStatus.Waiting,
  VehicleStatus.Break,
];

export function addVehicleMarkers(
  map: L.Map,
  vehicles: Vehicle[],
  dimAll: boolean,
  mockLocations: typeof import("@/data/mockLocations").default
): Record<string, L.Marker> {
  const markers: Record<string, L.Marker> = {};
  vehicles.forEach((v) => {
    const idLoc = v.currentLocation || v.location;
    if (!idLoc) return;
    const loc = mockLocations.find((l) => l.id === idLoc);
    if (!loc) return;
    const isDynamic = DYNAMIC_STATUSES.includes(v.dashboardStatus);
    const marker = L.marker([loc.latitude, loc.longitude], {
      icon: L.divIcon({
        className: [
          "vehicle-marker",
          isDynamic ? "dynamic" : "static",
          `status-${v.dashboardStatus}`,
          dimAll ? "dimmed" : "",
        ].join(" "),
        html: "",
      }),
    }).addTo(map);
    markers[v.id] = marker;
  });
  return markers;
}

export function addCurrentCircles(
  map: L.Map,
  vehicles: Vehicle[],
  dimAll: boolean,
  mockLocations: typeof import("@/data/mockLocations").default
): Record<string, L.CircleMarker> {
  const circles: Record<string, L.CircleMarker> = {};
  vehicles.forEach((v) => {
    if (!v.currentLocation) return;
    const loc = mockLocations.find((l) => l.id === v.currentLocation);
    if (!loc) return;
    const circle = L.circleMarker([loc.latitude, loc.longitude], {
      className: [
        "current-circle",
        `status-${v.dashboardStatus}`,
        dimAll ? "dimmed" : "",
      ].join(" "),
      radius: 8,
    }).addTo(map);
    circles[v.id] = circle;
  });
  return circles;
}

export function addParkingMarkers(
  map: L.Map,
  vehicles: Vehicle[],
  dimAll: boolean,
  mockLocations: typeof import("@/data/mockLocations").default
): Record<string, L.Marker> {
  const parking: Record<string, L.Marker> = {};
  vehicles.forEach((v) => {
    if (!v.nearestParking) return;
    const loc = mockLocations.find((l) => l.id === v.nearestParking);
    if (!loc) return;
    const marker = L.marker([loc.latitude, loc.longitude], {
      icon: L.divIcon({
        className: [
          "parking-marker",
          `status-${loc.status || 'free'}`,
          dimAll ? "dimmed" : "",
        ].join(" "),
        html: `<svg width="18" height="18" viewBox="0 0 18 18"><circle cx="9" cy="9" r="7" stroke="#333" stroke-width="2" /><text x="5" y="12" fill="#333" font-size="10" font-weight="bold">P</text></svg>`,
        iconSize: [18, 18],
      }),
    }).addTo(map);
    marker.bindTooltip(`${loc.name} (${loc.status || 'free'})`, { direction: 'top', offset: [0, -10] });
    parking[v.id] = marker;
  });
  return parking;
}

export function addRoutePolylines(
  map: L.Map,
  vehicles: Vehicle[],
  dimAll: boolean,
  mockLocations: typeof import("@/data/mockLocations").default,
  showPolylines: boolean,
  polylineOpacity: number
): Record<string, L.Polyline> {
  const layers: Record<string, L.Polyline> = {};
  vehicles.forEach((v) => {
    if (!DYNAMIC_STATUSES.includes(v.dashboardStatus)) return;
    const start = v.start && mockLocations.find((l) => l.id === v.start);
    const curr = v.currentLocation && mockLocations.find((l) => l.id === v.currentLocation);
    const dest = v.destination && mockLocations.find((l) => l.id === v.destination);
    if (showPolylines) {
      const pts: [number, number][] = [];
      if (start) pts.push([start.latitude, start.longitude]);
      if (curr) pts.push([curr.latitude, curr.longitude]);
      if (dest) pts.push([dest.latitude, dest.longitude]);
      if (pts.length < 2) return;
      const poly = L.polyline(pts, {
        className: [
          "route-polyline",
          `status-${v.dashboardStatus}`,
          dimAll ? "dimmed" : "",
        ].join(" "),
        opacity: polylineOpacity,
      }).addTo(map);
      layers[v.id] = poly;
    } else {
      if (start && curr) {
        const startCurr: [number, number][] = [
          [start.latitude, start.longitude],
          [curr.latitude, curr.longitude],
        ];
        const poly1 = L.polyline(startCurr as L.LatLngExpression[], {
          className: [
            "route-polyline",
            "start-current",
            `status-${v.dashboardStatus}`,
            dimAll ? "dimmed" : "",
          ].join(" "),
          opacity: polylineOpacity,
        }).addTo(map);
        layers[`${v.id}-start`] = poly1;
      }
      if (curr && dest) {
        const currDest: [number, number][] = [
          [curr.latitude, curr.longitude],
          [dest.latitude, dest.longitude],
        ];
        const poly2 = L.polyline(currDest as L.LatLngExpression[], {
          className: [
            "route-polyline",
            "current-destination",
            `status-${v.dashboardStatus}`,
            dimAll ? "dimmed" : "",
          ].join(" "),
          opacity: polylineOpacity,
        }).addTo(map);
        layers[`${v.id}-dest`] = poly2;
      }
    }
  });
  return layers;
}

export function addFlagMarkers(
  map: L.Map,
  vehicles: Vehicle[],
  dimAll: boolean,
  mockLocations: typeof import("@/data/mockLocations").default
): { start: Record<string, L.Marker>; destination: Record<string, L.Marker> } {
  const start: Record<string, L.Marker> = {};
  const destination: Record<string, L.Marker> = {};
  vehicles.forEach((v) => {
    if (v.start) {
      const loc = mockLocations.find((l) => l.id === v.start);
      if (!loc) return;
      const m = L.marker([loc.latitude, loc.longitude], {
        icon: L.icon({
          iconUrl: StartFlag,
          className: [
            "flag-marker",
            "start",
            `status-${v.dashboardStatus}`,
            dimAll ? "dimmed" : "",
          ].join(" "),
        }),
      }).addTo(map);
      start[v.id] = m;
    }
    if (v.destination) {
      const loc = mockLocations.find((l) => l.id === v.destination);
      if (!loc) return;
      const m = L.marker([loc.latitude, loc.longitude], {
        icon: L.icon({
          iconUrl: FinishFlag,
          className: [
            "flag-marker",
            "destination",
            `status-${v.dashboardStatus}`,
            dimAll ? "dimmed" : "",
          ].join(" "),
        }),
      }).addTo(map);
      destination[v.id] = m;
    }
  });
  return { start, destination };
}