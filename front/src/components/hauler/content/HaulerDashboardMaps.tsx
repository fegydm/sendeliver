// File: front/src/components/hauler/content/HaulerDashboardMaps.tsx
// Last change: Optimized layer visibility and opacity without full map re-rendering

import React, { useEffect, useRef, useState } from "react";
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
} from "./MapMarkers";
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
   <img 
     src={FinishFlag} 
     alt="Flag" 
     style={{ 
       width: '20px', 
       height: '20px'
     }}
   />
   {!enabled && <div className="oc-disabled-overlay" />}
 </div>
);

const PolylineIcon: React.FC<{ enabled: boolean }> = ({ enabled }) => (
 <div className="oc-icon-container">
   <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
     <polygon 
       points="13,1 18,5 2,18" 
       fill="#333"
     />
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
 const [flagOpacity, setFlagOpacity] = useState(1);
 const [showPolylines, setShowPolylines] = useState(true);
 const [polylineOpacity, setPolylineOpacity] = useState(1);
 const [openSlider, setOpenSlider] = useState<string | null>(null);
 
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

 const applyOpacity = (layer: L.Layer, opacity: number) => {
   if (layer instanceof L.Marker && layer.getElement()) {
     layer.getElement()!.style.opacity = String(opacity);
   } else if (layer instanceof L.Polyline || layer instanceof L.CircleMarker) {
     layer.setStyle({ opacity, fillOpacity: opacity });
   }
 };

 const toggleLayerVisibility = (layers: Record<string, L.Layer>, visible: boolean) => {
   Object.values(layers).forEach(layer => {
     if (visible) {
       if (!mapRef.current?.hasLayer(layer)) {
         mapRef.current?.addLayer(layer);
       }
     } else {
       if (mapRef.current?.hasLayer(layer)) {
         mapRef.current?.removeLayer(layer);
       }
     }
   });
 };

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
     fadeAnimation: false 
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
   }).addTo(map);
   
   const invalidate = () => map.invalidateSize();
   map.on("zoomend moveend", invalidate);
   
   return () => {
     map.off("zoomend moveend", invalidate);
     map.remove();
     mapRef.current = null;
   };
 }, []);

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

 useEffect(() => {
   if (!mapRef.current) return;
   
   const map = mapRef.current;
   map.eachLayer((layer) => { 
     if (!(layer instanceof L.TileLayer)) map.removeLayer(layer); 
   });
   
   const allMode = filters.length === 0;
   const allSelected = filters.length === allStatuses.length && 
                      allStatuses.every((s) => filters.includes(s));
   const vehiclesToRender = allMode || allSelected ? vehicles : visibleVehicles;
   
   const vm = addVehicleMarkers(map, vehiclesToRender, dimAll, mockLocations);
   const cc = addCurrentCircles(map, vehiclesToRender, dimAll, mockLocations);
   const pm = addParkingMarkers(map, vehiclesToRender, dimAll, mockLocations);
   const rl = addRoutePolylines(map, vehiclesToRender, dimAll, mockLocations, showPolylines, polylineOpacity);
   const flags = addFlagMarkers(map, vehiclesToRender, dimAll, mockLocations);
   
   vehicleMarkers.current = vm;
   currentCircles.current = cc;
   parkingMarkers.current = pm;
   routeLayers.current = rl;
   startFlagMarkers.current = flags.start;
   destFlagMarkers.current = flags.destination;
   
   Object.values(vm).forEach((m) => applyOpacity(m, dimAll ? 0.15 : 1));
   Object.values(rl).forEach((pl) => applyOpacity(pl, dimAll ? 0.15 : polylineOpacity));
   Object.values(flags.start).forEach((m) => applyOpacity(m, flagOpacity));
   Object.values(flags.destination).forEach((m) => applyOpacity(m, flagOpacity));
   
   toggleLayerVisibility(flags.start, showFlags);
   toggleLayerVisibility(flags.destination, showFlags);
   toggleLayerVisibility(rl, showPolylines);
   
   if (defaultFitBounds.current?.isValid()) {
     map.fitBounds(defaultFitBounds.current, { padding: [10, 10], maxZoom: defaultZoom.current || 8 });
     if (defaultZoom.current) map.setZoom(defaultZoom.current);
   }
   
   map.invalidateSize();
 }, [vehicles, visibleVehicles, filters, dimAll]);

 useEffect(() => {
   toggleLayerVisibility(startFlagMarkers.current, showFlags);
   toggleLayerVisibility(destFlagMarkers.current, showFlags);
 }, [showFlags]);

 useEffect(() => {
   Object.values(startFlagMarkers.current).forEach((m) => applyOpacity(m, flagOpacity));
   Object.values(destFlagMarkers.current).forEach((m) => applyOpacity(m, flagOpacity));
 }, [flagOpacity]);

 useEffect(() => {
   toggleLayerVisibility(routeLayers.current, showPolylines);
 }, [showPolylines]);

 useEffect(() => {
   Object.values(routeLayers.current).forEach((pl) => applyOpacity(pl, polylineOpacity));
 }, [polylineOpacity]);

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
         id="flag-opacity"
         onToggle={onToggleFlags}
         onChange={setFlagOpacity}
        initialToggleState ={showFlags ? 1 : 0}
         initialValue={flagOpacity * 100}
         color="#2389ff"
         toggleIcon={<FlagIcon enabled={showFlags} />}
         openSlider={openSlider}
         setOpenSlider={setOpenSlider}
         title="Control flags"
       />
       
       <OpacityControl
         id="polyline-opacity"
         onToggle={() => setShowPolylines(!showPolylines)}
         onChange={setPolylineOpacity}
         initialToggleState={showPolylines ? 1 : 0}
         initialValue={polylineOpacity * 100}
         color="#7a63ff"
         toggleIcon={<PolylineIcon enabled={showPolylines} />}
         openSlider={openSlider}
         setOpenSlider={setOpenSlider}
         title="Control routes"
       />
     </div>
   </div>
 );
};

export default HaulerDashboardMaps;