// File: src/shared/components/maps/layers/shared.lpoints-llayer.comp.tsx
// Last change: Created visualization for important points

export interface ImportantPoint {
  lat: number;
  lng: number;
  type: 'pickup' | 'headquarters' | 'custom';
  label?: string;
  priority?: number; // 1-5 for cache priority
  custom?: {
    color: string;
    radius: number;
    animation?: boolean;
  };
}

export const drawImportantPoints = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  mapState: { zoom: number; center: [number, number]; offsetX: number; offsetY: number },
  points: ImportantPoint[],
  currentTime: number = performance.now()
) => {
  // Pomer pixelov na stupeň zemepisnej šírky/dĺžky závisí od zoom úrovne
  const scale = Math.pow(2, mapState.zoom);
  const tileSize = 256;
  const [centerLat, centerLon] = mapState.center;
  
  // Prepočítať GPS súradnice na pixely na mape
  const latRadians = (centerLat * Math.PI) / 180;
  const pixelsPerLonDegree = (tileSize * scale) / 360;
  const pixelsPerLatDegree = (tileSize * scale) / (2 * Math.PI);
  
  // Stred mapy
  const canvasCenterX = width / 2 + mapState.offsetX;
  const canvasCenterY = height / 2 + mapState.offsetY;
  
  // Animačný faktor
  const animSpeed = 0.0015;
  const maxWaves = 3;
  
  // Vykresliť každý bod
  for (const point of points) {
    // Previesť GPS na pixely
    const pointX = (point.lng - centerLon) * pixelsPerLonDegree;
    const pointY = -Math.log(Math.tan((Math.PI / 4) + (point.lat * Math.PI / 360))) * pixelsPerLatDegree;
    
    // Pozícia na plátne
    const canvasX = canvasCenterX + pointX;
    const canvasY = canvasCenterY + pointY;
    
    // Ak je bod mimo viditeľnú oblasť, preskočiť
    if (canvasX < -50 || canvasX > width + 50 || canvasY < -50 || canvasY > height + 50) {
      continue;
    }
    
    // Nastavenie parametrov vizualizácie podľa typu bodu
    let color = 'rgba(0, 0, 255, 0.5)';  // Predvolená modrá
    let radius = 15;
    let animate = false;
    
    if (point.type === 'pickup') {
      color = 'rgba(0, 120, 255, 0.7)';  // Jasnejšia modrá
      radius = 20;
      animate = true;
    } else if (point.type === 'headquarters') {
      color = 'rgba(0, 120, 50, 0.8)';   // Tmavšia zelená
      radius = 25;
      animate = false;
    } else if (point.custom) {
      color = point.custom.color;
      radius = point.custom.radius;
      animate = point.custom.animation || false;
    }
    
    // Vykresliť statickú značku
    ctx.beginPath();
    ctx.arc(canvasX, canvasY, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    
    // Ak je bod typu 'pickup', vykresliť animované kruhy
    if (animate) {
      const phaseOffset = currentTime * animSpeed;
      
      // Vykresliť koncentrické kruhy
      for (let i = 0; i < maxWaves; i++) {
        const phase = (phaseOffset + i / maxWaves) % 1;
        const waveRadius = radius + (phase * radius * 3);
        const opacity = 0.7 * (1 - phase);
        
        ctx.beginPath();
        ctx.arc(canvasX, canvasY, waveRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 120, 255, ${opacity})`;
        ctx.lineWidth = 2 * (1 - phase);
        ctx.stroke();
      }
    }
    
    // Vykresliť názov bodu
    if (point.label) {
      ctx.font = '12px Arial';
      ctx.fillStyle = 'black';
      ctx.textAlign = 'center';
      ctx.fillText(point.label, canvasX, canvasY - radius - 5);
    }
  }
};