// File: front/src/components/hauler/content/MapRoutes.ts
import L from "leaflet";
import { Vehicle, VehicleStatus, statusHex } from "../../../data/mockFleet";
import mockLocations from "../../../data/mockLocations";

// Route polylines (start, current, dest)
export function addRoutePolylines(
  map: L.Map,
  vehicles: Vehicle[],
  dimAll: boolean
): Record<string, L.Polyline> {
  const routeLayers: Record<string, L.Polyline> = {};
  vehicles.forEach((v) => {
    // Only dynamic vehicles with route
    if (
      ![
        VehicleStatus.Outbound,
        VehicleStatus.Inbound,
        VehicleStatus.Transit,
        VehicleStatus.Waiting,
        VehicleStatus.Break,
      ].includes(v.dashboardStatus)
    )
      return;
    const routePoints: [number, number][] = [];
    const startLoc = v.start && mockLocations.find((loc) => loc.id === v.start);
    const currentLoc =
      v.currentLocation && mockLocations.find((loc) => loc.id === v.currentLocation);
    const destLoc = v.destination && mockLocations.find((loc) => loc.id === v.destination);

    if (startLoc) routePoints.push([startLoc.latitude, startLoc.longitude]);
    if (currentLoc) routePoints.push([currentLoc.latitude, currentLoc.longitude]);
    if (destLoc) routePoints.push([destLoc.latitude, destLoc.longitude]);

    if (routePoints.length >= 2) {
      const polyline = L.polyline(routePoints, {
        color: statusHex[v.dashboardStatus],
        weight: 3,
        opacity: dimAll ? 0.15 : 0.6,
      }).addTo(map);
      routeLayers[v.id] = polyline;
    }
  });
  return routeLayers;
}

// Start/destination flag markers (svg chessboard & S)
export function addFlagMarkers(
  map: L.Map,
  vehicles: Vehicle[],
  dimAll: boolean
): { start: Record<string, L.Marker>; destination: Record<string, L.Marker> } {
  const startMarkers: Record<string, L.Marker> = {};
  const destinationMarkers: Record<string, L.Marker> = {};

  vehicles.forEach((v) => {
    const status = v.dashboardStatus as VehicleStatus;
    // Start flag
    if (v.start) {
      const startLoc = mockLocations.find((loc) => loc.id === v.start);
      if (startLoc) {
        const marker = L.marker([startLoc.latitude, startLoc.longitude], {
          icon: L.divIcon({
            className: "start-marker",
            iconSize: [24, 24],
            iconAnchor: [4, 24],
            html: `<svg width="24" height="24" viewBox="0 0 24 24">
              <rect x="4" y="0" width="20" height="16" fill="#4a4a4a" stroke="#000" stroke-width="1"/>
              <text x="14" y="12" font-size="10" font-weight="bold" fill="#fff" text-anchor="middle">S</text>
              <line x1="4" y1="0" x2="4" y2="24" stroke="#000" stroke-width="2"/>
              <circle cx="12" cy="20" r="5" fill="${statusHex[status]}"/>
            </svg>`,
          }),
          zIndexOffset: 900,
        }).addTo(map);
        if (dimAll && marker.getElement()) marker.getElement()!.style.opacity = "0.15";
        startMarkers[v.id] = marker;
      }
    }
    // Destination flag (checkered)
    if (v.destination) {
      const destLoc = mockLocations.find((loc) => loc.id === v.destination);
      if (destLoc) {
        const marker = L.marker([destLoc.latitude, destLoc.longitude], {
          icon: L.divIcon({
            className: "destination-marker",
            iconSize: [24, 24],
            iconAnchor: [4, 24],
            html: `<svg width="24" height="24" viewBox="0 0 24 24">
                <rect x="4" y="0" width="20" height="16" fill="#fff" stroke="#000" stroke-width="1"/>
                <rect x="4" y="0" width="5" height="4" fill="#000"/>
                <rect x="14" y="0" width="5" height="4" fill="#000"/>
                <rect x="9" y="4" width="5" height="4" fill="#000"/>
                <rect x="19" y="4" width="5" height="4" fill="#000"/>
                <rect x="4" y="8" width="5" height="4" fill="#000"/>
                <rect x="14" y="8" width="5" height="4" fill="#000"/>
                <rect x="9" y="12" width="5" height="4" fill="#000"/>
                <rect x="19" y="12" width="5" height="4" fill="#000"/>
                <line x1="4" y1="0" x2="4" y2="24" stroke="#000" stroke-width="2"/>
                <circle cx="12" cy="20" r="5" fill="${statusHex[status]}"/>
            </svg>`,
          }),
          zIndexOffset: 900,
        }).addTo(map);
        if (dimAll && marker.getElement()) marker.getElement()!.style.opacity = "0.15";
        destinationMarkers[v.id] = marker;
      }
    }
  });
  return { start: startMarkers, destination: destinationMarkers };
}
