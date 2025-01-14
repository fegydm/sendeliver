// File: src/types/lottie.d.ts

declare module '*.js' {
  const content: any;
  export default content;
}

export interface LottieAnimationItem {
  destroy: () => void;
  setSpeed: (speed: number) => void;
  addEventListener: (event: string, callback: () => void) => void;
}

export interface LottieInstance {
  loadAnimation: (params: {
      container: HTMLElement;
      renderer: string;
      loop: boolean;
      autoplay: boolean;
      animationData: any;
  }) => LottieAnimationItem;
}

// Custom Animation Types
// Accept both tuple and array for more flexibility
export type Position = number[] | [number, number];

export interface AnimationShape {
  type: string;
  text?: string;
  color?: string;
  startPosition: Position;
  endPosition: Position;
  startScale: number;
  endScale: number;
  startFrame: number;
  endFrame: number;
  keepVisible?: boolean;  // Added keepVisible as optional
}

export interface AnimationData {
  type: string;
  frames: number;
  width: number;
  height: number;
  shapes: AnimationShape[];
}