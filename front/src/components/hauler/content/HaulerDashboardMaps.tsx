// File: front/src/components/hauler/content/HaulerDashboardMaps.tsx
// Last change: TypeScript errors fixed, explicit enum casts, Location typing, parking marker fix

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./dashboard.maps.css";
import { Vehicle, VehicleStatus } from "../../../data/mockFleet";
import mockLocations, { Location } from "../../../data/mockLocations";

// Enum pre delay status
enum DelayStatus {
  None = "none",
  Minor = "minor",
  Major = "major",
}

const positionColorToDelayStatus: Record<string, DelayStatus> = {
  G: DelayStatus.None,
  O: DelayStatus.Minor,
  R: DelayStatus.Major,
};

const statusHex: Record<VehicleStatus, string> = {
  [VehicleStatus.Outbound]: "#2389ff",
  [VehicleStatus.Inbound]: "#1fbac7",
  [VehicleStatus.Transit]: "#7a63ff",
  [VehicleStatus.Waiting]: "#5958c8",
  [VehicleStatus.Break]: "#34495e",
  [VehicleStatus.Standby]: "#b5bd00",
  [VehicleStatus.Depot]: "#6b7684",
  [VehicleStatus.Service]: "#d726ff",
};

const statusLabels: Record<VehicleStatus, string> = {
  [VehicleStatus.Outbound]: "Out bound",
  [VehicleStatus.Inbound]: "In bound",
  [VehicleStatus.Transit]: "Transit",
  [VehicleStatus.Waiting]: "Waiting",
  [VehicleStatus.Break]: "Break",
  [VehicleStatus.Standby]: "Standby",
  [VehicleStatus.Depot]: "Depot",
  [VehicleStatus.Service]: "Service",
};

// Props s typmi
interface HaulerDashboardMapsProps {
  vehicles: Vehicle[];
  visibleVehicles: Vehicle[];
  filters: VehicleStatus[];
  selectedVehicles: Set<string>;
  hover: VehicleStatus | null;
  showFlags: boolean;
  onToggleFlags: () => void;
  isChartExpanded: boolean;
  isVehiclesExpanded: boolean;
}

const HaulerDashboardMaps: React.FC<HaulerDashboardMapsProps> = ({
  vehicles,
  visibleVehicles,
  filters,
  selectedVehicles,
  hover,
  showFlags,
  onToggleFlags,
  isChartExpanded,
  isVehiclesExpanded,
}) => {
  const mapDiv = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markers = useRef<Record<string, L.Marker>>({});
  const routeLayers = useRef<Record<string, L.Polyline>>({});
  const startMarkers = useRef<Record<string, L.Marker>>({});
  const destinationMarkers = useRef<Record<string, L.Marker>>({});
  const parkingMarkers = useRef<Record<string, L.Marker>>({});

  // Leaflet Sprite fix
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  // Inicializácia mapy len raz
  useEffect(() => {
    if (!mapDiv.current) return;

    if (mapRef.current) {
      mapRef.current.off();
      mapRef.current.remove();
      mapRef.current = null;
    }

    mapDiv.current.innerHTML = "";
    delete mapDiv.current.dataset.leafletId;

    const map = L.map(mapDiv.current, {
      zoomAnimation: false,
      fadeAnimation: false,
    }).setView([49, 15], 6);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
      attribution: "Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)",
      subdomains: ["a", "b", "c"],
      maxZoom: 17,
      tileSize: 256,
      updateWhenIdle: true,
      keepBuffer: 6,
      crossOrigin: true,
    }).addTo(map);

    // Re-validate veľkosť na resize, zoom, move
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
        Object.values(parkingMarkers.current).forEach(marker => {
          if (marker.getElement()) marker.setIcon(marker.getIcon());
        });
      }, 300);
    };
    map.on('zoomend moveend', handleMapUpdate);

    return () => {
      if (mapRef.current) {
        mapRef.current.off('zoomend moveend', handleMapUpdate);
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (debounceTimeout) clearTimeout(debounceTimeout);
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    Object.values(markers.current).forEach(marker => marker.remove());
    Object.values(routeLayers.current).forEach(route => route.remove());
    Object.values(startMarkers.current).forEach(marker => marker.remove());
    Object.values(destinationMarkers.current).forEach(marker => marker.remove());
    Object.values(parkingMarkers.current).forEach(marker => marker.remove());
    markers.current = {};
    routeLayers.current = {};
    startMarkers.current = {};
    destinationMarkers.current = {};
    parkingMarkers.current = {};

    // Status ikonky
    const statusIcon = (status: VehicleStatus, positionColor?: "G" | "O" | "R") => {
      const isDynamic = [
        VehicleStatus.Outbound,
        VehicleStatus.Inbound,
        VehicleStatus.Transit,
        VehicleStatus.Waiting,
        VehicleStatus.Break,
      ].includes(status);
      const delayClass = positionColor ? `delay--${positionColorToDelayStatus[positionColor]}` : "";
      if (isDynamic) {
        return L.divIcon({
          className: `vehicle-marker dynamic status-icon--${status} ${delayClass}`,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
          html: `<div class="marker-inner"></div>`,
        });
      }
      return L.divIcon({
        className: `vehicle-marker static status-icon--${status} ${delayClass}`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
        html: `<div class="marker-inner"></div>`,
      });
    };

    // Start/destination/parking ikonky
    const startIcon = (status: VehicleStatus) => L.divIcon({
      className: "start-marker",
      iconSize: [24, 24],
      iconAnchor: [4, 24],
      html: `<svg width="24" height="24" viewBox="0 0 24 24">
          <rect x="4" y="0" width="20" height="16" fill="#4a4a4a" stroke="#000" stroke-width="1"/>
          <text x="14" y="12" font-size="10" font-weight="bold" fill="#fff" text-anchor="middle">S</text>
          <line x1="4" y1="0" x2="4" y2="24" stroke="#000" stroke-width="2"/>
          <circle cx="12" cy="20" r="5" fill="${statusHex[status as VehicleStatus]}"/>
        </svg>`
    });

    const destinationIcon = (status: VehicleStatus) => L.divIcon({
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
          <circle cx="12" cy="20" r="5" fill="${statusHex[status as VehicleStatus]}"/>
        </svg>`
    });

    const parkingIcon = (status: "free" | "occupied") => L.divIcon({
      className: `parking-marker parking-marker--${status}`,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
      html: `<div class="parking-marker-inner">${status === "free"
        ? `<svg width="22" height="22"><circle cx="11" cy="11" r="10" fill="#34495e" stroke="#27ae60" stroke-width="3"/><text x="11" y="15" text-anchor="middle" font-size="13" fill="#fff" font-family="Arial" font-weight="bold">P</text></svg>`
        : `<svg width="22" height="22"><circle cx="11" cy="11" r="10" fill="#34495e" stroke="#e74c3c" stroke-width="3"/><text x="11" y="15" text-anchor="middle" font-size="13" fill="#fff" font-family="Arial" font-weight="bold">P</text></svg>`
      }</div>`
    });

    const parkingLocations: Location[] = mockLocations.filter(loc => loc.type === "parking");

    visibleVehicles.forEach((v) => {
      const locationId = v.currentLocation || v.location;
      if (!locationId) return;
      const location = mockLocations.find((loc) => loc.id === locationId);
      if (!location) return;
      const coords: [number, number] = [location.latitude, location.longitude];
      const bounds = mapRef.current!.getBounds();
      if (!bounds.contains(coords)) return;

      // Trasy
      if (
        [VehicleStatus.Outbound, VehicleStatus.Inbound, VehicleStatus.Transit, VehicleStatus.Waiting, VehicleStatus.Break].includes(
          v.dashboardStatus as VehicleStatus
        )
      ) {
        const routePoints: [number, number][] = [];
        // Start
        if (v.start && showFlags) {
          const startLoc = mockLocations.find((loc) => loc.id === v.start);
          if (startLoc) {
            routePoints.push([startLoc.latitude, startLoc.longitude]);
            const startMarker = L.marker([startLoc.latitude, startLoc.longitude], {
              icon: startIcon(v.dashboardStatus as VehicleStatus),
              zIndexOffset: 900,
            }).addTo(mapRef.current!).bindPopup(`Start: ${startLoc.city}`);
            startMarkers.current[v.id] = startMarker;
          }
        } else if (v.start) {
          const startLoc = mockLocations.find((loc) => loc.id === v.start);
          if (startLoc) routePoints.push([startLoc.latitude, startLoc.longitude]);
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
              icon: destinationIcon(v.dashboardStatus as VehicleStatus),
              zIndexOffset: 900,
            }).addTo(mapRef.current!).bindPopup(`Destination: ${destLoc.city}`);
            destinationMarkers.current[v.id] = destMarker;
          }
        } else if (v.destination) {
          const destLoc = mockLocations.find((loc) => loc.id === v.destination);
          if (destLoc) routePoints.push([destLoc.latitude, destLoc.longitude]);
        }
        if (routePoints.length >= 2) {
          const polyline = L.polyline(routePoints, {
            color: statusHex[v.dashboardStatus as VehicleStatus],
            weight: 3,
            opacity: 0.6,
          }).addTo(mapRef.current!);
          routeLayers.current[v.id] = polyline;
        }
      }

      // Vehicle marker
      const marker = L.marker(coords, {
        icon: statusIcon(v.dashboardStatus as VehicleStatus, v.positionColor),
        zIndexOffset: 1000,
      }).addTo(mapRef.current!);
      markers.current[v.id] = marker;

      // Parking marker (nájdi najbližší parking podľa vzdialenosti)
      if (
        [VehicleStatus.Outbound, VehicleStatus.Inbound, VehicleStatus.Transit, VehicleStatus.Break].includes(
          v.dashboardStatus as VehicleStatus
        )
      ) {
        let nearestParking: Location | null = null;
        let minDist = Infinity;
        parkingLocations.forEach((park: Location) => {
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
          const parkMarker = L.marker(
            [nearestParking.latitude, nearestParking.longitude],
            {
              icon: parkingIcon(
                (nearestParking.status || "free") as "free" | "occupied"
              ),
              zIndexOffset: 950,
            }
          )
            .addTo(mapRef.current!)
            .bindPopup(`Parking: ${nearestParking.city}`);
          parkingMarkers.current[v.id] = parkMarker;
        }
      }
    });

    // Fit bounds na všetky vrstvy
    const allLayers: L.Layer[] = [
      ...Object.values(markers.current),
      ...Object.values(startMarkers.current),
      ...Object.values(destinationMarkers.current),
      ...Object.values(routeLayers.current),
      ...Object.values(parkingMarkers.current),
    ];
    if (allLayers.length > 0) {
      const bounds = L.featureGroup(allLayers).getBounds();
      if (bounds.isValid()) {
        mapRef.current!.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 15,
        });
      }
    }

    const timeout = setTimeout(() => {
      if (mapRef.current) mapRef.current.invalidateSize();
    }, 300);
    return () => clearTimeout(timeout);

  }, [
    vehicles,
    visibleVehicles,
    filters,
    selectedVehicles,
    showFlags,
    isChartExpanded,
    isVehiclesExpanded,
  ]);

  useEffect(() => {
    Object.entries(markers.current).forEach(([id, m]) => {
      const el = m.getElement();
      if (!el) return;
      const v = vehicles.find((v) => v.id === id);
      if (!v) return;
      el.style.opacity =
        !hover || v.dashboardStatus === hover ? "1" : "0.1";
    });
  }, [hover, vehicles]);

  return (
    <div className="dashboard__map-container">
      <div className="dashboard__map-controls">
        <label className="dashboard__flag-toggle">
          <input type="checkbox" checked={showFlags} onChange={onToggleFlags} />
          Show Start/Destination Flags
        </label>
      </div>
      <div ref={mapDiv} className="dashboard__map-element" />
    </div>
  );
};

export default HaulerDashboardMaps;
