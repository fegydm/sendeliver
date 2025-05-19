// File: front/src/components/hauler/content/MapMarkers.ts
import L from "leaflet";
import { Vehicle, VehicleStatus, statusHex } from "../../../data/mockFleet";
import mockLocations, { Location } from "../../../data/mockLocations";

// Main vehicle markers
export function addVehicleMarkers(
  map: L.Map,
  vehicles: Vehicle[],
  dimAll: boolean
): Record<string, L.Marker> {
  const markers: Record<string, L.Marker> = {};
  vehicles.forEach((v) => {
    const locationId = v.currentLocation || v.location;
    if (!locationId) return;
    const location = mockLocations.find((loc) => loc.id === locationId);
    if (!location) return;
    const coords: [number, number] = [location.latitude, location.longitude];
    const isDynamic = [
      VehicleStatus.Outbound,
      VehicleStatus.Inbound,
      VehicleStatus.Transit,
      VehicleStatus.Waiting,
      VehicleStatus.Break,
    ].includes(v.dashboardStatus);

    const marker = L.marker(coords, {
      icon: L.divIcon({
        className: `vehicle-marker ${isDynamic ? "dynamic" : "static"} status-icon--${v.dashboardStatus}`,
        iconSize: isDynamic ? [26, 26] : [18, 18],
        iconAnchor: isDynamic ? [13, 13] : [9, 9],
        html: `<div class="marker-inner"></div>`,
      }),
      zIndexOffset: 1000,
    }).addTo(map);

    if (dimAll && marker.getElement()) marker.getElement()!.style.opacity = "0.15";
    markers[v.id] = marker;
  });
  return markers;
}

// Current location circle marker
export function addCurrentCircles(
  map: L.Map,
  vehicles: Vehicle[],
  dimAll: boolean
): Record<string, L.CircleMarker> {
  const circles: Record<string, L.CircleMarker> = {};
  vehicles.forEach((v) => {
    const locationId = v.currentLocation || v.location;
    if (!locationId) return;
    const location = mockLocations.find((loc) => loc.id === locationId);
    if (!location) return;
    const coords: [number, number] = [location.latitude, location.longitude];

    const circle = L.circleMarker(coords, {
      radius: 9,
      color: "#fff",
      fillColor: statusHex[v.dashboardStatus],
      fillOpacity: dimAll ? 0.15 : 0.75,
      weight: 2,
    }).addTo(map);

    circles[v.id] = circle;
  });
  return circles;
}

// Parking marker
export function addParkingMarkers(
  map: L.Map,
  vehicles: Vehicle[],
  dimAll: boolean
): Record<string, L.Marker> {
  const parkingMarkers: Record<string, L.Marker> = {};
  const parkingLocations = mockLocations.filter(
    (loc): loc is Location & { type: "parking" } => loc.type === "parking"
  );

  vehicles.forEach((v) => {
    // Only for dynamic vehicles
    if (
      ![
        VehicleStatus.Outbound,
        VehicleStatus.Inbound,
        VehicleStatus.Transit,
        VehicleStatus.Break,
      ].includes(v.dashboardStatus)
    )
      return;

    const locationId = v.currentLocation || v.location;
    if (!locationId) return;
    const location = mockLocations.find((loc) => loc.id === locationId);
    if (!location) return;
    const coords: [number, number] = [location.latitude, location.longitude];

    // Find nearest parking
    let nearestParking: (Location & { type: "parking" }) | null = null;
    let minDist = Infinity;
    parkingLocations.forEach((park) => {
      const dLat = (park.latitude - coords[0]) * Math.PI / 180;
      const dLon = (park.longitude - coords[1]) * Math.PI / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(coords[0] * Math.PI / 180) *
        Math.cos(park.latitude * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const dist = 6371 * c;
      if (dist < minDist) {
        minDist = dist;
        nearestParking = park;
      }
    });

    if (nearestParking) {
      const parking = nearestParking as Location;
      const parkMarker = L.marker(
        [parking.latitude, parking.longitude],
        {
          icon: L.divIcon({
            className: `parking-marker parking-marker--${parking.status || "free"}`,
            iconSize: [22, 22],
            iconAnchor: [11, 11],
            html: `<div class="parking-marker-inner">${
              parking.status === "free"
                ? `<svg width="22" height="22"><circle cx="11" cy="11" r="10" fill="#34495e" stroke="#27ae60" stroke-width="3"/><text x="11" y="15" text-anchor="middle" font-size="13" fill="#fff" font-family="Arial" font-weight="bold">P</text></svg>`
                : `<svg width="22" height="22"><circle cx="11" cy="11" r="10" fill="#34495e" stroke="#e74c3c" stroke-width="3"/><text x="11" y="15" text-anchor="middle" font-size="13" fill="#fff" font-family="Arial" font-weight="bold">P</text></svg>`
            }</div>`,
          }),
          zIndexOffset: 950,
        }
      )
        .addTo(map)
        .bindPopup(`Parking: ${parking.city}`);
      if (dimAll && parkMarker.getElement()) parkMarker.getElement()!.style.opacity = "0.15";
      parkingMarkers[v.id] = parkMarker;
    }
  });

  return parkingMarkers;
}
