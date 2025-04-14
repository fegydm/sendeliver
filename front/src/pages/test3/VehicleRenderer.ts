// File: src/components/maps/VehicleRenderer.ts
// Last change: Obnovenie logovania

import { lngLatToPixel } from './MapUtils';

export type Vehicle = {
  id: string;
  lat: number;
  lng: number;
  image: string;
  location: string;
};

export const preloadVehicleImages = (
  vehicles: Vehicle[],
  vehicleImages: Map<string, HTMLImageElement>,
  requestRender: () => void
) => {
  console.log('[VehicleRenderer] Preload:', vehicles.length);
  vehicles.forEach((vehicle) => {
    console.log('[VehicleRenderer] Load:', vehicle.id, vehicle.image);
    if (!vehicleImages.has(vehicle.id)) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = vehicle.image;

      img.onload = () => {
        vehicleImages.set(vehicle.id, img);
        console.log('[VehicleRenderer] Loaded:', vehicle.id);
        requestRender();
      };

      img.onerror = () => {
        console.error('[VehicleRenderer] Load failed:', vehicle.id, vehicle.image);
        requestRender();
      };
    }
  });
};

export const drawVehicles = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  mapState: { zoom: number; center: [number, number]; offsetX: number; offsetY: number },
  vehicles: Vehicle[],
  vehicleImages: Map<string, HTMLImageElement>
) => {
  console.log('[VehicleRenderer] Draw:', vehicles.length);
  const { zoom, center, offsetX, offsetY } = mapState;
  const centerPixel = lngLatToPixel(center[1], center[0], zoom);
  console.log('[VehicleRenderer] Center pixel:', centerPixel);

  vehicles.forEach((vehicle) => {
    console.log('[VehicleRenderer] Vehicle:', vehicle.id, 'lat:', vehicle.lat, 'lng:', vehicle.lng);
    const vehiclePixel = lngLatToPixel(vehicle.lng, vehicle.lat, zoom);
    const canvasX = vehiclePixel.x - centerPixel.x + width / 2 + offsetX;
    const canvasY = vehiclePixel.y - centerPixel.y + height / 2 + offsetY;
    console.log('[VehicleRenderer] Coords:', vehicle.id, canvasX, canvasY);

    if (isNaN(canvasX) || isNaN(canvasY)) {
      console.error('[VehicleRenderer] Invalid coords:', vehicle.id);
      return;
    }

    if (canvasX < -50 || canvasX > width + 50 || canvasY < -50 || canvasY > height + 50) {
      console.log('[VehicleRenderer] Out of bounds:', vehicle.id);
      return;
    }

    if (vehicleImages.has(vehicle.id)) {
      const img = vehicleImages.get(vehicle.id)!;
      console.log('[VehicleRenderer] Image:', vehicle.id);
      ctx.drawImage(img, canvasX - 25, canvasY - 25, 50, 50);
    } else {
      console.log('[VehicleRenderer] Circle:', vehicle.id);
      ctx.fillStyle = '#ff9800';
      ctx.beginPath();
      ctx.arc(canvasX, canvasY, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('?', canvasX, canvasY + 3);
    }
  });

  console.log('[VehicleRenderer] Fixed test circle');
  ctx.fillStyle = '#00ff00';
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, 20, 0, Math.PI * 2);
  ctx.fill();
};