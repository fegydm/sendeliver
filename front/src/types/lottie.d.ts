// File: front/src/types/lottie.d.ts
// Last change: Comprehensive type definitions for Lottie JSON structure

/**
 * Represents keyframes for animated properties
 */
export interface Keyframe {
  t: number; // Time in frames
  s?: number[] | [number, number, number] | [number, number]; // Start values
  e?: number[] | [number, number, number] | [number, number]; // End values
  i?: { x: number[]; y: number[] }; // Interpolation for incoming values
  o?: { x: number[]; y: number[] }; // Interpolation for outgoing values
  h?: number; // Hold keyframe
  to?: [number, number]; // Spatial tangent out
  ti?: [number, number]; // Spatial tangent in
}

/**
 * Represents individual effects applied to a layer
 */
export interface LottieEffect {
  ty: number; // Type of effect (e.g., slider = 5, color = 2)
  nm: string; // Name of the effect
  mn?: string; // Match name (used for expressions)
  ix?: number; // Property index (used for expressions)
  ef: {
    ty: number; // Type of control (e.g., 0 = slider, 2 = color)
    nm: string; // Name of the control
    mn?: string; // Match name (used for expressions)
    ix?: number; // Property index (used for expressions)
    v: { a: number; k: number | [number, number, number, number] }; // Value (number or color)
  }[];
}

/**
 * Represents a shape within a layer
 */
export interface LottieShape {
  ty: string; // Type of shape (e.g., 'sh' for path, 'st' for stroke, 'fl' for fill)
  nm: string; // Name of the shape
  hd?: boolean; // Hidden (true = hidden, false = visible)
  ks?: { a: number; k: any }; // Keyframe data for the shape
  c?: { a: number; k: [number, number, number, number] }; // Color (RGBA)
  o?: { a: number; k: number }; // Opacity
  w?: { a: number; k: number }; // Stroke width
  lc?: number; // Line cap (0 = butt, 1 = round, 2 = square)
  lj?: number; // Line join (0 = miter, 1 = round, 2 = bevel)
  ml?: number; // Miter limit (used for miter line joins)
  st?: {
    c: { a: number; k: [number, number, number, number] }; // Stroke color
    w: { a: number; k: number }; // Stroke width
  };
  fl?: {
    c: { a: number; k: [number, number, number, number] }; // Fill color
  };
}

/**
 * Represents a single layer in the animation
 */
export interface LottieLayer {
  ind?: number; // Layer index (optional)
  ty: number; // Layer type (e.g., 3 = null, 4 = shape, 5 = text, 0 = composition)
  nm: string; // Name of the layer
  parent?: number; // Parent layer index (optional)
  ip: number; // In-point (start frame)
  op: number; // Out-point (end frame)
  ks: {
    o?: { a: number; k: number }; // Opacity (optional)
    r?: { a: number; k: number }; // Rotation (optional)
    p?: { a: number; k: [number, number, number] }; // Position (optional)
    a?: { a: number; k: [number, number, number] }; // Anchor point (optional)
    s?: { a: number; k: [number, number, number] }; // Scale (optional)
  };
  shapes?: LottieShape[]; // Shapes in the layer (only for type 4)
  t?: any; // Text data (only for type 5)
  ef?: LottieEffect[]; // Effects applied to the layer (optional)
}

/**
 * Represents the top-level structure of a Lottie animation
 */
export interface LottieAnimation {
  v: string; // Version of Lottie JSON
  fr: number; // Frame rate
  ip: number; // In-point (start frame)
  op: number; // Out-point (end frame)
  w: number; // Width of the animation
  h: number; // Height of the animation
  nm: string; // Name of the animation
  ddd: number; // Dimensionality (0 = 2D, 1 = 3D)
  layers: LottieLayer[]; // Array of layers
  assets?: any[]; // External assets (optional)
  markers?: any[]; // Markers (optional)
  slots?: any[]; // Slots for dynamic property replacement (optional)
}