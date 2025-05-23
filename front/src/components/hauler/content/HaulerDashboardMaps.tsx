// File: front/src/components/hauler/content/HaulerDashboardMaps.tsx
// Last change: Added routes OC and route markers with solid/dashed polylines

import React, { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./dashboard.maps.css";
import { Vehicle, VehicleStatus } from "@/data/mockFleet";
import mockLocations from "@/data/mockLocations";
import {
  addVehicleMarkers,
  addCurrentCircles,
  addParkingMarkers,
  addRoutePolylines,
  addFlagMarkers,
  addRouteMarkers,
} from "./MapMarkers";
import { 
  addMarkerClickHandlers, 
  addCircleClickHandlers,
  addPolylineClickHandlers
} from "./MapMarkerHandler";
import VehicleDetailModal from "./VehicleDetailModal";
import OpacityControl from "@/components/shared/elements/OpacityControl";
import FinishFlag from "@/assets/flags/FinishFlag.svg";

interface HaulerDashboardMapsProps {
  vehicles: Vehicle[];
  visibleVehicles: Vehicle[];
  filters: VehicleStatus[];
  selectedVehicles: Set<string>;
  showFlags: boolean;
  onToggleFlags: () => void;
  isChartExpanded: boolean;
  isVehiclesExpanded: boolean;
  hover: VehicleStatus | null;
}

const FlagIcon: React.FC<{ enabled: boolean }> = ({ enabled }) => (
  <div className="oc-icon-container">
    <img src={FinishFlag} alt="Flag" style={{ width: "20px", height: "20px" }} />
    {!enabled && <div className="oc-disabled-overlay" />}
  </div>
);

const PolylineIcon: React.FC<{ enabled: boolean }> = ({ enabled }) => (
  <div className="oc-icon-container">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <polygon points="13,1 18,5 2,18" fill="#333" />
    </svg>
    {!enabled && <div className="oc-disabled-overlay" />}
  </div>
);

const GreyscaleIcon: React.FC<{ enabled: boolean }> = ({ enabled }) => (
  <div className="oc-icon-container oc-greyscale-icon">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="2" width="16" height="16" stroke="#333" strokeWidth="2" />
      <line x1="2" y1="8" x2="18" y2="8" stroke="#333" strokeWidth="2" />
      <line x1="2" y1="12" x2="18" y2="12" stroke="#333" strokeWidth="2" />
      <line x1="8" y1="2" x2="8" y2="18" stroke="#333" strokeWidth="2" />
      <line x1="12" y1="2" x2="12" y2="18" stroke="#333" strokeWidth="2" />
    </svg>
    {!enabled && <div className="oc-disabled-overlay" />}
  </div>
);

const ParkingIcon: React.FC<{ enabled: boolean }> = ({ enabled }) => (
  <div className="oc-icon-container oc-parking-icon">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" stroke="#333" strokeWidth="2" />
      <text x="6" y="14" fill="#333">P</text>
    </svg>
    {!enabled && <div className="oc-disabled-overlay" />}
  </div>
);

const RoutesIcon: React.FC<{ enabled: boolean }> = ({ enabled }) => (
  <div className="oc-icon-container oc-routes-icon">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M4 16 Q 8 12, 12 8 Q 16 4, 16 4" stroke="#333" strokeWidth="2" fill="none" />
      <circle cx="4" cy="16" r="2" fill="#333" />
      <circle cx="16" cy="4" r="2" fill="#333" />
    </svg>
    {!enabled && <div className="oc-disabled-overlay" />}
  </div>
);

const HaulerDashboardMaps: React.FC<HaulerDashboardMapsProps> = ({
  vehicles,
  visibleVehicles,
  filters,
  selectedVehicles,
  showFlags,
  onToggleFlags,
  isChartExpanded,
  isVehiclesExpanded,
  hover,
}) => {
  // State for map controls
  const [flagOpacity, setFlagOpacity] = useState(1);
  const [showPolylines, setShowPolylines] = useState(true);
  const [polylineOpacity, setPolylineOpacity] = useState(1);
  const [greyscaleValue, setGreyscaleValue] = useState(1);
  const [showParking, setShowParking] = useState(true);
  const [parkingOpacity, setParkingOpacity] = useState(1);
  const [showRoutes, setShowRoutes] = useState(true);
  const [routeOpacity, setRouteOpacity] = useState(1);
  const [openSlider, setOpenSlider] = useState<string | null>(null);
  
  // State for modal
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const mapDiv = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const vehicleMarkers = useRef<Record<string, L.Marker>>({});
  const currentCircles = useRef<Record<string, L.CircleMarker>>({});
  const parkingMarkers = useRef<Record<string, L.Marker>>({});
  const routeLayers = useRef<Record<string, L.Polyline>>({});
  const startFlagMarkers = useRef<Record<string, L.Marker>>({});
  const destFlagMarkers = useRef<Record<string, L.Marker>>({});
  const routeMarkers = useRef<Record<string, L.CircleMarker>>({});
  const defaultFitBounds = useRef<L.LatLngBounds | null>(null);
  const defaultZoom = useRef<number | null>(null);

  const dimAll = filters.length === 0;
  const allStatuses: VehicleStatus[] = [
    VehicleStatus.Outbound,
    VehicleStatus.Inbound,
    VehicleStatus.Transit,
    VehicleStatus.Waiting,
    VehicleStatus.Break,
    VehicleStatus.Standby,
    VehicleStatus.Depot,
    VehicleStatus.Service,
  ];

  // Vehicle click handler
  const handleVehicleClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
  };

  const applyOpacity = (layer: L.Layer, opacity: number) => {
    if (layer instanceof L.Marker && layer.getElement()) {
      layer.getElement()!.style.opacity = String(opacity);
    } else if (layer instanceof L.Polyline || layer instanceof L.CircleMarker) {
      layer.setStyle({ opacity, fillOpacity: opacity });
    }
  };

  // Toggle layer visibility without map recalculation
  const toggleMarkersVisibility = useCallback((visible: boolean) => {
    Object.values(vehicleMarkers.current).forEach((marker) => {
      const element = marker.getElement();
      if (element) {
        (element as HTMLElement).style.display = visible ? '' : 'none';
      }
    });
  }, []);

  const toggleCirclesVisibility = useCallback((visible: boolean) => {
    Object.values(currentCircles.current).forEach((circle) => {
      const element = circle.getElement();
      if (element) {
        (element as HTMLElement).style.display = visible ? '' : 'none';
      }
    });
  }, []);

  const togglePolylinesVisibility = useCallback((visible: boolean) => {
    Object.values(routeLayers.current).forEach((polyline) => {
      const element = polyline.getElement();
      if (element) {
        (element as HTMLElement).style.display = visible ? '' : 'none';
      }
    });
  }, []);

  const toggleFlagsVisibility = useCallback((visible: boolean) => {
    [...Object.values(startFlagMarkers.current), ...Object.values(destFlagMarkers.current)].forEach((marker) => {
      const element = marker.getElement();
      if (element) {
        (element as HTMLElement).style.display = visible ? '' : 'none';
      }
    });
  }, []);

  const toggleParkingVisibility = useCallback((visible: boolean) => {
    Object.values(parkingMarkers.current).forEach((marker) => {
      const element = marker.getElement();
      if (element) {
        (element as HTMLElement).style.display = visible ? '' : 'none';
      }
    });
  }, []);

  const toggleRoutesVisibility = useCallback((visible: boolean) => {
    Object.values(routeMarkers.current).forEach((marker) => {
      const element = marker.getElement();
      if (element) {
        (element as HTMLElement).style.display = visible ? '' : 'none';
      }
    });
    Object.values(routeLayers.current).forEach((polyline) => {
      const element = polyline.getElement();
      if (element) {
        (element as HTMLElement).style.display = visible ? '' : 'none';
      }
    });
  }, []);

  // Initialize map
  useEffect(() => {
    if (mapRef.current || !mapDiv.current) return;

    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    const map = L.map(mapDiv.current, {
      zoomAnimation: false,
    }).setView([49, 15], 6);

    mapRef.current = map;

    L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
      attribution: "Map data © OpenStreetMap contributors, SRTM | Map style © OpenTopoMap (CC-BY-SA)",
      subdomains: ["a", "b", "c"],
      maxZoom: 17,
      tileSize: 256,
      updateWhenIdle: true,
      keepBuffer: 6,
      crossOrigin: true,
      className: "greyscale-tile",
    }).addTo(map);

    const invalidate = () => {
      map.invalidateSize();
    };
    
    map.on("zoomend moveend", invalidate);

    return () => {
      map.off("zoomend moveend", invalidate);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Calculate default bounds
  useEffect(() => {
    if (!mapRef.current) return;

    const pts: [number, number][] = [];
    vehicles.forEach((v) => {
      const primary = mockLocations.find((l) => l.id === (v.currentLocation || v.location));
      if (primary) pts.push([primary.latitude, primary.longitude]);
      if (v.start) {
        const s = mockLocations.find((l) => l.id === v.start);
        if (s) pts.push([s.latitude, s.longitude]);
      }
      if (v.destination) {
        const d = mockLocations.find((l) => l.id === v.destination);
        if (d) pts.push([d.latitude, d.longitude]);
      }
    });

    if (pts.length) {
      defaultFitBounds.current = L.latLngBounds(pts);
      defaultZoom.current = mapRef.current.getBoundsZoom(defaultFitBounds.current);
    } else {
      defaultFitBounds.current = null;
      defaultZoom.current = null;
    }
  }, [vehicles]);

  // Main map update effect
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    map.eachLayer((layer) => {
      if (!(layer instanceof L.TileLayer)) map.removeLayer(layer);
    });

    const allMode = filters.length === 0;
    const allSelected = filters.length === allStatuses.length && allStatuses.every((s) => filters.includes(s));
    const vehiclesToRender = allMode || allSelected ? vehicles : visibleVehicles;

    const vm = addVehicleMarkers(map, vehiclesToRender, dimAll, mockLocations);
    const cc = addCurrentCircles(map, vehiclesToRender, dimAll, mockLocations);
    const pm = addParkingMarkers(map, vehiclesToRender, dimAll, mockLocations);
    const rl = addRoutePolylines(map, vehiclesToRender, dimAll, mockLocations, showPolylines, polylineOpacity, showRoutes, routeOpacity);
    const flags = addFlagMarkers(map, vehiclesToRender, dimAll, mockLocations);
    const rm = addRouteMarkers(map, vehiclesToRender, dimAll, mockLocations);

    vehicleMarkers.current = vm;
    currentCircles.current = cc;
    parkingMarkers.current = pm;
    routeLayers.current = rl;
    startFlagMarkers.current = flags.start;
    destFlagMarkers.current = flags.destination;
    routeMarkers.current = rm;

    // Add click handlers
    addMarkerClickHandlers(vm, vehiclesToRender, handleVehicleClick);
    addCircleClickHandlers(cc, vehiclesToRender, handleVehicleClick);
    addPolylineClickHandlers(rl, vehiclesToRender, handleVehicleClick);

    // Apply opacity
    Object.values(vm).forEach((m) => applyOpacity(m, dimAll ? 0.15 : 1));
    Object.values(pm).forEach((m) => applyOpacity(m, dimAll ? 0.15 : parkingOpacity));
    Object.values(rl).forEach((pl) => applyOpacity(pl, dimAll ? 0.15 : polylineOpacity));
    Object.values(flags.start).forEach((m) => applyOpacity(m, flagOpacity));
    Object.values(flags.destination).forEach((m) => applyOpacity(m, flagOpacity));
    Object.values(rm).forEach((m) => applyOpacity(m, dimAll ? 0.15 : routeOpacity));

    // Toggle visibility using display instead of add/remove layers
    toggleFlagsVisibility(showFlags);
    togglePolylinesVisibility(showPolylines);
    toggleParkingVisibility(showParking);
    toggleRoutesVisibility(showRoutes);

    map.invalidateSize();
  }, [vehicles, visibleVehicles, filters, dimAll, showPolylines, polylineOpacity, showParking, parkingOpacity, showFlags, flagOpacity, showRoutes, routeOpacity]);

  // Fit bounds for non-map filters
  useEffect(() => {
    if (mapRef.current && defaultFitBounds.current?.isValid()) {
      mapRef.current.fitBounds(defaultFitBounds.current, { padding: [10, 10], maxZoom: defaultZoom.current || 8 });
      if (defaultZoom.current) mapRef.current.setZoom(defaultZoom.current);
    }
  }, [filters, visibleVehicles]);

  // Individual control effects - now using display toggle instead of layer add/remove
  useEffect(() => {
    toggleFlagsVisibility(showFlags);
  }, [showFlags, toggleFlagsVisibility]);

  useEffect(() => {
    Object.values(startFlagMarkers.current).forEach((m) => applyOpacity(m, flagOpacity));
    Object.values(destFlagMarkers.current).forEach((m) => applyOpacity(m, flagOpacity));
  }, [flagOpacity]);

  useEffect(() => {
    togglePolylinesVisibility(showPolylines);
  }, [showPolylines, togglePolylinesVisibility]);

  useEffect(() => {
    Object.values(routeLayers.current).forEach((pl) => applyOpacity(pl, polylineOpacity));
  }, [polylineOpacity]);

  useEffect(() => {
    toggleParkingVisibility(showParking);
  }, [showParking, toggleParkingVisibility]);

  useEffect(() => {
    Object.values(parkingMarkers.current).forEach((m) => applyOpacity(m, parkingOpacity));
  }, [parkingOpacity]);

  useEffect(() => {
    toggleRoutesVisibility(showRoutes);
  }, [showRoutes, toggleRoutesVisibility]);

  useEffect(() => {
    Object.values(routeMarkers.current).forEach((m) => applyOpacity(m, routeOpacity));
  }, [routeOpacity]);

  useEffect(() => {
    if (mapRef.current) {
      console.log('[GREYSCALE_DEBUG] useEffect triggered, greyscaleValue:', greyscaleValue);
      const grayscalePercent = (1 - greyscaleValue) * 100;
      console.log('[GREYSCALE_DEBUG] Calculated grayscalePercent:', grayscalePercent);
      const tilePane = document.querySelector('.leaflet-tile-pane');
      if (tilePane) {
        const filterValue = grayscalePercent > 0 ? `grayscale(${grayscalePercent}%)` : '';
        (tilePane as HTMLElement).style.filter = filterValue;
        (tilePane as HTMLElement).style.transition = 'filter 0.2s ease';
        console.log('[GREYSCALE_DEBUG] Tile pane filter applied:', filterValue);
      } else {
        console.log('[GREYSCALE_DEBUG] Tile pane not found');
      }
      const markerPane = document.querySelector('.leaflet-marker-pane');
      if (markerPane) {
        const counterFilter = grayscalePercent > 0 ? 'grayscale(0%)' : '';
        (markerPane as HTMLElement).style.filter = counterFilter;
        console.log('[GREYSCALE_DEBUG] Marker pane counter-filter applied:', counterFilter);
      } else {
        console.log('[GREYSCALE_DEBUG] Marker pane not found');
      }
      const overlayPane = document.querySelector('.leaflet-overlay-pane');
      if (overlayPane) {
        const counterFilter = grayscalePercent > 0 ? 'grayscale(0%)' : '';
        (overlayPane as HTMLElement).style.filter = counterFilter;
        console.log('[GREYSCALE_DEBUG] Overlay pane counter-filter applied:', counterFilter);
      } else {
        console.log('[GREYSCALE_DEBUG] Overlay pane not found');
      }
    } else {
      console.log('[GREYSCALE_DEBUG] Map not initialized');
    }
  }, [greyscaleValue]);

  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => mapRef.current?.invalidateSize(), 100);
    }
  }, [isChartExpanded, isVehiclesExpanded]);

  return (
    <div className="dashboard__map-container">
      <div ref={mapDiv} className="dashboard__map-element" />
      <div className="map-controls-container">
        <OpacityControl
          id="greyscale-control"
          onToggle={() => {
            const newValue = greyscaleValue === 0 ? 1 : 0;
            console.log('[GREYSCALE_DEBUG] Toggle clicked, newValue:', newValue);
            setGreyscaleValue(newValue);
          }}
          onChange={(value) => {
            console.log('[GREYSCALE_DEBUG] Slider changed, value:', value);
            setGreyscaleValue(value);
          }}
          initialToggleState={greyscaleValue > 0 ? 1 : 0}
          initialValue={greyscaleValue}
          color="#2389ff"
          toggleIcon={<GreyscaleIcon enabled={greyscaleValue > 0} />}
          openSlider={openSlider}
          setOpenSlider={setOpenSlider}
          title="Control map greyscale"
        />
        <OpacityControl
          id="flag-opacity"
          onToggle={onToggleFlags}
          onChange={setFlagOpacity}
          initialToggleState={showFlags ? 1 : 0}
          initialValue={flagOpacity}
          color="#2389ff"
          toggleIcon={<FlagIcon enabled={showFlags} />}
          openSlider={openSlider}
          setOpenSlider={setOpenSlider}
          title="Control flags"
        />
        <OpacityControl
          id="parking-opacity"
          onToggle={() => setShowParking(!showParking)}
          onChange={setParkingOpacity}
          initialToggleState={showParking ? 1 : 0}
          initialValue={parkingOpacity}
          color="#00FF00"
          toggleIcon={<ParkingIcon enabled={showParking} />}
          openSlider={openSlider}
          setOpenSlider={setOpenSlider}
          title="Control parking markers"
        />
        <OpacityControl
          id="polyline-opacity"
          onToggle={() => setShowPolylines(!showPolylines)}
          onChange={setPolylineOpacity}
          initialToggleState={showPolylines ? 1 : 0}
          initialValue={polylineOpacity}
          color="#7a63ff"
          toggleIcon={<PolylineIcon enabled={showPolylines} />}
          openSlider={openSlider}
          setOpenSlider={setOpenSlider}
          title="Control routes"
        />
        <OpacityControl
          id="routes-opacity"
          onToggle={() => setShowRoutes(!showRoutes)}
          onChange={setRouteOpacity}
          initialToggleState={showRoutes ? 1 : 0}
          initialValue={routeOpacity}
          color="#FF4500"
          toggleIcon={<RoutesIcon enabled={showRoutes} />}
          openSlider={openSlider}
          setOpenSlider={setOpenSlider}
          title="Control route markers"
        />
      </div>

      {/* Vehicle detail modal */}
      <VehicleDetailModal
        vehicle={selectedVehicle}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        locations={mockLocations}
      />
    </div>
  );
};

export default HaulerDashboardMaps;