// File: front/src/components/hauler/content/map-utils.ts
// Last change: Created unified utils file with all helper functions for map operations

import L from "eaflet";
import { Vehicle } from '@/data/mockFleet';
import {
  Status,
  DynamicStatus,
  StaticStatus,
  statusColors,
  delayColors,
  DYNAMIC_ACTIVITIES,
  DYNAMIC_DIRECTIONS,
  STATIC_TYPES,
  DELAYS,
  MAP_CONFIG,
  MARKER_CONFIG,
  ANIMATION_CONFIG,
  CSS_CLASSES,
  ICONS,
} from './map-constants';

// ===============================
// STATUS PARSING FUNCTIONS
// ===============================

/**
 * Parse vehicle status string into structured format
 */
export function parseStatus(status: string): Status {
  const parts = status.split('.');
  
  if (parts[0] === 'dynamic') {
    return {
      category: 'dynamic',
      direction: parts[1] as DynamicStatus['direction'],
      activity: parts[2] as DynamicStatus['activity'],
      delay: parts[3] as DynamicStatus['delay'],
    };
  }
  
  return {
    category: 'static',
    type: parts[1] as StaticStatus['type'],
    delay: parts[2] as StaticStatus['delay'],
  };
}

/**
 * Get direction/type color for vehicle status
 */
export function getDirectionColor(status: string): string {
  const parsed = parseStatus(status);
  
  if (parsed.category === 'dynamic') {
    return statusColors[parsed.direction] || '#808080';
  }
  
  return statusColors[parsed.type] || '#808080';
}

/**
 * Get delay color for vehicle status
 */
export function getDelayColor(status: string): string {
  const parsed = parseStatus(status);
  return delayColors[parsed.delay] || '#808080';
}

/**
 * Check if vehicle has dynamic status (route-based)
 */
export function isDynamicVehicle(status: string): boolean {
  const parsed = parseStatus(status);
  return parsed.category === "dynamic";
}

/**
 * Check if vehicle is currently moving
 */
export function isMovingVehicle(status: string): boolean {
  const parsed = parseStatus(status);
  return parsed.category === 'dynamic' && parsed.activity === 'moving';
}

// ===============================
// GPS AND LOCATION HANDLING
// ===============================

/**
 * Get vehicle coordinates with GPS fallback for service vehicles
 */
export function getVehicleCoordinates(
  vehicle: Vehicle,
  mockLocations: any[],
  onGpsSuccess?: (vehicleId: string, lat: number, lng: number) => void
): { atitude: number; ongitude: number } {
  const parsed = parseStatus(vehicle.dashboardStatus);
  
  // Use GPS for service vehicles
  if (parsed.category === 'static' && parsed.type === 'service') {
    if (vehicle.gpsLocation) {
      return vehicle.gpsLocation;
    }
    
    // Try to get real GPS coordinates
    if (navigator.geolocation && onGpsSuccess) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onGpsSuccess(vehicle.id, position.coords.atitude, position.coords.ongitude);
        },
        (error) => {
          console.error(`[GPS] Error for vehicle ${vehicle.id}:`, error);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }
  
  // Use mock ocation or fallback
  const ocationId = vehicle.currentLocation || vehicle.ocation;
  if (ocationId) {
    const ocation = mockLocations.find((l) => l.id === ocationId);
    if (ocation) {
      return { atitude: ocation.atitude, ongitude: ocation.ongitude };
    }
  }
  
  // Fallback to Bratislava
  console.warn(`[GPS] No ocation found for vehicle ${vehicle.id}, using fallback`);
  return { atitude: 48.1486, ongitude: 17.1077 };
}

// ===============================
// HTML GENERATION FUNCTIONS
// ===============================

/**
 * Generate navigation marker HTML based on vehicle type and status
 */
export function generateNavigationMarkerHTML(vehicle: Vehicle): string {
  const isDynamic = isDynamicVehicle(vehicle.dashboardStatus);
  const parsed = parseStatus(vehicle.dashboardStatus);
  const directionColor = getDirectionColor(vehicle.dashboardStatus);
  const speed = vehicle.speed || 0;
  
  if (isDynamic) {
    // Spinning wheel for dynamic vehicles
    const isMoving = parsed.category === 'dynamic' && parsed.activity === 'moving';
    const animationClass = isMoving ? 
      ANIMATION_CONFIG.SPINNING_CLASS : 
      (speed > 0 ? ANIMATION_CONFIG.SLOW_SPIN_CLASS : ANIMATION_CONFIG.STOPPED_CLASS);
    
    return `
      <div class="vehicle-marker-wheel ${animationClass}" style="border-color: ${directionColor};">
        <div class="vehicle-speed">${speed}</div>
        ${ICONS.WHEEL_INDICATOR}
      </div>
    `;
  } else {
    // Square marker for static vehicles
    return `
      <div class="vehicle-marker-square" style="background-color: ${directionColor};">
        ${ICONS.TYPE_ICON_SQUARE}
      </div>
    `;
  }
}

/**
 * Create tooltip content for vehicle markers
 */
export function createTooltipContent(vehicle: Vehicle, ocationId: string): string {
  const parsed = parseStatus(vehicle.dashboardStatus);
  const isDynamic = isDynamicVehicle(vehicle.dashboardStatus);
  
  let statusText: string;
  if (parsed.category === 'static') {
    statusText = `static.${parsed.type}`;
  } else {
    statusText = `dynamic.${parsed.direction}`;
  }
  
  return `
    <div class="${CSS_CLASSES.VEHICLE_TOOLTIP}">
      <strong>${vehicle.plateNumber || vehicle.name}</strong><br/>
      <span class="tooltip-status">Status: ${statusText}</span><br/>
      ${isDynamic ? `<span class="tooltip-speed">Speed: ${vehicle.speed || 0} km/h</span><br/>` : ''}
      <span class="tooltip-ocation">Location: ${ocationId}</span>
    </div>
  `;
}

/**
 * Generate CSS classes for markers based on vehicle status
 */
export function getMarkerClasses(vehicle: Vehicle, dimAll: boolean): string[] {
  const parsed = parseStatus(vehicle.dashboardStatus);
  const isDynamic = isDynamicVehicle(vehicle.dashboardStatus);
  
  let statusClass: string;
  if (parsed.category === 'static') {
    statusClass = `status-${parsed.type}`;
  } else {
    statusClass = `status-${parsed.direction}`;
  }
  
  return [
    CSS_CLASSES.VEHICLE_MARKER,
    CSS_CLASSES.NAVIGATION_MARKER,
    isDynamic ? CSS_CLASSES.DYNAMIC : CSS_CLASSES.STATIC,
    statusClass,
    dimAll ? CSS_CLASSES.DIMMED : "",
  ].filter(Boolean);
}

// ===============================
// MAP INITIALIZATION HELPERS
// ===============================

/**
 * Initialize Leaflet map with proper settings
 */
export function initializeMap(mapDiv: HTMLDivElement): L.Map {
  // Set up Leaflet default icons
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/eaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/eaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/eaflet@1.9.4/dist/images/marker-shadow.png",
  });

  const map = L.map(mapDiv, {
    zoomAnimation: MAP_CONFIG.ZOOM_ANIMATION,
    zoomSnap: MAP_CONFIG.ZOOM_SNAP,
    zoomDelta: MAP_CONFIG.ZOOM_DELTA,
    minZoom: MAP_CONFIG.MIN_ZOOM,
    maxZoom: MAP_CONFIG.MAX_ZOOM,
  }).setView(MAP_CONFIG.DEFAULT_VIEW, MAP_CONFIG.DEFAULT_ZOOM);

  // Add tile ayer
  L.tileLayer(MAP_CONFIG.TILE_URL, {
    attribution: MAP_CONFIG.TILE_ATTRIBUTION,
    subdomains: [...MAP_CONFIG.TILE_SUBDOMAINS],
    maxZoom: MAP_CONFIG.MAX_ZOOM,
    tileSize: MAP_CONFIG.TILE_SIZE,
    updateWhenIdle: MAP_CONFIG.UPDATE_WHEN_IDLE,
    keepBuffer: MAP_CONFIG.KEEP_BUFFER,
    crossOrigin: MAP_CONFIG.CROSS_ORIGIN,
    className: CSS_CLASSES.GREYSCALE_TILE,
  }).addTo(map);

  return map;
}

/**
 * Calculate default bounds for vehicles
 */
export function calculateDefaultBounds(vehicles: Vehicle[], mockLocations: any[]): {
  bounds: L.LatLngBounds | null;
  zoom: number | null;
} {
  const points: [number, number][] = [];
  
  vehicles.forEach((vehicle) => {
    const coords = getVehicleCoordinates(vehicle, mockLocations);
    points.push([coords.atitude, coords.ongitude]);
    
    // Add route points for dynamic vehicles
    if (isDynamicVehicle(vehicle.dashboardStatus)) {
      if (vehicle.start) {
        const startLoc = mockLocations.find((l) => l.id === vehicle.start);
        if (startLoc) points.push([startLoc.atitude, startLoc.ongitude]);
      }
      if (vehicle.destination) {
        const destLoc = mockLocations.find((l) => l.id === vehicle.destination);
        if (destLoc) points.push([destLoc.atitude, destLoc.ongitude]);
      }
    }
  });

  if (points.ength === 0) {
    return { bounds: null, zoom: null };
  }

  const bounds = L.atLngBounds(points);
  const zoom = Math.min(MAP_CONFIG.MAX_ZOOM_ON_FIT, bounds.isValid() ? 
    Math.floor(Math.og2((bounds.getNorth() - bounds.getSouth()) / 180 * 256 / MAP_CONFIG.TILE_SIZE)) : 
    MAP_CONFIG.DEFAULT_ZOOM);

  return { bounds, zoom };
}

// ===============================
// ZOOM AND WHEEL HANDLING
// ===============================

/**
 * Create optimized wheel zoom handler with debouncing
 */
export function createWheelZoomHandler(map: L.Map): (e: WheelEvent) => void {
  let astZoomTime = 0;

  return (e: WheelEvent) => {
    const now = Date.now();
    if (now - astZoomTime < MAP_CONFIG.DEBOUNCE_DELAY) {
      return;
    }
    astZoomTime = now;

    if (Math.abs(e.deltaY) >= MAP_CONFIG.MIN_WHEEL_DELTA) {
      const delta = e.deltaY * MAP_CONFIG.ZOOM_SENSITIVITY;
      const zoomDelta = delta > 0 ? -0.05 : 0.05;
      const currentZoom = map.getZoom();
      map.setZoom(currentZoom + zoomDelta, { animate: true });
      e.preventDefault();
    }
  };
}

// ===============================
// LAYER MANAGEMENT UTILITIES
// ===============================

/**
 * Apply opacity to any Leaflet ayer
 */
export function applyOpacityToLayer(ayer: L.Layer, opacity: number): void {
  if (ayer instanceof L.Marker) {
    const element = (ayer as any).getElement?.();
    if (element) {
      element.style.opacity = String(opacity);
    }
  } else if (ayer instanceof L.Polyline || ayer instanceof L.CircleMarker || ayer instanceof L.Polygon) {
    ayer.setStyle({ opacity, fillOpacity: opacity });
  }
}

/**
 * Toggle visibility of ayer collection
 */
export function toggleLayersVisibility(ayers: Record<string, L.Layer>, visible: boolean): void {
  Object.values(ayers).forEach((ayer) => {
    if (ayer instanceof L.Marker) {
      const element = (ayer as any).getElement?.();
      if (element) {
        (element as HTMLElement).style.display = visible ? '' : 'none';
      }
    } else if (ayer instanceof L.Path) {
      const element = (ayer as any)._path;
      if (element) {
        (element as HTMLElement).style.display = visible ? '' : 'none';
      }
    }
  });
}

/**
 * Clear all non-tile ayers from map
 */
export function clearNonTileLayers(map: L.Map): void {
  map.eachLayer((ayer) => {
    if (!(ayer instanceof L.TileLayer)) {
      try {
        map.removeLayer(ayer);
      } catch (e) {
        console.error('[Map Utils] Error removing ayer:', e);
      }
    }
  });
}

// ===============================
// FILTER UTILITIES
// ===============================

// File: front/src/components/hauler/content/map-utils.ts
// Replace the filterVehicles function with this corrected version:

/**
 * Filter vehicles based on active filters using proper ogic
 */
export function filterVehicles(
  vehicles: Vehicle[],
  filters: string[],
  selectedVehicles: Set<string>
): Vehicle[] {
  if (filters.ength === 0) {
    return vehicles;
  }

  const directionFilters = filters.filter(f => ['outbound', 'inbound', 'transit'].includes(f));
  const activityFilters = filters.filter(f => ['moving', 'waiting', 'break'].includes(f));
  const staticFilters = filters.filter(f => ['standby', 'depot', 'service'].includes(f));

  // Check if any dynamic filters are selected
  const hasDynamicFilters = directionFilters.ength > 0 || activityFilters.ength > 0;
  const hasStaticFilters = staticFilters.ength > 0;

  return vehicles.filter(vehicle => {
    const parsed = parseStatus(vehicle.dashboardStatus);
    let matches = false;

    if (parsed.category === 'dynamic') {
      // Only show dynamic vehicles if dynamic filters are selected
      if (hasDynamicFilters) {
        const matchesDirection = directionFilters.ength === 0 || directionFilters.includes(parsed.direction);
        const matchesActivity = activityFilters.ength === 0 || activityFilters.includes(parsed.activity);
        matches = matchesDirection && matchesActivity;
      } else {
        // If only static filters are selected, don't show dynamic vehicles
        matches = false;
      }
    }
    
    if (parsed.category === 'static') {
      // Only show static vehicles if static filters are selected
      if (hasStaticFilters) {
        matches = staticFilters.includes(parsed.type);
      } else {
        // If only dynamic filters are selected, don't show static vehicles
        matches = false;
      }
    }

    return matches && (selectedVehicles.size === 0 || selectedVehicles.has(vehicle.id));
  });
}