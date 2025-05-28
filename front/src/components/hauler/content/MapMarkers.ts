// File: front/src/components/hauler/content/MapMarkers.ts
// Last change: Fixed activity property access - changed parsed.activity to parsed.speed

import L from "leaflet";
import { Vehicle, parseStatus, getDirectionColor, DYNAMIC_ACTIVITIES, DYNAMIC_DIRECTIONS, STATIC_TYPES, DELAYS } from "@/data/mockFleet";
import StartFlag from "@/assets/flags/StartFlag.svg";
import FinishFlag from "@/assets/flags/FinishFlag.svg";
import "./MapMarkers.css";

// Define types locally to match mockFleet
type DynamicActivity = typeof DYNAMIC_ACTIVITIES[number];
type DynamicDirection = typeof DYNAMIC_DIRECTIONS[number];
type StaticType = typeof STATIC_TYPES[number];
type Delay = typeof DELAYS[number];

interface DynamicStatus {
  category: 'dynamic';
  direction: DynamicDirection;
  activity: DynamicActivity;
  delay: Delay;
}

interface StaticStatus {
  category: 'static';
  type: StaticType;
  delay: Delay;
}

type Status = DynamicStatus | StaticStatus;

// Check if vehicle is dynamic (has route)
const isDynamicVehicle = (status: string): boolean => {
  const parsed = parseStatus(status);
  return parsed.category === "dynamic";
};

// Generate navigation marker HTML based on vehicle type
const generateNavigationMarkerHTML = (vehicle: Vehicle): string => {
  const isDynamic = isDynamicVehicle(vehicle.dashboardStatus);
  const parsed = parseStatus(vehicle.dashboardStatus);
  const directionColor = getDirectionColor(vehicle.dashboardStatus);
  const speed = vehicle.speed || 0;
  
  if (isDynamic) {
    // Spinning wheel for dynamic vehicles
    const isMoving = parsed.category === 'dynamic' && parsed.activity === 'moving';
    const animationClass = isMoving ? 'spinning' : (speed > 0 ? 'slow-spin' : 'stopped');
    
    return `
      <div class="vehicle-marker-wheel ${animationClass}" style="border-color: ${directionColor};">
        <div class="vehicle-speed">${speed}</div>
        <div class="wheel-indicator"></div>
      </div>
    `;
  } else {
    // Square marker for static vehicles
    return `
      <div class="vehicle-marker-square" style="background-color: ${directionColor};">
        <div class="vehicle-type-icon">■</div>
      </div>
    `;
  }
};

export function addVehicleMarkers(
  map: L.Map,
  vehicles: Vehicle[],
  dimAll: boolean,
  mockLocations: typeof import("@/data/mockLocations").default
): Record<string, L.Marker> {
  const markers: Record<string, L.Marker> = {};
  
  vehicles.forEach((v) => {
    const idLoc = v.currentLocation || v.location;
    if (!idLoc) return;
    
    const loc = mockLocations.find((l) => l.id === idLoc);
    if (!loc) return;
    
    const isDynamic = isDynamicVehicle(v.dashboardStatus);
    const parsed = parseStatus(v.dashboardStatus);
    const markerHTML = generateNavigationMarkerHTML(v);
    
    const marker = L.marker([loc.latitude, loc.longitude], {
      icon: L.divIcon({
        className: [
          "vehicle-marker",
          "navigation-marker",
          isDynamic ? "dynamic" : "static",
          `status-${parsed.category}`,
          dimAll ? "dimmed" : "",
        ].join(" "),
        html: markerHTML,
        iconSize: isDynamic ? [32, 32] : [24, 24],
        iconAnchor: isDynamic ? [16, 16] : [12, 12],
      }),
    }).addTo(map);
    
    // Enhanced tooltip with vehicle info
    const tooltipContent = `
      <div class="vehicle-tooltip">
        <strong>${v.plateNumber || v.name}</strong><br/>
        <span class="tooltip-status">Status: ${parsed.category}</span><br/>
        ${isDynamic ? `<span class="tooltip-speed">Speed: ${v.speed || 0} km/h</span><br/>` : ''}
        <span class="tooltip-location">Location: ${loc.name || idLoc}</span>
      </div>
    `;
    
    marker.bindTooltip(tooltipContent, { 
      direction: 'top', 
      offset: [0, isDynamic ? -20 : -16],
      className: 'custom-vehicle-tooltip'
    });
    
    markers[v.id] = marker;
  });
  
  return markers;
}

export function addCurrentCircles(
  map: L.Map,
  vehicles: Vehicle[],
  dimAll: boolean,
  mockLocations: typeof import("@/data/mockLocations").default
): Record<string, L.CircleMarker> {
  const circles: Record<string, L.CircleMarker> = {};
  
  vehicles.forEach((v) => {
    if (!v.currentLocation || !isDynamicVehicle(v.dashboardStatus)) return;
    
    const loc = mockLocations.find((l) => l.id === v.currentLocation);
    if (!loc) return;
    
    const parsed = parseStatus(v.dashboardStatus);
    
    const circle = L.circleMarker([loc.latitude, loc.longitude], {
      className: [
        "current-circle",
        `status-${parsed.category === 'dynamic' ? parsed.direction : 'static'}`,
        dimAll ? "dimmed" : "",
      ].join(" "),
      radius: 8,
    }).addTo(map);
    
    circles[v.id] = circle;
  });
  
  return circles;
}

export function addParkingMarkers(
  map: L.Map,
  vehicles: Vehicle[],
  dimAll: boolean,
  mockLocations: typeof import("@/data/mockLocations").default
): Record<string, L.Marker> {
  const parking: Record<string, L.Marker> = {};
  
  vehicles.forEach((v) => {
    if (!v.nearestParking) return;
    
    const loc = mockLocations.find((l) => l.id === v.nearestParking);
    if (!loc) return;
    
    const marker = L.marker([loc.latitude, loc.longitude], {
      icon: L.divIcon({
        className: [
          "parking-marker",
          `status-${loc.status || 'free'}`,
          dimAll ? "dimmed" : "",
        ].join(" "),
        html: `<svg width="18" height="18" viewBox="0 0 18 18"><circle cx="9" cy="9" r="7" stroke="#333" stroke-width="2" /><text x="5" y="12" fill="#333" font-size="10" font-weight="bold">P</text></svg>`,
        iconSize: [18, 18],
      }),
    }).addTo(map);
    
    marker.bindTooltip(`${loc.name} (${loc.status || 'free'})`, { direction: 'top', offset: [0, -10] });
    parking[v.id] = marker;
  });
  
  return parking;
}

// Triangular polylines (filled areas between 3 points)
export function addTriangularPolylines(
  map: L.Map,
  vehicles: Vehicle[],
  dimAll: boolean,
  mockLocations: typeof import("@/data/mockLocations").default
): Record<string, L.Polygon> {
  const triangles: Record<string, L.Polygon> = {};
  
  vehicles.forEach((v) => {
    if (!isDynamicVehicle(v.dashboardStatus)) return;
    
    const start = v.start && mockLocations.find((l) => l.id === v.start);
    const curr = v.currentLocation && mockLocations.find((l) => l.id === v.currentLocation);
    const dest = v.destination && mockLocations.find((l) => l.id === v.destination);
    
    // Need all 3 points to create a triangle
    if (!start || !curr || !dest) return;
    
    const trianglePoints: [number, number][] = [
      [start.latitude, start.longitude],
      [curr.latitude, curr.longitude],
      [dest.latitude, dest.longitude],
    ];
    
    const directionColor = getDirectionColor(v.dashboardStatus);
    const parsed = parseStatus(v.dashboardStatus);
    
    const triangle = L.polygon(trianglePoints as L.LatLngExpression[], {
      className: [
        "route-polyline",
        `status-${parsed.category === 'dynamic' ? parsed.direction : 'static'}`,
        dimAll ? "dimmed" : "",
      ].join(" "),
      fillColor: directionColor,
      color: directionColor,
      fillOpacity: 0.2,
      opacity: 0.5,
      weight: 1,
    }).addTo(map);
    
    triangles[v.id] = triangle;
  });
  
  return triangles;
}

// Route paths (actual road routes)
export function addRoutePaths(
  map: L.Map,
  vehicles: Vehicle[],
  dimAll: boolean,
  mockLocations: typeof import("@/data/mockLocations").default,
  zoomLevel: number
): Record<string, L.Polyline> {
  const paths: Record<string, L.Polyline> = {};
  
  vehicles.forEach((v) => {
    if (!isDynamicVehicle(v.dashboardStatus)) return;
    
    const start = v.start && mockLocations.find((l) => l.id === v.start);
    const curr = v.currentLocation && mockLocations.find((l) => l.id === v.currentLocation);
    const dest = v.destination && mockLocations.find((l) => l.id === v.destination);
    
    const directionColor = getDirectionColor(v.dashboardStatus);
    const parsed = parseStatus(v.dashboardStatus);
    
    // Start to current (completed route) - solid line
    if (start && curr) {
      let startCurrPoints: [number, number][];
      
      if (zoomLevel <= 8) {
        // Low zoom: straight line
        startCurrPoints = [
          [start.latitude, start.longitude],
          [curr.latitude, curr.longitude],
        ];
      } else {
        // High zoom: actual road route (TODO: integrate routing service)
        startCurrPoints = [
          [start.latitude, start.longitude],
          [curr.latitude, curr.longitude],
        ];
      }
      
      const startCurrPath = L.polyline(startCurrPoints as L.LatLngExpression[], {
        className: [
          "route-path",
          "start-current",
          `status-${parsed.category === 'dynamic' ? parsed.direction : 'static'}`,
          dimAll ? "dimmed" : "",
        ].join(" "),
        color: directionColor,
        weight: 4,
        opacity: 0.8,
      }).addTo(map);
      
      paths[`${v.id}-start`] = startCurrPath;
    }
    
    // Current to destination (remaining route) - dashed line
    if (curr && dest) {
      let currDestPoints: [number, number][];
      
      if (zoomLevel <= 8) {
        // Low zoom: straight line
        currDestPoints = [
          [curr.latitude, curr.longitude],
          [dest.latitude, dest.longitude],
        ];
      } else {
        // High zoom: actual road route (TODO: integrate routing service)
        currDestPoints = [
          [curr.latitude, curr.longitude],
          [dest.latitude, dest.longitude],
        ];
      }
      
      const currDestPath = L.polyline(currDestPoints as L.LatLngExpression[], {
        className: [
          "route-path",
          "current-destination", 
          `status-${parsed.category === 'dynamic' ? parsed.direction : 'static'}`,
          dimAll ? "dimmed" : "",
        ].join(" "),
        color: directionColor,
        weight: 4,
        opacity: 0.8,
        dashArray: "8,4",
      }).addTo(map);
      
      paths[`${v.id}-dest`] = currDestPath;
    }
  });
  
  return paths;
}

export function addRouteMarkers(
  map: L.Map,
  vehicles: Vehicle[],
  dimAll: boolean,
  mockLocations: typeof import("@/data/mockLocations").default
): Record<string, L.CircleMarker> {
  const markers: Record<string, L.CircleMarker> = {};
  
  vehicles.forEach((v) => {
    if (!isDynamicVehicle(v.dashboardStatus)) return;
    
    const directionColor = getDirectionColor(v.dashboardStatus);
    const parsed = parseStatus(v.dashboardStatus);
    
    const points = [
      v.start && mockLocations.find((l) => l.id === v.start),
      v.currentLocation && mockLocations.find((l) => l.id === v.currentLocation),
      v.destination && mockLocations.find((l) => l.id === v.destination),
    ];
    
    points.forEach((loc, index) => {
      if (!loc) return;
      
      const key = `${v.id}-${index === 0 ? 'start' : index === 1 ? 'current' : 'destination'}`;
      
      const marker = L.circleMarker([loc.latitude, loc.longitude], {
        className: [
          "route-marker",
          `status-${parsed.category === 'dynamic' ? parsed.direction : 'static'}`,
          dimAll ? "dimmed" : "",
        ].join(" "),
        radius: 6,
        color: directionColor,
        fillColor: directionColor,
        fillOpacity: 1,
        weight: 2,
      }).addTo(map);
      
      markers[key] = marker;
    });
  });
  
  return markers;
}

export function addFlagMarkers(
  map: L.Map,
  vehicles: Vehicle[],
  dimAll: boolean,
  mockLocations: typeof import("@/data/mockLocations").default
): { start: Record<string, L.Marker>; destination: Record<string, L.Marker> } {
  const start: Record<string, L.Marker> = {};
  const destination: Record<string, L.Marker> = {};
  
  vehicles.forEach((v) => {
    if (!isDynamicVehicle(v.dashboardStatus)) return;
    
    const parsed = parseStatus(v.dashboardStatus);
    
    if (v.start) {
      const loc = mockLocations.find((l) => l.id === v.start);
      if (!loc) return;
      
      const m = L.marker([loc.latitude, loc.longitude], {
        icon: L.icon({
          iconUrl: StartFlag,
          className: [
            "flag-marker",
            "start",
            `status-${parsed.category === 'dynamic' ? parsed.direction : 'static'}`,
            dimAll ? "dimmed" : "",
          ].join(" "),
        }),
      }).addTo(map);
      
      start[v.id] = m;
    }
    
    if (v.destination) {
      const loc = mockLocations.find((l) => l.id === v.destination);
      if (!loc) return;
      
      const m = L.marker([loc.latitude, loc.longitude], {
        icon: L.icon({
          iconUrl: FinishFlag,
          className: [
            "flag-marker",
            "destination",
            `status-${parsed.category === 'dynamic' ? parsed.direction : 'static'}`,
            dimAll ? "dimmed" : "",
          ].join(" "),
        }),
      }).addTo(map);
      
      destination[v.id] = m;
    }
  });
  
  return { start, destination };
}