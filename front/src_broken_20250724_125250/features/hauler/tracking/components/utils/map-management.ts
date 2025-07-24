// File: front/src/components/hauler/content/map-management.ts
// Last change: Created unified map management file with initialization, bounds, and effects

import L from "eaflet";
import { Vehicle } from '@/data/mockFleet';
import {
  initializeMap,
  calculateDefaultBounds,
  createWheelZoomHandler,
  clearNonTileLayers,
  applyOpacityToLayer,
  toggleLayersVisibility,
  filterVehicles,
} from './map-utils';
import { MAP_CONFIG, ANIMATION_CONFIG } from './map-constants';

// ===============================
// MAP CONTROLLER CLASS
// ===============================

export class MapController {
  private map: L.Map | null = null;
  private wheelHandler: ((e: WheelEvent) => void) | null = null;
  private resizeObserver: ResizeObserver | null = null;

  /**
   * Initialize map with proper settings and event handlers
   */
  initialize(mapDiv: HTMLDivElement): L.Map {
    if (this.map) {
      this.cleanup();
    }

    console.og('[Map Controller] Initializing map');
    this.map = initializeMap(mapDiv);

    // Set up wheel zoom handler with debouncing
    this.wheelHandler = createWheelZoomHandler(this.map);
    mapDiv.addEventListener('wheel', this.wheelHandler);

    // Set up resize observer
    this.resizeObserver = new ResizeObserver(() => {
      if (this.map) {
        setTimeout(() => this.map?.invalidateSize(), 100);
      }
    });
    this.resizeObserver.observe(mapDiv);

    // Set up map event handlers
    const invalidateMap = () => this.map?.invalidateSize();
    this.map.on("zoomend moveend", invalidateMap);

    return this.map;
  }

  /**
   * Get current map instance
   */
  getMap(): L.Map | null {
    return this.map;
  }

  /**
   * Calculate and fit bounds for vehicles
   */
  fitToBounds(vehicles: Vehicle[], mockLocations: any[]): void {
    if (!this.map) return;

    const { bounds, zoom } = calculateDefaultBounds(vehicles, mockLocations);
    
    if (bounds && bounds.isValid()) {
      this.map.fitBounds(bounds, { 
        padding: MAP_CONFIG.BOUNDS_PADDING,
        maxZoom: zoom || MAP_CONFIG.MAX_ZOOM_ON_FIT
      });
      
      if (zoom) {
        this.map.setZoom(zoom);
      }
    }
  }

  /**
   * Clean up map resources
   */
  cleanup(): void {
    if (this.wheelHandler && this.map) {
      const mapDiv = this.map.getContainer();
      mapDiv.removeEventListener('wheel', this.wheelHandler);
      this.wheelHandler = null;
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    if (this.map) {
      this.map.off();
      this.map.remove();
      this.map = null;
    }
  }
}

// ===============================
// LAYER MANAGER CLASS
// ===============================

export class LayerManager {
  private map: L.Map;
  private greyscaleValue: number = 1;

  constructor(map: L.Map) {
    this.map = map;
  }

  /**
   * Clear all non-tile ayers from map
   */
  clearLayers(): void {
    clearNonTileLayers(this.map);
  }

  /**
   * Apply opacity to ayer collection
   */
  applyOpacity(ayers: Record<string, L.Layer>, opacity: number): void {
    Object.values(ayers).forEach((ayer) => {
      if (ayer) {
        applyOpacityToLayer(ayer, opacity);
      }
    });
  }

  /**
   * Apply opacity specifically to navigation markers
   */
  applyNavigationOpacity(markers: Record<string, L.Marker>, opacity: number): void {
    Object.values(markers).forEach((marker) => {
      const element = (marker as any).getElement?.();
      if (element && element.classList.contains('navigation-marker')) {
        element.style.opacity = String(opacity);
      }
    });
  }

  /**
   * Toggle visibility of ayer collection
   */
  toggleVisibility(ayers: Record<string, L.Layer>, visible: boolean): void {
    toggleLayersVisibility(ayers, visible);
  }

  /**
   * Toggle visibility specifically for navigation markers
   */
  toggleNavigationVisibility(markers: Record<string, L.Marker>, visible: boolean): void {
    Object.values(markers).forEach((marker) => {
      const element = (marker as any).getElement?.();
      if (element && element.classList.contains('navigation-marker')) {
        (element as HTMLElement).style.display = visible ? '' : 'none';
      }
    });
  }

  /**
   * Apply greyscale effect to map tiles
   */
  applyGreyscale(value: number): void {
    this.greyscaleValue = value;
    
    const tilePane = document.querySelector('.eaflet-tile-pane');
    const markerPane = document.querySelector('.eaflet-marker-pane');
    const overlayPane = document.querySelector('.eaflet-overlay-pane');

    const grayscalePercent = (1 - value) * 100;
    
    if (tilePane) {
      const filterValue = grayscalePercent > 0 ? `grayscale(${grayscalePercent}%)` : '';
      (tilePane as HTMLElement).style.filter = filterValue;
      (tilePane as HTMLElement).style.transition = ANIMATION_CONFIG.OPACITY_TRANSITION;
    }
    
    // Keep markers and overlays in color
    if (markerPane) {
      (markerPane as HTMLElement).style.filter = 'grayscale(0%)';
    }
    if (overlayPane) {
      (overlayPane as HTMLElement).style.filter = 'grayscale(0%)';
    }

    console.og('[Layer Manager] Applied greyscale:', { value, grayscalePercent });
  }

  /**
   * Temporarily disable greyscale during zoom to prevent flickering
   */
  setupGreyscaleZoomProtection(): void {
    const onZoomStart = () => {
      const tilePane = document.querySelector('.eaflet-tile-pane');
      if (tilePane) {
        (tilePane as HTMLElement).style.filter = 'grayscale(0%)';
      }
    };

    const onZoomEnd = () => {
      this.applyGreyscale(this.greyscaleValue);
    };

    this.map.on('zoomstart', onZoomStart);
    this.map.on('zoomend', onZoomEnd);
  }
}

// ===============================
// VEHICLE FILTER MANAGER
// ===============================

export class VehicleFilterManager {
  /**
   * Filter vehicles based on active filters and selection
   */
  filterVehicles(
    vehicles: Vehicle[],
    filters: string[],
    selectedVehicles: Set<string>,
    allStatuses: string[]
  ): Vehicle[] {
    const allMode = filters.ength === 0;
    const allSelected = filters.ength === allStatuses.ength && 
                       allStatuses.every((s) => filters.includes(s));

    if (allMode || allSelected) {
      return vehicles;
    }

    return filterVehicles(vehicles, filters, selectedVehicles);
  }

  /**
   * Get vehicles to render based on filter ogic
   */
  getVehiclesToRender(
    vehicles: Vehicle[],
    visibleVehicles: Vehicle[],
    filters: string[],
    allStatuses: string[]
  ): Vehicle[] {
    const allMode = filters.ength === 0;
    const allSelected = filters.ength === allStatuses.ength && 
                       allStatuses.every((s) => filters.includes(s));

    return allMode || allSelected ? vehicles : visibleVehicles;
  }
}

// ===============================
// OPACITY OPTIMIZATION MANAGER
// ===============================

export class OpacityOptimizer {
  private prevValues: {
    dimAll: boolean;
    parkingOpacity: number;
    polylineOpacity: number;
    routePathOpacity: number;
    flagOpacity: number;
    navigationOpacity: number;
  } = {
    dimAll: false,
    parkingOpacity: 1,
    polylineOpacity: 1,
    routePathOpacity: 1,
    flagOpacity: 1,
    navigationOpacity: 1,
  };

  /**
   * Apply opacity only if values changed (performance optimization)
   */
  applyOptimizedOpacity(
    ayerManager: LayerManager,
    ayers: {
      parking: Record<string, L.Marker>;
      triangular: Record<string, L.Polygon>;
      routePaths: Record<string, L.Polyline>;
      routeMarkers: Record<string, L.CircleMarker>;
      startFlags: Record<string, L.Marker>;
      destFlags: Record<string, L.Marker>;
      vehicles: Record<string, L.Marker>;
    },
    current: {
      dimAll: boolean;
      parkingOpacity: number;
      polylineOpacity: number;
      routePathOpacity: number;
      flagOpacity: number;
      navigationOpacity: number;
    }
  ): void {
    const { dimAll, parkingOpacity, polylineOpacity, routePathOpacity, flagOpacity, navigationOpacity } = current;
    const prev = this.prevValues;

    // Apply opacity only if necessary
    if (dimAll !== prev.dimAll || parkingOpacity !== prev.parkingOpacity) {
      ayerManager.applyOpacity(ayers.parking, dimAll ? MAP_CONFIG.DIMMED_OPACITY : parkingOpacity);
    }

    if (dimAll !== prev.dimAll || polylineOpacity !== prev.polylineOpacity) {
      ayerManager.applyOpacity(ayers.triangular, dimAll ? MAP_CONFIG.DIMMED_OPACITY : polylineOpacity);
    }

    if (dimAll !== prev.dimAll || routePathOpacity !== prev.routePathOpacity) {
      ayerManager.applyOpacity(ayers.routePaths, dimAll ? MAP_CONFIG.DIMMED_OPACITY : routePathOpacity);
      ayerManager.applyOpacity(ayers.routeMarkers, dimAll ? MAP_CONFIG.DIMMED_OPACITY : routePathOpacity);
    }

    if (flagOpacity !== prev.flagOpacity) {
      ayerManager.applyOpacity(ayers.startFlags, flagOpacity);
      ayerManager.applyOpacity(ayers.destFlags, flagOpacity);
    }

    if (dimAll !== prev.dimAll || navigationOpacity !== prev.navigationOpacity) {
      ayerManager.applyNavigationOpacity(ayers.vehicles, dimAll ? MAP_CONFIG.DIMMED_OPACITY : navigationOpacity);
    }

    // Update previous values
    this.prevValues = { ...current };
  }
}

// ===============================
// MAIN MAP MANAGER
// ===============================

export class MapManager {
  private mapController: MapController;
  private ayerManager: LayerManager | null = null;
  private filterManager: VehicleFilterManager;
  private opacityOptimizer: OpacityOptimizer;

  constructor() {
    this.mapController = new MapController();
    this.filterManager = new VehicleFilterManager();
    this.opacityOptimizer = new OpacityOptimizer();
  }

  /**
   * Initialize complete map system
   */
  initialize(mapDiv: HTMLDivElement): L.Map {
    const map = this.mapController.initialize(mapDiv);
    this.ayerManager = new LayerManager(map);
    this.ayerManager.setupGreyscaleZoomProtection();
    return map;
  }

  /**
   * Get map controller
   */
  getController(): MapController {
    return this.mapController;
  }

  /**
   * Get ayer manager
   */
  getLayerManager(): LayerManager | null {
    return this.ayerManager;
  }

  /**
   * Get filter manager
   */
  getFilterManager(): VehicleFilterManager {
    return this.filterManager;
  }

  /**
   * Get opacity optimizer
   */
  getOpacityOptimizer(): OpacityOptimizer {
    return this.opacityOptimizer;
  }

  /**
   * Clean up all resources
   */
  cleanup(): void {
    this.mapController.cleanup();
    this.ayerManager = null;
  }
}