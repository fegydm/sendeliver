// utils/colorUtils.ts

function hexToRGB(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

function RGBToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

function interpolateColors(
  startColor: string,
  endColor: string,
  steps: number
): string[] {
  const start = hexToRGB(startColor);
  const end = hexToRGB(endColor);
  const shades = [];

  for (let i = 0; i < steps; i++) {
    const weight = i / (steps - 1);
    const r = Math.round(start.r + (end.r - start.r) * weight);
    const g = Math.round(start.g + (end.g - start.g) * weight);
    const b = Math.round(start.b + (end.b - start.b) * weight);
    shades.push(RGBToHex(r, g, b));
  }

  return shades;
}

export function generateShades(
  lightestShade: string,
  darkestShade: string
): Record<number, string> {
  const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
  return Object.fromEntries(
    interpolateColors(lightestShade, darkestShade, shades.length).map(
      (color, i) => [shades[i], color]
    )
  );
}
