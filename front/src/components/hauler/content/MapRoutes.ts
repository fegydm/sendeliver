// File: front/src/components/hauler/content/MapRoutes.ts
// Last change: Use statusHex colors for polylines and flag circles

import L from "leaflet";
import { Vehicle, VehicleStatus, statusHex } from "../../../data/mockFleet";
import mockLocations from "../../../data/mockLocations";

export function addRoutePolylines(
  map: L.Map,
  vehicles: Vehicle[],
  dimAll: boolean
): Record<string, L.Polyline> {
  const routeLayers: Record<string, L.Polyline> = {};

  vehicles.forEach((v) => {
    if (
      ![
        VehicleStatus.Outbound,
        VehicleStatus.Inbound,
        VehicleStatus.Transit,
        VehicleStatus.Waiting,
        VehicleStatus.Break,
      ].includes(v.dashboardStatus)
    ) {
      return;
    }

    const points: [number, number][] = [];
    const startLoc = v.start && mockLocations.find((l) => l.id === v.start);
    const currentLoc =
      v.currentLocation && mockLocations.find((l) => l.id === v.currentLocation);
    const destLoc = v.destination && mockLocations.find((l) => l.id === v.destination);

    if (startLoc) points.push([startLoc.latitude, startLoc.longitude]);
    if (currentLoc) points.push([currentLoc.latitude, currentLoc.longitude]);
    if (destLoc) points.push([destLoc.latitude, destLoc.longitude]);

    if (points.length >= 2) {
      const color = statusHex[v.dashboardStatus];
      const polyline = L.polyline(points, {
        color,
        weight: 4,
        opacity: dimAll ? 0.15 : 0.8,
      }).addTo(map);
      routeLayers[v.id] = polyline;
    }
  });

  return routeLayers;
}

export function addFlagMarkers(
  map: L.Map,
  vehicles: Vehicle[],
  dimAll: boolean
): { start: Record<string, L.Marker>; destination: Record<string, L.Marker> } {
  const startMarkers: Record<string, L.Marker> = {};
  const destinationMarkers: Record<string, L.Marker> = {};

  vehicles.forEach((v) => {
    const color = statusHex[v.dashboardStatus];
    // Start flag
    if (v.start) {
      const loc = mockLocations.find((l) => l.id === v.start);
      if (loc) {
        const marker = L.marker([loc.latitude, loc.longitude], {
          icon: L.divIcon({
            className: "start-marker",
            iconSize: [24, 24],
            iconAnchor: [12, 24],
            html: `<div class="flag-circle" style="
              width:16px; height:16px; border-radius:50%;
              background:${color};
              border:2px solid #fff;
            "></div>`,
          }),
          zIndexOffset: 900,
        }).addTo(map);
        if (dimAll && marker.getElement()) {
          marker.getElement()!.style.opacity = "0.15";
        }
        startMarkers[v.id] = marker;
      }
    }
    // Destination flag
    if (v.destination) {
      const loc = mockLocations.find((l) => l.id === v.destination);
      if (loc) {
        const marker = L.marker([loc.latitude, loc.longitude], {
          icon: L.divIcon({
            className: "destination-marker",
            iconSize: [24, 24],
            iconAnchor: [12, 24],
            html: `<div class="flag-circle" style="
              width:16px; height:16px; border-radius:50%;
              background:${color};
              border:2px dashed #fff;
            "></div>`,
          }),
          zIndexOffset: 900,
        }).addTo(map);
        if (dimAll && marker.getElement()) {
          marker.getElement()!.style.opacity = "0.15";
        }
        destinationMarkers[v.id] = marker;
      }
    }
  });

  return { start: startMarkers, destination: destinationMarkers };
}
