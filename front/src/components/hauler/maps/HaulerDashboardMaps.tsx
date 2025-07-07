// File: front/src/components/hauler/content/HaulerDashboardMaps.tsx
// Last change: Refactored to use new modular structure with separate utils, constants, markers and management

import React, { useEffect, useRef, useState, useCallback } from "react";
import "leaflet/dist/leaflet.css";
import "./dashboard.maps.css";
import { Vehicle } from '@/data/mockFleet';
import mockLocations from '@/data/mockLocations';
import { ALL_STATUSES } from './utils/map-constants';
import { MapManager } from './utils/map-management';
import {
  addVehicleMarkers,
  addCurrentCircles,
  addParkingMarkers,
  addTriangularPolylines,
  addRoutePaths,
  addFlagMarkers,
  addRouteMarkers,
} from './utils/map-markers';
import { 
  addMarkerClickHandlers, 
  addCircleClickHandlers,
  addPolylineClickHandlers
} from './utils/MapMarkerHandler';
import VehicleDetailModal from '../../shared/modals/VehicleDetailModal';
import OpacityControl from '@/components/shared/elements/OpacityControl';
import FinishFlag from '@/assets/flags/FinishFlag.svg';

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

const NavigationIcon: React.FC<{ enabled: boolean }> = ({ enabled }) => (
  <div className="oc-icon-container">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="6" stroke={enabled ? "#d726ff" : "#ccc"} strokeWidth="2" fill="none" />
      <circle cx="10" cy="10" r="3" fill={enabled ? "#d726ff" : "#ccc"} />
      <rect x="8" y="15" width="4" height="3" fill={enabled ? "#d726ff" : "#ccc"} rx="1" />
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
  // State for layer visibility and opacity
  const [showPolylines, setShowPolylines] = useState(true);
  const [polylineOpacity, setPolylineOpacity] = useState(1);
  const [showRouting, setShowRouting] = useState(true);
  const [routePathOpacity, setRoutePathOpacity] = useState(1);
  const [showNavigation, setShowNavigation] = useState(true);
  const [navigationOpacity, setNavigationOpacity] = useState(1);
  const [flagOpacity, setFlagOpacity] = useState(1);
  const [greyscaleValue, setGreyscaleValue] = useState(1);
  const [showParking, setShowParking] = useState(true);
  const [parkingOpacity, setParkingOpacity] = useState(1);
  const [openSlider, setOpenSlider] = useState<string | null>(null);
  
  // Modal state
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Refs for map and layers
  const mapDiv = useRef<HTMLDivElement>(null);
  const mapManagerRef = useRef<MapManager | null>(null);
  const vehicleMarkers = useRef<Record<string, L.Marker>>({});
  const currentCircles = useRef<Record<string, L.CircleMarker>>({});
  const parkingMarkers = useRef<Record<string, L.Marker>>({});
  const triangularPolylines = useRef<Record<string, L.Polygon>>({});
  const routePaths = useRef<Record<string, L.Polyline>>({});
  const startFlagMarkers = useRef<Record<string, L.Marker>>({});
  const destFlagMarkers = useRef<Record<string, L.Marker>>({});
  const routeMarkers = useRef<Record<string, L.CircleMarker>>({});

  const dimAll = filters.length === 0;

  // Vehicle click handler
  const handleVehicleClick = useCallback((vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapDiv.current || mapManagerRef.current) return;

    console.log('[Maps] Initializing map manager');
    mapManagerRef.current = new MapManager();
    mapManagerRef.current.initialize(mapDiv.current);

    return () => {
      console.log('[Maps] Cleaning up map manager');
      mapManagerRef.current?.cleanup();
      mapManagerRef.current = null;
    };
  }, []);

  // Calculate and fit bounds on vehicle changes
  useEffect(() => {
    if (!mapManagerRef.current) return;

    const controller = mapManagerRef.current.getController();
    controller.fitToBounds(vehicles, mockLocations);
  }, [vehicles]);

  // Main map update effect
  useEffect(() => {
    if (!mapManagerRef.current) return;

    const mapManager = mapManagerRef.current;
    const layerManager = mapManager.getLayerManager();
    const filterManager = mapManager.getFilterManager();
    const opacityOptimizer = mapManager.getOpacityOptimizer();
    
    if (!layerManager) return;

    console.log('[Maps] Updating map layers');
    layerManager.clearLayers();

    // Get vehicles to render
    const vehiclesToRender = filterManager.getVehiclesToRender(
      vehicles, 
      visibleVehicles, 
      filters, 
      ALL_STATUSES
    );

    // Get map instance
    const map = mapManager.getController().getMap();
    if (!map) return;

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

    // Apply optimized opacity
    opacityOptimizer.applyOptimizedOpacity(
      layerManager,
      {
        parking: pm,
        triangular: tp,
        routePaths: rp,
        routeMarkers: rm,
        startFlags: flags.start,
        destFlags: flags.destination,
        vehicles: vm,
      },
      {
        dimAll,
        parkingOpacity,
        polylineOpacity,
        routePathOpacity,
        flagOpacity,
        navigationOpacity,
      }
    );

    // Toggle visibility
    layerManager.toggleVisibility(flags.start, showFlags);
    layerManager.toggleVisibility(flags.destination, showFlags);
    layerManager.toggleVisibility(tp, showPolylines);
    layerManager.toggleVisibility(rp, showRouting);
    layerManager.toggleVisibility(rm, showRouting);
    layerManager.toggleVisibility(pm, showParking);
    layerManager.toggleNavigationVisibility(vm, showNavigation);

    map.invalidateSize();
  }, [
    vehicles, 
    visibleVehicles, 
    filters, 
    dimAll, 
    showPolylines, 
    polylineOpacity, 
    showRouting, 
    routePathOpacity, 
    showParking, 
    parkingOpacity, 
    showFlags, 
    flagOpacity, 
    showNavigation, 
    navigationOpacity,
    handleVehicleClick
  ]);

  // Handle greyscale changes
  useEffect(() => {
    if (!mapManagerRef.current) return;
    
    const layerManager = mapManagerRef.current.getLayerManager();
    if (layerManager) {
      layerManager.applyGreyscale(greyscaleValue);
    }
  }, [greyscaleValue]);

  // Handle layout changes
  useEffect(() => {
    if (!mapManagerRef.current) return;

    const map = mapManagerRef.current.getController().getMap();
    if (map) {
      setTimeout(() => map.invalidateSize(), 100);
    }
  }, [isChartExpanded, isVehiclesExpanded]);

  return (
    <div className="dashboard__map-container">
      <div ref={mapDiv} className="dashboard__map-element" />
      
      <div className="map-controls-container">
        <OpacityControl
          id="greyscale-control"
          onToggle={() => setGreyscaleValue(greyscaleValue === 0 ? 1 : 0)}
          onChange={setGreyscaleValue}
          initialToggleState={greyscaleValue > 0 ? 1 : 0}
          initialValue={greyscaleValue}
          color="#2389ff"
          toggleIcon={<GreyscaleIcon enabled={greyscaleValue > 0} />}
          openSlider={openSlider}
          setOpenSlider={setOpenSlider}
          title="Control map greyscale"
        />
        
        <OpacityControl
          id="navigation-opacity"
          onToggle={() => setShowNavigation(!showNavigation)}
          onChange={setNavigationOpacity}
          initialToggleState={showNavigation ? 1 : 0}
          initialValue={navigationOpacity}
          color="#d726ff"
          toggleIcon={<NavigationIcon enabled={showNavigation} />}
          openSlider={openSlider}
          setOpenSlider={setOpenSlider}
          title="Control navigation markers (spinning wheels and squares)"
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