// File: src/utils/lottie/transform-lottie-to-engine-format.ts
// Last change: Fixed TypeScript error for missing property 's' using type guards

import { AnimationLayer, AnimationFrame, Keyframe } from '../components/elements/animation/engine';

// Define the Lottie data structures more strictly
interface LottieKeyframe {
  s: number[];
  t: number;
}

interface LottieShape {
  ty: string;
  ks?: {
    d?: string;
    k?: number[];
  };
  c?: {
    k?: number[];
  };
  w?: {
    k: number;
  };
}

interface LottieLayer {
  shapes?: LottieShape[];
  ks?: {
    p?: { k: LottieKeyframe[] | { s: number[] } };
    r?: { k: number | LottieKeyframe[] };
    s?: { k: number[][] | LottieKeyframe[] };
  };
  ip: number;
  op: number;
}

interface LottieData {
  layers: LottieLayer[];
  ip: number;
  op: number;
}

const DEBUG_MODE = true;
const log = (...args: any[]) => {
  if (DEBUG_MODE) console.log(...args);
};

// Type guard to check if data is LottieKeyframe
const isLottieKeyframe = (data: any): data is LottieKeyframe => {
  return typeof data === 'object' && 's' in data && Array.isArray(data.s);
};

const transformLottieToEngineFormat = (
  lottieData: LottieData
): { layers: AnimationLayer[]; totalFrames: number } => {
  log('Transforming Lottie data to AnimationEngine format...');

  const layers: AnimationLayer[] = lottieData.layers.map((layer, layerIndex) => {
    log(`Processing layer ${layerIndex + 1}:`, layer);

    const frames: AnimationFrame[] = [];
    const keyframes: Record<string, Keyframe[]> = {};

    // Process shapes
    layer.shapes?.forEach((shape, shapeIndex) => {
      log(`Processing shape ${shapeIndex + 1}:`, shape);
      if (shape.ty === 'sh' && shape.ks?.d) {
        frames.push({
          type: 'path',
          properties: {
            d: shape.ks.d,
            fill: shape.c?.k
              ? `rgba(${Math.round(shape.c.k[0] * 255)}, ${Math.round(shape.c.k[1] * 255)}, ${Math.round(shape.c.k[2] * 255)}, ${shape.c.k[3] || 1})`
              : 'none',
          },
        });
      }
    });

    // Process transformations with proper type guards
    const transformProps = ['p', 'r', 's'] as const;
    transformProps.forEach((prop) => {
      const keyframeData = layer.ks?.[prop]?.k;
      if (Array.isArray(keyframeData)) {
        keyframes[prop] = keyframeData.map((keyframe, index) => {
          if (isLottieKeyframe(keyframe)) {
            return { frame: index, value: keyframe.s[0] }; 
          } else if (Array.isArray(keyframe)) {
            return { frame: index, value: keyframe[0] }; 
          } else {
            return { frame: index, value: keyframe }; 
          }
        });
      }
    });

    return { frames, keyframes };
  });

  log('Transformation complete. Total layers:', layers.length);
  return {
    layers,
    totalFrames: lottieData.op - lottieData.ip,
  };
};

export default transformLottieToEngineFormat;
