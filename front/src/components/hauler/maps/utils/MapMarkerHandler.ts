// File: front/src/components/hauler/content/MapMarkerHandler.ts
// Last change: Fixed TypeScript errors for style property access

import L from "leaflet";
import { Vehicle } from "@/data/mockFleet";

/**
 * Pridáva click handlery na markery vozidiel
 * @param markers Objekty markerov
 * @param vehicles Zoznam vozidiel
 * @param onMarkerClick Callback funkcia volaná pri kliknutí na marker
 */
export function addMarkerClickHandlers(
  markers: Record<string, L.Marker>,
  vehicles: Vehicle[],
  onMarkerClick: (vehicle: Vehicle) => void
): void {
  Object.entries(markers).forEach(([vehicleId, marker]) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;
    
    // Odstránenie predchádzajúcich handlerov
    marker.off('click');
    
    // Pridanie click handlera
    marker.on('click', () => {
      onMarkerClick(vehicle);
    });
    
    // Zmena kurzora pre indikáciu klikateľnosti
    const element = marker.getElement();
    if (element) {
      element.style.cursor = 'pointer';
    }
    
    // Pridanie tooltip
    marker.bindTooltip(`${vehicle.name} (${vehicle.plateNumber || 'N/A'})`, {
      direction: 'top',
      offset: L.point(0, -10)
    });
  });
}

/**
 * Pridáva click handlery na kruhové markery
 * @param circles Objekty kruhových markerov
 * @param vehicles Zoznam vozidiel
 * @param onMarkerClick Callback funkcia volaná pri kliknutí na marker
 */
export function addCircleClickHandlers(
  circles: Record<string, L.CircleMarker>,
  vehicles: Vehicle[],
  onMarkerClick: (vehicle: Vehicle) => void
): void {
  Object.entries(circles).forEach(([vehicleId, circle]) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;
    
    // Odstránenie predchádzajúcich handlerov
    circle.off('click');
    
    // Pridanie click handlera
    circle.on('click', () => {
      onMarkerClick(vehicle);
    });
    
    // Zmena kurzora pre indikáciu klikateľnosti
    const circleElement = circle.getElement();
    if (circleElement) {
      (circleElement as HTMLElement).style.cursor = 'pointer';
    }
    
    // Pridanie tooltip
    circle.bindTooltip(`${vehicle.name} (aktuálna poloha)`, {
      direction: 'top',
      offset: L.point(0, -8)
    });
  });
}

/**
 * Pridáva click handlery na čiary trás
 * @param polylines Objekty polyline
 * @param vehicles Zoznam vozidiel
 * @param onPolylineClick Callback funkcia volaná pri kliknutí na čiaru
 */
export function addPolylineClickHandlers(
  polylines: Record<string, L.Polyline>,
  vehicles: Vehicle[],
  onPolylineClick: (vehicle: Vehicle) => void
): void {
  Object.entries(polylines).forEach(([key, polyline]) => {
    // Extrahujeme ID vozidla (môže obsahovať suffix ako "-start" alebo "-dest")
    const vehicleId = key.split('-')[0];
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;
    
    // Odstránenie predchádzajúcich handlerov
    polyline.off('click');
    
    // Pridanie click handlera
    polyline.on('click', () => {
      onPolylineClick(vehicle);
    });
    
    // Zmena kurzora pre indikáciu klikateľnosti
    const polylineElement = polyline.getElement();
    if (polylineElement) {
      (polylineElement as HTMLElement).style.cursor = 'pointer';
    }
    
    // Pridanie tooltip pre trasy
    if (key.includes('-start')) {
      polyline.bindTooltip(`${vehicle.name}: Štart → Aktuálna poloha`, {
        sticky: true
      });
    } else if (key.includes('-dest')) {
      polyline.bindTooltip(`${vehicle.name}: Aktuálna poloha → Cieľ`, {
        sticky: true
      });
    } else {
      polyline.bindTooltip(`${vehicle.name}: Trasa`, {
        sticky: true
      });
    }
  });
}