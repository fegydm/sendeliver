// File: front/src/components/hauler/content/map-constants.ts
// Last change: Created unified constants file with all map configurations, types and colors

import { Vehicle } from '@/data/mockFleet';

// ===============================
// MAP CONFIGURATION
// ===============================
export const MAP_CONFIG = {
  // Leaflet settings
  DEFAULT_VIEW: [49, 15] as [number, number],
  DEFAULT_ZOOM: 6,
  MIN_ZOOM: 3,
  MAX_ZOOM: 17,
  ZOOM_SNAP: 0,
  ZOOM_DELTA: 0.05,
  
  // Tile settings
  TILE_URL: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
  TILE_ATTRIBUTION: "Map data © OpenStreetMap contributors, SRTM | Map style © OpenTopoMap (CC-BY-SA)",
  TILE_SUBDOMAINS: ["a", "b", "c"],
  TILE_SIZE: 256,
  KEEP_BUFFER: 6,
  
  // Performance settings
  ZOOM_ANIMATION: false,
  UPDATE_WHEN_IDLE: true,
  CROSS_ORIGIN: true,
  
  // Zoom handling
  DEBOUNCE_DELAY: 50,
  ZOOM_SENSITIVITY: 0.1,
  MIN_WHEEL_DELTA: 0.5,
  
  // Opacity and visibility
  DEFAULT_OPACITY: 1,
  DIMMED_OPACITY: 0.3,
  
  // Bounds and fitting
  BOUNDS_PADDING: [10, 10] as [number, number],
  MAX_ZOOM_ON_FIT: 8,
} as const;

// ===============================
// STATUS FILTER CATEGORIES
// ===============================
export const DYNAMIC_ACTIVITIES = ['moving', 'waiting', 'break'] as const;
export const DYNAMIC_DIRECTIONS = ['outbound', 'inbound', 'transit'] as const;
export const STATIC_TYPES = ['standby', 'depot', 'service'] as const;
export const DELAYS = ['ontime', 'delayed', 'critical'] as const;

// ===============================
// TYPESCRIPT TYPES
// ===============================
export type DynamicActivity = typeof DYNAMIC_ACTIVITIES[number];
export type DynamicDirection = typeof DYNAMIC_DIRECTIONS[number];
export type StaticType = typeof STATIC_TYPES[number];
export type Delay = typeof DELAYS[number];

export interface DynamicStatus {
  category: 'dynamic';
  direction: DynamicDirection;
  activity: DynamicActivity;
  delay: Delay;
}

export interface StaticStatus {
  category: 'static';
  type: StaticType;
  delay: Delay;
}

export type Status = DynamicStatus | StaticStatus;

// Filter categories for UI
export type FilterCategory = 'outbound' | 'inbound' | 'transit' | 'moving' | 'waiting' | 'break' | 'standby' | 'depot' | 'service';

// ===============================
// STATUS COLORS
// ===============================
export const statusColors: Record<DynamicDirection | DynamicActivity | StaticType, string> = {
  // Direction colors (3)
  outbound: "#2389ff",    // Blue
  inbound: "#1fbac7",     // Turquoise  
  transit: "#7a63ff",     // Purple
  
  // Activity/Speed colors (3)
  moving: "#d726ff",      // Magenta
  waiting: "#64748b",     // Gray-blue
  break: "#1e3a8a",       // Dark blue
  
  // Static type colors (3)
  standby: "#b5bd00",     // Yellow-green
  depot: "#8B4513",       // Brown
  service: "#e91e40",     // Red-magenta
};

export const delayColors: Record<Delay, string> = {
  ontime: "#4CAF50",      // Green
  delayed: "#FF9800",     // Orange  
  critical: "#F44336",    // Red
};

// ===============================
// MARKER CONFIGURATIONS
// ===============================
export const MARKER_CONFIG = {
  // Vehicle markers
  DYNAMIC_SIZE: [32, 32] as [number, number],
  STATIC_SIZE: [24, 24] as [number, number],
  DYNAMIC_ANCHOR: [16, 16] as [number, number],
  STATIC_ANCHOR: [12, 12] as [number, number],
  
  // Route markers
  ROUTE_MARKER_RADIUS: 6,
  ROUTE_MARKER_WEIGHT: 2,
  
  // Current circles
  CURRENT_CIRCLE_RADIUS: 8,
  
  // Parking markers
  PARKING_SIZE: [18, 18] as [number, number],
  
  // Flag markers
  FLAG_SIZE: [24, 24] as [number, number],
  
  // Polylines
  ROUTE_PATH_WEIGHT: 4,
  ROUTE_PATH_OPACITY: 0.8,
  ROUTE_PATH_DASH: "8,4",
  
  TRIANGLE_WEIGHT: 1,
  TRIANGLE_OPACITY: 0.5,
  TRIANGLE_FILL_OPACITY: 0.2,
} as const;

// ===============================
// ANIMATION SETTINGS
// ===============================
export const ANIMATION_CONFIG = {
  // Spinning wheel animations
  MOVING_DURATION: '0.8s',
  SLOW_DURATION: '2.8s',
  STOPPED_DURATION: '3s',
  
  // Transitions
  OPACITY_TRANSITION: '0.5s ease',
  FILTER_TRANSITION: 'filter 0.2s ease',
  
  // Animation classes
  SPINNING_CLASS: 'spinning',
  SLOW_SPIN_CLASS: 'slow-spin',
  STOPPED_CLASS: 'stopped',
} as const;

// ===============================
// CSS CLASSES
// ===============================
export const CSS_CLASSES = {
  // Vehicle markers
  VEHICLE_MARKER: 'vehicle-marker',
  NAVIGATION_MARKER: 'navigation-marker',
  DYNAMIC: 'dynamic',
  STATIC: 'static',
  DIMMED: 'dimmed',
  
  // Other markers
  CURRENT_CIRCLE: 'current-circle',
  PARKING_MARKER: 'parking-marker',
  FLAG_MARKER: 'flag-marker',
  ROUTE_MARKER: 'route-marker',
  
  // Polylines
  ROUTE_PATH: 'route-path',
  ROUTE_POLYLINE: 'route-polyline',
  START_CURRENT: 'start-current',
  CURRENT_DESTINATION: 'current-destination',
  
  // Map elements
  GREYSCALE_TILE: 'greyscale-tile',
  VEHICLE_TOOLTIP: 'custom-vehicle-tooltip',
} as const;

// ===============================
// LAYER Z-INDEX LEVELS
// ===============================
export const Z_INDEX = {
  TRIANGULAR_POLYLINES: 650,
  ROUTE_PATHS: 700,
  ROUTE_MARKERS: 750,
  STATIC_MARKERS: 800,
  CURRENT_CIRCLES: 850,
  FLAGS: 900,
  PARKING: 900,
  DYNAMIC_MARKERS: 1000,
} as const;

// ===============================
// ICON DEFINITIONS
// ===============================
export const ICONS = {
  PARKING_SVG: `<svg width="18" height="18" viewBox="0 0 18 18">
    <circle cx="9" cy="9" r="7" stroke="#333" stroke-width="2" />
    <text x="5" y="12" fill="#333" font-size="10" font-weight="bold">P</text>
  </svg>`,
  
  WHEEL_INDICATOR: `<div class="wheel-indicator"></div>`,
  
  TYPE_ICON_SQUARE: `<div class="vehicle-type-icon">■</div>`,
} as const;

// ===============================
// FILTER LABELS FOR UI
// ===============================
export const FILTER_LABELS: Record<FilterCategory, string> = {
  outbound: "Outbound",
  inbound: "Inbound", 
  transit: "Transit",
  moving: "Moving",
  waiting: "Waiting",
  break: "Break",
  standby: "Standby",
  depot: "Depot",
  service: "Service"
};

// ===============================
// FILTER ORDER FOR UI
// ===============================
export const FILTER_ORDER: FilterCategory[] = [
  // Direction filters
  'outbound', 'inbound', 'transit',
  // Speed filters  
  'moving', 'waiting', 'break',
  // Static filters
  'standby', 'depot', 'service'
];

// ===============================
// ALL POSSIBLE STATUSES
// ===============================
export const ALL_STATUSES: string[] = [
  "dynamic.outbound.moving.ontime",
  "dynamic.outbound.moving.delayed",
  "dynamic.outbound.moving.critical",
  "dynamic.outbound.waiting.ontime",
  "dynamic.outbound.waiting.delayed",
  "dynamic.outbound.break.ontime",
  "dynamic.inbound.moving.ontime",
  "dynamic.inbound.moving.delayed",
  "dynamic.inbound.break.ontime",
  "dynamic.inbound.break.delayed",
  "dynamic.transit.moving.ontime",
  "dynamic.transit.moving.delayed",
  "dynamic.transit.waiting.ontime",
  "static.standby.ontime",
  "static.standby.delayed",
  "static.depot.ontime",
  "static.depot.delayed",
  "static.service.delayed",
];

// ===============================
// VEHICLE TYPE IMAGES
// ===============================
export const VEHICLE_TYPE_IMAGES: Record<string, string> = {
  tractor: "/vehicles/truck-icon.svg",
  van: "/vehicles/van-icon.svg",
  trailer: "/vehicles/trailer-icon.svg",
  truck: "/vehicles/lorry-icon.svg",
};

export const DEFAULT_VEHICLE_IMAGE = "/vehicles/default-icon.svg";