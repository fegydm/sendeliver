// File: front/src/components/hauler/content/map-markers.ts
// Last change: Created unified markers file with all marker creation functions

import L from "leaflet";
import { Vehicle } from '@/data/mockFleet';
import startflag from "@/assets/flags/startflag.svg";
import finishflag from "@/assets/flags/finishflag.svg";
import {
  parseStatus,
  getDirectionColor,
  isDynamicVehicle,
  getVehicleCoordinates,
  generateNavigationMarkerHTML,
  createTooltipContent,
  getMarkerClasses,
} from './map-utils';
import {
  MARKER_CONFIG,
  CSS_CLASSES,
  Z_INDEX,
  ICONS,
} from './map-constants';

// ===============================
// VEHICLE MARKERS
// ===============================

/**
 * Add navigation markers for all vehicles (spinning wheels and squares)
 */
export function addVehicleMarkers(
  map: L.Map,
  vehicles: Vehicle[],
  dimAll: boolean,
  mockLocations: any[]
): Record<string, L.Marker> {
  const markers: Record<string, L.Marker> = {};
  
  vehicles.forEach((vehicle) => {
    const locationId = vehicle.currentLocation || vehicle.location;
    if (!locationId) {
      console.warn(`[Vehicle Markers] Skipping vehicle ${vehicle.id}: No location provided`);
      return;
    }
    
    const coordinates = getVehicleCoordinates(vehicle, mockLocations, (vehicleId, lat, lng) => {
      // GPS success callback - update marker position
      const marker = markers[vehicleId];
      if (marker) {
        marker.setLatLng([lat, lng]);
        console.log(`[Vehicle Markers] GPS updated for vehicle ${vehicleId}:`, { lat, lng });
      }
    });
    
    const isDynamic = isDynamicVehicle(vehicle.dashboardStatus);
    const markerHTML = generateNavigationMarkerHTML(vehicle);
    const classes = getMarkerClasses(vehicle, dimAll);
    
    const marker = L.marker([coordinates.latitude, coordinates.longitude], {
      icon: L.divIcon({
        className: classes.join(" "),
        html: markerHTML,
        iconSize: isDynamic ? MARKER_CONFIG.DYNAMIC_SIZE : MARKER_CONFIG.STATIC_SIZE,
        iconAnchor: isDynamic ? MARKER_CONFIG.DYNAMIC_ANCHOR : MARKER_CONFIG.STATIC_ANCHOR,
      }),
      zIndexOffset: isDynamic ? Z_INDEX.DYNAMIC_MARKERS : Z_INDEX.STATIC_MARKERS,
    }).addTo(map);
    
    // Add tooltip
    const tooltipContent = createTooltipContent(vehicle, locationId);
    marker.bindTooltip(tooltipContent, { 
      direction: 'top', 
      offset: [0, isDynamic ? -20 : -16],
      className: CSS_CLASSES.VEHICLE_TOOLTIP
    });
    
    markers[vehicle.id] = marker;
  });
  
  return markers;
}

// ===============================
// ROUTE MARKERS
// ===============================

/**
 * Add current position circles for dynamic vehicles
 */
export function addCurrentCircles(
  map: L.Map,
  vehicles: Vehicle[],
  dimAll: boolean,
  mockLocations: any[]
): Record<string, L.CircleMarker> {
  const circles: Record<string, L.CircleMarker> = {};
  
  vehicles.forEach((vehicle) => {
    if (!vehicle.currentLocation || !isDynamicVehicle(vehicle.dashboardStatus)) return;
    
    const location = mockLocations.find((l) => l.id === vehicle.currentLocation);
    if (!location) return;
    
    const parsed = parseStatus(vehicle.dashboardStatus);
    const directionColor = getDirectionColor(vehicle.dashboardStatus);
    
    const circle = L.circleMarker([location.latitude, location.longitude], {
      className: [
        CSS_CLASSES.CURRENT_CIRCLE,
        `status-${parsed.category === 'dynamic' ? parsed.direction : 'static'}`,
        dimAll ? CSS_CLASSES.DIMMED : "",
      ].join(" "),
      radius: MARKER_CONFIG.CURRENT_CIRCLE_RADIUS,
      color: directionColor,
      fillColor: directionColor,
      fillOpacity: 0.75,
      weight: 2,
    }).addTo(map);
    
    circles[vehicle.id] = circle;
  });
  
  return circles;
}

/**
 * Add route markers for waypoints along actual routes
 */
export function addRouteMarkers(
  map: L.Map,
  vehicles: Vehicle[],
  dimAll: boolean,
  mockLocations: any[]
): Record<string, L.CircleMarker> {
  const markers: Record<string, L.CircleMarker> = {};
  
  vehicles.forEach((vehicle) => {
    if (!isDynamicVehicle(vehicle.dashboardStatus)) return;
    
    const directionColor = getDirectionColor(vehicle.dashboardStatus);
    const parsed = parseStatus(vehicle.dashboardStatus);
    
    const points = [
      { id: vehicle.start, key: 'start' },
      { id: vehicle.currentLocation, key: 'current' },
      { id: vehicle.destination, key: 'destination' },
    ];
    
    points.forEach(({ id, key }) => {
      if (!id) return;
      
      const location = mockLocations.find((l) => l.id === id);
      if (!location) return;
      
      const markerKey = `${vehicle.id}-${key}`;
      
      const marker = L.circleMarker([location.latitude, location.longitude], {
        className: [
          CSS_CLASSES.ROUTE_MARKER,
          `status-${parsed.category === 'dynamic' ? parsed.direction : 'static'}`,
          dimAll ? CSS_CLASSES.DIMMED : "",
        ].join(" "),
        radius: MARKER_CONFIG.ROUTE_MARKER_RADIUS,
        color: directionColor,
        fillColor: directionColor,
        fillOpacity: 1,
        weight: MARKER_CONFIG.ROUTE_MARKER_WEIGHT,
      }).addTo(map);
      
      markers[markerKey] = marker;
    });
  });
  
  return markers;
}

// ===============================
// STATIC MARKERS
// ===============================

/**
 * Add parking markers for vehicles with nearestParking
 */
export function addParkingMarkers(
  map: L.Map,
  vehicles: Vehicle[],
  dimAll: boolean,
  mockLocations: any[]
): Record<string, L.Marker> {
  const parking: Record<string, L.Marker> = {};
  
  vehicles.forEach((vehicle) => {
    if (!vehicle.nearestParking) return;
    
    const location = mockLocations.find((l) => l.id === vehicle.nearestParking);
    if (!location) return;
    
    const marker = L.marker([location.latitude, location.longitude], {
      icon: L.divIcon({
        className: [
          CSS_CLASSES.PARKING_MARKER,
          `status-${location.status || 'free'}`,
          dimAll ? CSS_CLASSES.DIMMED : "",
        ].join(" "),
        html: ICONS.PARKING_SVG,
        iconSize: MARKER_CONFIG.PARKING_SIZE,
        iconAnchor: [9, 9],
      }),
      zIndexOffset: Z_INDEX.PARKING,
    }).addTo(map);
    
    marker.bindTooltip(`${location.name} (${location.status || 'free'})`, { 
      direction: 'top', 
      offset: [0, -10] 
    });
    
    parking[vehicle.id] = marker;
  });
  
  return parking;
}

/**
 * Add start and destination flag markers
 */
export function addFlagMarkers(
  map: L.Map,
  vehicles: Vehicle[],
  dimAll: boolean,
  mockLocations: any[]
): { start: Record<string, L.Marker>; destination: Record<string, L.Marker> } {
  const start: Record<string, L.Marker> = {};
  const destination: Record<string, L.Marker> = {};
  
  vehicles.forEach((vehicle) => {
    if (!isDynamicVehicle(vehicle.dashboardStatus)) return;
    
    const parsed = parseStatus(vehicle.dashboardStatus);
    const statusClass = `status-${parsed.category === 'dynamic' ? parsed.direction : 'static'}`;
    
    // Start flags
    if (vehicle.start) {
      const location = mockLocations.find((l) => l.id === vehicle.start);
      if (location) {
        const marker = L.marker([location.latitude, location.longitude], {
          icon: L.icon({
            iconUrl: StartFlag,
            iconSize: MARKER_CONFIG.FLAG_SIZE,
            iconAnchor: [12, 24],
            className: [
              CSS_CLASSES.FLAG_MARKER,
              "start",
              statusClass,
              dimAll ? CSS_CLASSES.DIMMED : "",
            ].join(" "),
          }),
          zIndexOffset: Z_INDEX.FLAGS,
        }).addTo(map);
        
        marker.bindTooltip(`Start: ${location.name}`, { direction: 'top', offset: [0, -24] });
        start[vehicle.id] = marker;
      }
    }
    
    // Destination flags
    if (vehicle.destination) {
      const location = mockLocations.find((l) => l.id === vehicle.destination);
      if (location) {
        const marker = L.marker([location.latitude, location.longitude], {
          icon: L.icon({
            iconUrl: FinishFlag,
            iconSize: MARKER_CONFIG.FLAG_SIZE,
            iconAnchor: [12, 24],
            className: [
              CSS_CLASSES.FLAG_MARKER,
              "destination",
              statusClass,
              dimAll ? CSS_CLASSES.DIMMED : "",
            ].join(" "),
          }),
          zIndexOffset: Z_INDEX.FLAGS,
        }).addTo(map);
        
        marker.bindTooltip(`Destination: ${location.name}`, { direction: 'top', offset: [0, -24] });
        destination[vehicle.id] = marker;
      }
    }
  });
  
  return { start, destination };
}

// ===============================
// POLYLINE MARKERS
// ===============================

/**
 * Add triangular polylines (filled areas between start-current-destination)
 */
export function addTriangularPolylines(
  map: L.Map,
  vehicles: Vehicle[],
  dimAll: boolean,
  mockLocations: any[]
): Record<string, L.Polygon> {
  const triangles: Record<string, L.Polygon> = {};
  
  vehicles.forEach((vehicle) => {
    if (!isDynamicVehicle(vehicle.dashboardStatus)) return;
    
    const startLoc = vehicle.start && mockLocations.find((l) => l.id === vehicle.start);
    const currentLoc = vehicle.currentLocation && mockLocations.find((l) => l.id === vehicle.currentLocation);
    const destLoc = vehicle.destination && mockLocations.find((l) => l.id === vehicle.destination);
    
    // Need all 3 points to create a triangle
    if (!startLoc || !currentLoc || !destLoc) return;
    
    const trianglePoints: [number, number][] = [
      [startLoc.latitude, startLoc.longitude],
      [currentLoc.latitude, currentLoc.longitude],
      [destLoc.latitude, destLoc.longitude],
    ];
    
    const directionColor = getDirectionColor(vehicle.dashboardStatus);
    const parsed = parseStatus(vehicle.dashboardStatus);
    
    const triangle = L.polygon(trianglePoints as L.LatLngExpression[], {
      className: [
        CSS_CLASSES.ROUTE_POLYLINE,
        `status-${parsed.category === 'dynamic' ? parsed.direction : 'static'}`,
        dimAll ? CSS_CLASSES.DIMMED : "",
      ].join(" "),
      fillColor: directionColor,
      color: directionColor,
      fillOpacity: MARKER_CONFIG.TRIANGLE_FILL_OPACITY,
      opacity: MARKER_CONFIG.TRIANGLE_OPACITY,
      weight: MARKER_CONFIG.TRIANGLE_WEIGHT,
    }).addTo(map);
    
    triangles[vehicle.id] = triangle;
  });
  
  return triangles;
}

/**
 * Add route paths (actual road routes)
 */
export function addRoutePaths(
  map: L.Map,
  vehicles: Vehicle[],
  dimAll: boolean,
  mockLocations: any[],
  zoomLevel: number
): Record<string, L.Polyline> {
  const paths: Record<string, L.Polyline> = {};
  
  vehicles.forEach((vehicle) => {
    if (!isDynamicVehicle(vehicle.dashboardStatus)) return;
    
    const startLoc = vehicle.start && mockLocations.find((l) => l.id === vehicle.start);
    const currentLoc = vehicle.currentLocation && mockLocations.find((l) => l.id === vehicle.currentLocation);
    const destLoc = vehicle.destination && mockLocations.find((l) => l.id === vehicle.destination);
    
    const directionColor = getDirectionColor(vehicle.dashboardStatus);
    const parsed = parseStatus(vehicle.dashboardStatus);
    const statusClass = `status-${parsed.category === 'dynamic' ? parsed.direction : 'static'}`;
    
    // Start to current (completed route) - solid line
    if (startLoc && currentLoc) {
      const startCurrentPoints: [number, number][] = [
        [startLoc.latitude, startLoc.longitude],
        [currentLoc.latitude, currentLoc.longitude],
      ];
      
      const startCurrentPath = L.polyline(startCurrentPoints as L.LatLngExpression[], {
        className: [
          CSS_CLASSES.ROUTE_PATH,
          CSS_CLASSES.START_CURRENT,
          statusClass,
          dimAll ? CSS_CLASSES.DIMMED : "",
        ].join(" "),
        color: directionColor,
        weight: MARKER_CONFIG.ROUTE_PATH_WEIGHT,
        opacity: MARKER_CONFIG.ROUTE_PATH_OPACITY,
      }).addTo(map);
      
      paths[`${vehicle.id}-start`] = startCurrentPath;
    }
    
    // Current to destination (remaining route) - dashed line
    if (currentLoc && destLoc) {
      const currentDestPoints: [number, number][] = [
        [currentLoc.latitude, currentLoc.longitude],
        [destLoc.latitude, destLoc.longitude],
      ];
      
      const currentDestPath = L.polyline(currentDestPoints as L.LatLngExpression[], {
        className: [
          CSS_CLASSES.ROUTE_PATH,
          CSS_CLASSES.CURRENT_DESTINATION,
          statusClass,
          dimAll ? CSS_CLASSES.DIMMED : "",
        ].join(" "),
        color: directionColor,
        weight: MARKER_CONFIG.ROUTE_PATH_WEIGHT,
        opacity: MARKER_CONFIG.ROUTE_PATH_OPACITY,
        dashArray: MARKER_CONFIG.ROUTE_PATH_DASH,
      }).addTo(map);
      
      paths[`${vehicle.id}-dest`] = currentDestPath;
    }
  });
  
  return paths;
}