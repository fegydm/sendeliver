// File: src/components/maps/VehicleRenderer.ts
// Last change: Removed unnecessary logs

import { lngLatToPixel } from './MapUtils';

export interface Vehicle {
  id: string;
  lat: number;
  lng: number;
  image: string;
  location: string;
}

export const preloadVehicleImages = (
  vehicles: Vehicle[],
  vehicleImages: Map<string, HTMLImageElement>,
  onLoad: () => void
) => {
  let loadedCount = 0;
  const total = vehicles.length;

  vehicles.forEach((vehicle) => {
    if (vehicleImages.has(vehicle.id)) {
      loadedCount++;
      if (loadedCount === total) onLoad();
      return;
    }

    const img = new Image();
    img.src = vehicle.image;

    img.onload = () => {
      vehicleImages.set(vehicle.id, img);
      loadedCount++;
      if (loadedCount === total) onLoad();
    };

    img.onerror = () => {
      loadedCount++;
      if (loadedCount === total) onLoad();
    };
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
  const { zoom, center, offsetX, offsetY } = mapState;
  const centerPx = lngLatToPixel(center[1], center[0], zoom);

  vehicles.forEach((vehicle) => {
    const vehiclePx = lngLatToPixel(vehicle.lng, vehicle.lat, zoom);
    const x = vehiclePx.x - centerPx.x + width / 2 + offsetX;
    const y = vehiclePx.y - centerPx.y + height / 2 + offsetY;

    if (x < 0 || x > width || y < 0 || y > height) return;

    const img = vehicleImages.get(vehicle.id);
    if (img) {
      const size = 32;
      ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
    }

    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 165, 0, 0.3)';
    ctx.fill();
    ctx.strokeStyle = 'orange';
    ctx.stroke();
  });

  ctx.beginPath();
  ctx.arc(width / 2 + offsetX, height / 2 + offsetY, 50, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
  ctx.fill();
  ctx.strokeStyle = 'green';
  ctx.stroke();
};