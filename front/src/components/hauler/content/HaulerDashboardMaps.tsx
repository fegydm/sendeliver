// File: front/src/components/hauler/content/HaulerDashboardMaps.tsx
// Last change: Fixed TS2459 by exporting Vehicle type, fixed TS2552 by adding setGreyscaleValue, renamed speed to activity for filters

import React, { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./dashboard.maps.css";
import { Vehicle, parseStatus, getDirectionColor, statusColors, delayColors } from "@/data/mockFleet";
import mockLocations from "@/data/mockLocations";
import {
  addVehicleMarkers,
  addCurrentCircles,
  addParkingMarkers,
  addTriangularPolylines,
  addRoutePaths,
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
  filters: string[];
  selectedVehicles: Set<string>;
  showFlags: boolean;
  onToggleFlags: () => void;
  isChartExpanded: boolean;
  isVehiclesExpanded: boolean;
  hover: string | null;
}

// Icon components for controls
const FlagIcon: React.FC<{ enabled: boolean }> = ({ enabled }) => (
  <div className="oc-icon-container">
    <img src={FinishFlag} alt="Flag" style={{ width: "20px", height: "20px" }} />
    {!enabled && <div className="oc-disabled-overlay" />}
  </div>
);

const PolylineIcon: React.FC<{ enabled: boolean }> = ({ enabled }) => (
  <div className="oc-icon-container">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <polygon points="2,2 18,2 10,16" fill={enabled ? "#7a63ff" : "#ccc"} stroke="#333" strokeWidth="1" />
    </svg>
    {!enabled && <div className="oc-disabled-overlay" />}
  </div>
);

const RoutePathIcon: React.FC<{ enabled: boolean }> = ({ enabled }) => (
  <div className="oc-icon-container">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M2 4 Q 6 8, 10 4 Q 14 0, 18 4" stroke={enabled ? "#2389ff" : "#ccc"} strokeWidth="2" fill="none" />
      <path d="M2 12 Q 6 16, 10 12 Q 14 8, 18 12" stroke={enabled ? "#2389ff" : "#ccc"} strokeWidth="2" fill="none" strokeDasharray="3,2" />
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
  // Separate state for polylines (triangular areas)
  const [showPolylines, setShowPolylines] = useState(true);
  const [polylineOpacity, setPolylineOpacity] = useState(1);
  
  // Separate state for route paths (actual routes) - route markers follow these
  const [showRouting, setShowRouting] = useState(true);
  const [routePathOpacity, setRoutePathOpacity] = useState(1);
  
  // Other controls
  const [flagOpacity, setFlagOpacity] = useState(1);
  const [greyscaleValue, setGreyscaleValue] = useState(1);
  const [showParking, setShowParking] = useState(true);
  const [parkingOpacity, setParkingOpacity] = useState(1);
  const [openSlider, setOpenSlider] = useState<string | null>(null);
  
  // Modal state
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Map refs
  const mapDiv = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const vehicleMarkers = useRef<Record<string, L.Marker>>({});
  const currentCircles = useRef<Record<string, L.CircleMarker>>({});
  const parkingMarkers = useRef<Record<string, L.Marker>>({});
  const triangularPolylines = useRef<Record<string, L.Polygon>>({});
  const routePaths = useRef<Record<string, L.Polyline>>({});
  const startFlagMarkers = useRef<Record<string, L.Marker>>({});
  const destFlagMarkers = useRef<Record<string, L.Marker>>({});
  const routeMarkers = useRef<Record<string, L.CircleMarker>>({});
  const defaultFitBounds = useRef<L.LatLngBounds | null>(null);
  const defaultZoom = useRef<number | null>(null);

  // Previous opacity values for optimization
  const prevDimAll = useRef<boolean>(false);
  const prevParkingOpacity = useRef<number>(1);
  const prevPolylineOpacity = useRef<number>(1);
  const prevRoutePathOpacity = useRef<number>(1);
  const prevFlagOpacity = useRef<number>(1);

  const dimAll = filters.length === 0;

  // Updated statuses using string format
  const allStatuses: string[] = [
    "dynamic.outbound.moving.ontime",
    "dynamic.outbound.break.ontime",
    "dynamic.inbound.moving.ontime",
    "dynamic.inbound.waiting.ontime",
    "dynamic.transit.moving.ontime",
    "dynamic.transit.waiting.ontime",
    "static.standby.ontime",
    "static.standby.delayed",
    "static.depot.ontime",
    "static.service.delayed",
  ];

  // Vehicle click handler
  const handleVehicleClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
  };

  const applyOpacity = (layer: L.Layer, opacity: number) => {
    if (layer instanceof L.Marker) {
      const element = (layer as any).getElement?.();
      if (element) {
        element.style.opacity = String(opacity);
      }
    } else if (layer instanceof L.Polyline || layer instanceof L.CircleMarker || layer instanceof L.Polygon) {
      layer.setStyle({ opacity, fillOpacity: opacity });
    }
  };

  // Toggle visibility functions
  const toggleLayerVisibility = useCallback((layers: Record<string, L.Layer>, visible: boolean) => {
    Object.values(layers).forEach((layer) => {
      if (layer instanceof L.Marker) {
        const element = (layer as any).getElement?.();
        if (element) {
          (element as HTMLElement).style.display = visible ? '' : 'none';
        }
      } else if (layer instanceof L.Path) {
        // L.Polyline, L.Polygon, L.CircleMarker extend L.Path
        const element = (layer as any)._path;
        if (element) {
          (element as HTMLElement).style.display = visible ? '' : 'none';
        }
      }
    });
  }, []);

  // Initialize map
  useEffect(() => {
    if (mapRef.current || !mapDiv.current) return;

    console.log('[Leaflet Init] Setting up default icon options');
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    const map = L.map(mapDiv.current, {
      zoomAnimation: false,
      zoomSnap: 0, // Allow fractional zoom levels
      zoomDelta: 0.05, // Smaller zoom steps
      minZoom: 3, // Match OpenTopoMap min zoom
      maxZoom: 17, // Match OpenTopoMap max zoom
    }).setView([49, 15], 6);

    mapRef.current = map;

    const tileLayer = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
      attribution: "Map data © OpenStreetMap contributors, SRTM | Map style © OpenTopoMap (CC-BY-SA)",
      subdomains: ["a", "b", "c"],
      maxZoom: 17,
      tileSize: 256,
      updateWhenIdle: true,
      keepBuffer: 6,
      crossOrigin: true,
      className: "greyscale-tile",
    }).addTo(map);

    tileLayer.on('tileload', () => {
      console.log('[Leaflet Tiles] Tile loaded:', new Date().toISOString());
    });
    tileLayer.on('tileerror', (e) => {
      console.error('[Leaflet Tiles] Tile error:', e);
    });

    const invalidate = () => {
      map.invalidateSize();
    };
    
    map.on("zoomend moveend", invalidate);

    // Reduce zoom sensitivity for touch mice with debouncing
    let lastZoomTime = 0;
    const debounceDelay = 50; // 50ms debounce
    const handleWheelZoom = (e: WheelEvent) => {
      const now = Date.now();
      if (now - lastZoomTime < debounceDelay) {
        console.log('[Leaflet Zoom Debounce] Skipping wheel event due to debounce:', {
          deltaY: e.deltaY,
          timestamp: new Date().toISOString(),
        });
        return;
      }
      lastZoomTime = now;

      console.log('[Leaflet Zoom] Wheel event:', {
        deltaY: e.deltaY,
        deltaX: e.deltaX,
        timestamp: new Date().toISOString(),
      });

      if (Math.abs(e.deltaY) >= 0.5) { // Ignore tiny movements
        // Reduce zoom intensity by scaling delta
        const sensitivity = 0.1; // Lower sensitivity for smoother zoom
        const delta = e.deltaY * sensitivity;
        const zoomDelta = delta > 0 ? -0.05 : 0.05; // Even smaller zoom steps
        const currentZoom = map.getZoom();
        console.log('[Leaflet Zoom] Applying zoom:', {
          sensitivity,
          delta,
          zoomDelta,
          currentZoom,
          newZoom: currentZoom + zoomDelta,
        });
        map.setZoom(currentZoom + zoomDelta, { animate: true });
        e.preventDefault(); // Prevent default browser scroll
      }
    };

    mapDiv.current?.addEventListener('wheel', handleWheelZoom);

    return () => {
      map.off("zoomend moveend", invalidate);
      mapDiv.current?.removeEventListener('wheel', handleWheelZoom);
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
    console.log('[Leaflet Update] Clearing non-tile layers');
    map.eachLayer((layer) => {
      if (!(layer instanceof L.TileLayer)) {
        try {
          map.removeLayer(layer);
        } catch (e) {
          console.error('[Leaflet Update] Error removing layer:', e);
        }
      }
    });

    const allMode = filters.length === 0;
    const allSelected = filters.length === allStatuses.length && allStatuses.every((s) => filters.includes(s));
    let vehiclesToRender = allMode || allSelected ? vehicles : visibleVehicles;

    // Apply AND logic for direction and activity filters
    if (!allMode && !allSelected) {
      const directionFilters = filters.filter(f => ['outbound', 'inbound', 'transit'].includes(f));
      const activityFilters = filters.filter(f => ['moving', 'waiting', 'break'].includes(f));
      const standstillFilters = filters.filter(f => ['standby', 'depot', 'service'].includes(f));

      vehiclesToRender = vehicles.filter(v => {
        const parsed = parseStatus(v.dashboardStatus);
        let matches = false;

        // Handle dynamic filters (direction and activity)
        if (parsed.category === 'dynamic') {
          if (!parsed.direction || !parsed.activity) {
            console.error('[Leaflet Filter Error] Invalid dynamic status:', {
              vehicleId: v.id,
              status: v.dashboardStatus,
              parsed,
            });
            return false;
          }
          const matchesDirection = directionFilters.length === 0 || directionFilters.includes(parsed.direction);
          const matchesActivity = activityFilters.length === 0 || activityFilters.includes(parsed.activity);
          matches = matchesDirection && matchesActivity;
        }
        // Handle standstill filters
        if (parsed.category === 'static') {
          if (!parsed.type) {
            console.error('[Leaflet Filter Error] Invalid static status:', {
              vehicleId: v.id,
              status: v.dashboardStatus,
              parsed,
            });
            return false;
          }
          matches = standstillFilters.length > 0 && standstillFilters.includes(parsed.type);
        }

        // Log filter application
        console.log('[Leaflet Filter] Vehicle filter check:', {
          vehicleId: v.id,
          status: v.dashboardStatus,
          directionFilters,
          activityFilters,
          standstillFilters,
          matches,
        });

        return matches && (selectedVehicles.size === 0 || selectedVehicles.has(v.id));
      });
    }

    console.log('[Leaflet Update] Rendering vehicles:', vehiclesToRender.length);

    // Add all layers
    const vm = addVehicleMarkers(map, vehiclesToRender, dimAll, mockLocations);
    const cc = addCurrentCircles(map, vehiclesToRender, dimAll, mockLocations);
    const pm = addParkingMarkers(map, vehiclesToRender, dimAll, mockLocations);
    const tp = addTriangularPolylines(map, vehiclesToRender, dimAll, mockLocations);
    const rp = addRoutePaths(map, vehiclesToRender, dimAll, mockLocations, map.getZoom());
    const flags = addFlagMarkers(map, vehiclesToRender, dimAll, mockLocations);
    const rm = addRouteMarkers(map, vehiclesToRender, dimAll, mockLocations);

    // Update refs
    vehicleMarkers.current = vm;
    currentCircles.current = cc;
    parkingMarkers.current = pm;
    triangularPolylines.current = tp;
    routePaths.current = rp;
    startFlagMarkers.current = flags.start;
    destFlagMarkers.current = flags.destination;
    routeMarkers.current = rm;

    // Add click handlers
    addMarkerClickHandlers(vm, vehiclesToRender, handleVehicleClick);
    addCircleClickHandlers(cc, vehiclesToRender, handleVehicleClick);
    addPolylineClickHandlers(rp, vehiclesToRender, handleVehicleClick);

    // Apply opacity only if necessary
    console.log('[Leaflet Opacity] Checking opacity changes:', { dimAll, parkingOpacity, polylineOpacity, routePathOpacity, flagOpacity });
    if (dimAll !== prevDimAll.current || parkingOpacity !== prevParkingOpacity.current) {
      Object.values(vm).forEach((m) => m && applyOpacity(m, dimAll ? 0.3 : 1));
      Object.values(pm).forEach((m) => m && applyOpacity(m, dimAll ? 0.3 : parkingOpacity));
    }
    if (dimAll !== prevDimAll.current || polylineOpacity !== prevPolylineOpacity.current) {
      Object.values(tp).forEach((pl) => pl && applyOpacity(pl, dimAll ? 0.3 : polylineOpacity));
    }
    if (dimAll !== prevDimAll.current || routePathOpacity !== prevRoutePathOpacity.current) {
      Object.values(rp).forEach((pl) => pl && applyOpacity(pl, dimAll ? 0.3 : routePathOpacity));
      Object.values(rm).forEach((m) => m && applyOpacity(m, dimAll ? 0.3 : routePathOpacity));
    }
    if (flagOpacity !== prevFlagOpacity.current) {
      Object.values(flags.start).forEach((m) => m && applyOpacity(m, flagOpacity));
      Object.values(flags.destination).forEach((m) => m && applyOpacity(m, flagOpacity));
    }

    // Update previous values
    prevDimAll.current = dimAll;
    prevParkingOpacity.current = parkingOpacity;
    prevPolylineOpacity.current = polylineOpacity;
    prevRoutePathOpacity.current = routePathOpacity;
    prevFlagOpacity.current = flagOpacity;

    // Toggle visibility with null checks
    console.log('[Leaflet Update] Toggling layer visibility');
    toggleLayerVisibility(flags.start, showFlags);
    toggleLayerVisibility(flags.destination, showFlags);
    toggleLayerVisibility(tp, showPolylines);
    toggleLayerVisibility(rp, showRouting);
    toggleLayerVisibility(rm, showRouting);
    toggleLayerVisibility(pm, showParking);

    map.invalidateSize();
  }, [vehicles, visibleVehicles, filters, dimAll, showPolylines, polylineOpacity, showRouting, routePathOpacity, showParking, parkingOpacity, showFlags, flagOpacity, toggleLayerVisibility]);

  // Individual control effects
  useEffect(() => {
    toggleLayerVisibility(startFlagMarkers.current, showFlags);
    toggleLayerVisibility(destFlagMarkers.current, showFlags);
  }, [showFlags, toggleLayerVisibility]);

  useEffect(() => {
    Object.values(startFlagMarkers.current).forEach((m) => applyOpacity(m, flagOpacity));
    Object.values(destFlagMarkers.current).forEach((m) => applyOpacity(m, flagOpacity));
  }, [flagOpacity]);

  useEffect(() => {
    toggleLayerVisibility(triangularPolylines.current, showPolylines);
  }, [showPolylines, toggleLayerVisibility]);

  useEffect(() => {
    Object.values(triangularPolylines.current).forEach((pl) => applyOpacity(pl, polylineOpacity));
  }, [polylineOpacity]);

  useEffect(() => {
    toggleLayerVisibility(routePaths.current, showRouting);
    toggleLayerVisibility(routeMarkers.current, showRouting); // Route markers follow route paths
  }, [showRouting, toggleLayerVisibility]);

  useEffect(() => {
    Object.values(routePaths.current).forEach((pl) => applyOpacity(pl, routePathOpacity));
    Object.values(routeMarkers.current).forEach((m) => applyOpacity(m, routePathOpacity)); // Route markers use same opacity
  }, [routePathOpacity]);

  useEffect(() => {
    toggleLayerVisibility(parkingMarkers.current, showParking);
  }, [showParking, toggleLayerVisibility]);

  useEffect(() => {
    Object.values(parkingMarkers.current).forEach((m) => applyOpacity(m, parkingOpacity));
  }, [parkingOpacity]);

  // Greyscale effect
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    const tilePane = document.querySelector('.leaflet-tile-pane');
    const markerPane = document.querySelector('.leaflet-marker-pane');
    const overlayPane = document.querySelector('.leaflet-overlay-pane');

    const applyGreyscale = (value: number) => {
      const grayscalePercent = (1 - value) * 100;
      console.log('[Leaflet Greyscale] Applying greyscale:', { grayscalePercent });
      if (tilePane) {
        const filterValue = grayscalePercent > 0 ? `grayscale(${grayscalePercent}%)` : '';
        (tilePane as HTMLElement).style.filter = filterValue;
        (tilePane as HTMLElement).style.transition = 'filter 0.5s ease';
      }
      if (markerPane) {
        (markerPane as HTMLElement).style.filter = 'grayscale(0%)';
      }
      if (overlayPane) {
        (overlayPane as HTMLElement).style.filter = 'grayscale(0%)';
      }
    };

    // Disable greyscale during zoom to prevent flickering
    const onZoomStart = () => {
      console.log('[Leaflet Greyscale] Disabling greyscale during zoom');
      if (tilePane) {
        (tilePane as HTMLElement).style.filter = 'grayscale(0%)';
      }
    };
    const onZoomEnd = () => {
      console.log('[Leaflet Greyscale] Restoring greyscale after zoom');
      applyGreyscale(greyscaleValue);
    };

    map.on('zoomstart', onZoomStart);
    map.on('zoomend', onZoomEnd);

    // Apply initial greyscale
    applyGreyscale(greyscaleValue);

    return () => {
      map.off('zoomstart', onZoomStart);
      map.off('zoomend', onZoomEnd);
    };
  }, [greyscaleValue]);

  // Fit bounds for non-map filters
  useEffect(() => {
    if (mapRef.current && defaultFitBounds.current?.isValid()) {
      mapRef.current.fitBounds(defaultFitBounds.current, { padding: [10, 10], maxZoom: defaultZoom.current || 8 });
      if (defaultZoom.current) mapRef.current.setZoom(defaultZoom.current);
    }
  }, [filters, visibleVehicles]);

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
            setGreyscaleValue(newValue);
          }}
          onChange={(value) => {
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
          title="Control triangular polylines"
        />
        <OpacityControl
          id="route-paths-opacity"
          onToggle={() => setShowRouting(!showRouting)}
          onChange={setRoutePathOpacity}
          initialToggleState={showRouting ? 1 : 0}
          initialValue={routePathOpacity}
          color="#2389ff"
          toggleIcon={<RoutePathIcon enabled={showRouting} />}
          openSlider={openSlider}
          setOpenSlider={setOpenSlider}
          title="Control route paths and markers"
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