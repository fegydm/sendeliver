// File: front/src/components/hauler/content/MapMarkers.ts
// Last change: Fixed TypeScript errors and simplified parking marker logic

import L from "leaflet";
import { Vehicle, VehicleStatus, statusHex } from "../../../data/mockFleet";
import mockLocations from "../../../data/mockLocations";

// Main vehicle markers (dynamic gradient pie + static)
export function addVehicleMarkers(
  map: L.Map,
  vehicles: Vehicle[],
  dimAll: boolean
): Record<string, L.Marker> {
  const markers: Record<string, L.Marker> = {};
  vehicles.forEach((v) => {
    const locationId = v.currentLocation || v.location;
    if (!locationId) return;
    const loc = mockLocations.find((l) => l.id === locationId);
    if (!loc) return;
    const coords: [number, number] = [loc.latitude, loc.longitude];

    const isDynamic = [
      VehicleStatus.Outbound,
      VehicleStatus.Inbound,
      VehicleStatus.Transit,
      VehicleStatus.Waiting,
      VehicleStatus.Break,
    ].includes(v.dashboardStatus);

    const color = statusHex[v.dashboardStatus];

    const html = isDynamic
      ? `<div class="marker-gradient-pie" style="background: conic-gradient(
           #fff 0deg 90deg,
           ${color} 90deg 180deg,
           #fff 180deg 270deg,
           ${color} 270deg 360deg
         );"><div class="marker-gradient-inner"></div></div>`
      : `<div class="marker-static"></div>`;

    const marker = L.marker(coords, {
      icon: L.divIcon({
        className: `vehicle-marker ${isDynamic ? "dynamic" : "static"} status--${v.dashboardStatus}`,
        iconSize: isDynamic ? [26, 26] : [18, 18],
        iconAnchor: isDynamic ? [13, 13] : [9, 9],
        html,
      }),
      zIndexOffset: isDynamic ? 1000 : 800,
    }).addTo(map);

    if (dimAll && marker.getElement()) {
      marker.getElement()!.style.opacity = "0.15";
    }

    markers[v.id] = marker;
  });
  return markers;
}

// Current location circle markers
export function addCurrentCircles(
  map: L.Map,
  vehicles: Vehicle[],
  dimAll: boolean
): Record<string, L.CircleMarker> {
  const circles: Record<string, L.CircleMarker> = {};
  vehicles.forEach((v) => {
    const locationId = v.currentLocation;
    if (!locationId) return;
    const loc = mockLocations.find((l) => l.id === locationId);
    if (!loc) return;
    const coords: [number, number] = [loc.latitude, loc.longitude];

    const color = statusHex[v.dashboardStatus];

    const circle = L.circleMarker(coords, {
      radius: 8,
      color,
      fillColor: color,
      fillOpacity: dimAll ? 0.15 : 0.75,
      weight: 2,
    }).addTo(map);

    circles[v.id] = circle;
  });
  return circles;
}

// Parking markers (use nearestParking property)
export function addParkingMarkers(
  map: L.Map,
  vehicles: Vehicle[],
  dimAll: boolean
): Record<string, L.Marker> {
  const parking: Record<string, L.Marker> = {};

  vehicles.forEach((v) => {
    if (!v.nearestParking) return;
    const loc = mockLocations.find((l) => l.id === v.nearestParking);
    if (!loc) return;
    const coords: [number, number] = [loc.latitude, loc.longitude];

    const marker = L.marker(coords, {
      icon: L.divIcon({
        className: "parking-marker",
        iconSize: [18, 18],
        iconAnchor: [9, 9],
        html: `<div class="marker-static"></div>`,
      }),
      zIndexOffset: 900,
    }).addTo(map);

    if (dimAll && marker.getElement()) {
      marker.getElement()!.style.opacity = "0.15";
    }

    parking[v.id] = marker;
  });

  return parking;
}
