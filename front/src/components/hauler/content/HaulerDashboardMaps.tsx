import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./dashboard.maps.css";
import { Vehicle, VehicleStatus } from "../../../data/mockFleet";
import mockLocations from "../../../data/mockLocations";
import { addVehicleMarkers, addCurrentCircles, addParkingMarkers } from "./MapMarkers";
import { addRoutePolylines, addFlagMarkers } from "./MapRoutes";

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

  const vehicleMarkers = useRef<Record<string, L.Marker>>({});
  const currentCircles = useRef<Record<string, L.CircleMarker>>({});
  const parkingMarkers = useRef<Record<string, L.Marker>>({});
  const routeLayers = useRef<Record<string, L.Polyline>>({});
  const startFlagMarkers = useRef<Record<string, L.Marker>>({});
  const destFlagMarkers = useRef<Record<string, L.Marker>>({});

  const defaultFitBounds = useRef<L.LatLngBounds | null>(null);
  const defaultZoom = useRef<number | null>(null);

  const dimAll = filters.length === 0;

  const allPossibleStatuses: VehicleStatus[] = [
    VehicleStatus.Outbound,
    VehicleStatus.Inbound,
    VehicleStatus.Transit,
    VehicleStatus.Waiting,
    VehicleStatus.Break,
    VehicleStatus.Standby,
    VehicleStatus.Depot,
    VehicleStatus.Service,
  ];

  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

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

    let debounceTimeout: NodeJS.Timeout | null = null;
    const handleMapUpdate = () => {
      if (!mapRef.current) return;
      if (debounceTimeout) clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        mapRef.current!.invalidateSize();
      }, 300);
    };
    map.on("zoomend moveend", handleMapUpdate);

    return () => {
      if (mapRef.current) {
        mapRef.current.off("zoomend moveend", handleMapUpdate);
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (debounceTimeout) clearTimeout(debounceTimeout);
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    const latlngs: [number, number][] = [];
    vehicles.forEach((v) => {
      const primaryLoc = mockLocations.find((l) => l.id === (v.currentLocation || v.location));
      if (primaryLoc) latlngs.push([primaryLoc.latitude, primaryLoc.longitude]);
      if (v.start) {
        const startLoc = mockLocations.find((l) => l.id === v.start);
        if (startLoc) latlngs.push([startLoc.latitude, startLoc.longitude]);
      }
      if (v.destination) {
        const destLoc = mockLocations.find((l) => l.id === v.destination);
        if (destLoc) latlngs.push([destLoc.latitude, destLoc.longitude]);
      }
    });
    console.log(`MAP: Updating defaultFitBounds, vehicles:`, vehicles.map(v => ({ id: v.id, status: v.status, locations: { current: v.currentLocation || v.location, start: v.start, destination: v.destination } })));
    console.log(`MAP: Latlngs for defaultFitBounds:`, latlngs);
    if (latlngs.length > 0) {
      defaultFitBounds.current = L.latLngBounds(latlngs);
      defaultZoom.current = mapRef.current.getBoundsZoom(defaultFitBounds.current);
      console.log(`MAP: defaultFitBounds set:`, defaultFitBounds.current.toBBoxString(), `defaultZoom:`, defaultZoom.current);
    } else {
      defaultFitBounds.current = null;
      defaultZoom.current = null;
      console.log(`MAP: No valid latlngs for defaultFitBounds`);
    }
  }, [vehicles]);

  useEffect(() => {
    if (!mapRef.current) return;

    console.log(`MAP: Redrawing map, filters:`, filters, `visibleVehicles:`, visibleVehicles.map(v => ({ id: v.id, status: v.status })));

    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) return;
      layer.remove();
    });

    const allMode = filters.length === 0;
    const isAllStatusesSelected = filters.length === allPossibleStatuses.length && allPossibleStatuses.every(status => filters.includes(status));
    const vehiclesToRender = allMode || isAllStatusesSelected ? vehicles : visibleVehicles;
    console.log(`MAP: Adding layers for vehicles:`, vehiclesToRender.map(v => ({ id: v.id, status: v.status })));

    vehicleMarkers.current = addVehicleMarkers(mapRef.current, vehiclesToRender, dimAll);
    currentCircles.current = addCurrentCircles(mapRef.current, vehiclesToRender, dimAll);
    parkingMarkers.current = addParkingMarkers(mapRef.current, vehiclesToRender, dimAll);
    routeLayers.current = addRoutePolylines(mapRef.current, vehiclesToRender, dimAll);

    if (showFlags) {
      const flags = addFlagMarkers(mapRef.current, vehiclesToRender, dimAll);
      startFlagMarkers.current = flags.start;
      destFlagMarkers.current = flags.destination;
      console.log(`MAP: Flags added:`, Object.keys(startFlagMarkers.current));
    } else {
      startFlagMarkers.current = {};
      destFlagMarkers.current = {};
      console.log(`MAP: Flags disabled`);
    }

    const allLayers: L.Layer[] = [
      ...Object.values(vehicleMarkers.current),
      ...Object.values(currentCircles.current),
      ...Object.values(parkingMarkers.current),
      ...Object.values(routeLayers.current),
      ...Object.values(startFlagMarkers.current),
      ...Object.values(destFlagMarkers.current),
    ];
    console.log(`MAP: Total layers added:`, allLayers.length);

    if (allLayers.length > 0) {
      if ((allMode || isAllStatusesSelected) && defaultFitBounds.current && defaultFitBounds.current.isValid()) {
        console.log(`MAP: Fitting to defaultFitBounds:`, defaultFitBounds.current.toBBoxString());
        mapRef.current.fitBounds(defaultFitBounds.current, {
          padding: [20, 20],
          maxZoom: defaultZoom.current || 8,
        });
        if (defaultZoom.current) {
          mapRef.current.setZoom(defaultZoom.current);
          console.log(`MAP: Set zoom to:`, defaultZoom.current);
        }
      } else if (allMode) {
        const latlngs = vehicles
          .map((v) => {
            const loc = mockLocations.find((l) => l.id === (v.currentLocation || v.location));
            return loc ? [loc.latitude, loc.longitude] : null;
          })
          .filter(Boolean) as [number, number][];
        console.log(`MAP: ALL mode fallback, latlngs:`, latlngs);
        if (latlngs.length > 0) {
          const bounds = L.latLngBounds(latlngs);
          mapRef.current.fitBounds(bounds, { padding: [20, 20], maxZoom: 8 });
          console.log(`MAP: Fitted to fallback bounds:`, bounds.toBBoxString());
        } else {
          console.log(`MAP: No valid latlngs for ALL mode fallback`);
        }
      } else {
        const filteredLayers = [];
        for (const vehicle of visibleVehicles) {
          if (vehicleMarkers.current[vehicle.id]) filteredLayers.push(vehicleMarkers.current[vehicle.id]);
          if (currentCircles.current[vehicle.id]) filteredLayers.push(currentCircles.current[vehicle.id]);
          if (parkingMarkers.current[vehicle.id]) filteredLayers.push(parkingMarkers.current[vehicle.id]);
          if (routeLayers.current[vehicle.id]) filteredLayers.push(routeLayers.current[vehicle.id]);
          if (startFlagMarkers.current[vehicle.id]) filteredLayers.push(startFlagMarkers.current[vehicle.id]);
          if (destFlagMarkers.current[vehicle.id]) filteredLayers.push(destFlagMarkers.current[vehicle.id]);
        }
        console.log(`MAP: Filtered layers for visibleVehicles:`, filteredLayers.length, visibleVehicles.map(v => v.id));
        if (filteredLayers.length > 0) {
          const bounds = L.featureGroup(filteredLayers).getBounds();
          if (bounds.isValid()) {
            let maxZoom = 8;
            if (
              bounds.getNorthEast().lat - bounds.getSouthWest().lat > 5 ||
              bounds.getNorthEast().lng - bounds.getSouthWest().lng > 5
            ) {
              maxZoom = 7;
            }
            mapRef.current.fitBounds(bounds, {
              padding: [20, 20],
              maxZoom,
            });
            console.log(`MAP: Fitted to filtered bounds:`, bounds.toBBoxString(), `maxZoom:`, maxZoom);
          } else {
            console.log(`MAP: Invalid bounds for filtered layers`);
          }
        } else {
          console.log(`MAP: No filtered layers to fit`);
        }
      }
    } else {
      console.log(`MAP: No layers to display`);
    }

    mapRef.current.invalidateSize();
    console.log(`MAP: Map invalidated`);
  }, [vehicles, visibleVehicles, filters, selectedVehicles, showFlags, isChartExpanded, isVehiclesExpanded]);

  useEffect(() => {
    const shouldDim = filters.length === 0;
    console.log(`MAP: Applying dim logic, shouldDim:`, shouldDim);
    [vehicleMarkers.current, currentCircles.current, parkingMarkers.current, startFlagMarkers.current, destFlagMarkers.current].forEach(
      (refMap) =>
        Object.values(refMap).forEach((layer: any) => {
          if (layer.getElement && layer.getElement()) {
            layer.getElement()!.style.opacity = shouldDim ? "0.15" : "1";
          } else if (layer.setStyle) {
            layer.setStyle({ opacity: shouldDim ? 0.15 : 0.6 });
          }
        })
    );
    Object.values(routeLayers.current).forEach((polyline) => {
      polyline.setStyle({ opacity: shouldDim ? 0.15 : 0.6 });
    });
  }, [filters]);

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