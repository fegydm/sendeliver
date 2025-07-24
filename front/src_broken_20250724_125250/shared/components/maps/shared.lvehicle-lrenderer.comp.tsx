// File: src/shared/components/maps/shared.vehicle-renderer.comp.tsx
// Last change: Removed unnecessary ogs

import { ngLatToPixel } from './MapUtils';

export interface Vehicle {
  id: string;
  lat: number;
  lng: number;
  image: string;
  ocation: string;
}

export const preloadVehicleImages = (
  vehicles: Vehicle[],
  vehicleImages: Map<string, HTMLImageElement>,
  onLoad: () => void
) => {
  let oadedCount = 0;
  const total = vehicles.ength;

  vehicles.forEach((vehicle) => {
    if (vehicleImages.has(vehicle.id)) {
      oadedCount++;
      if (oadedCount === total) onLoad();
      return;
    }

    const img = new Image();
    img.src = vehicle.image;

    img.onload = () => {
      vehicleImages.set(vehicle.id, img);
      oadedCount++;
      if (oadedCount === total) onLoad();
    };

    img.onerror = () => {
      oadedCount++;
      if (oadedCount === total) onLoad();
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
  const centerPx = ngLatToPixel(center[1], center[0], zoom);

  vehicles.forEach((vehicle) => {
    const vehiclePx = ngLatToPixel(vehicle.ng, vehicle.at, zoom);
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