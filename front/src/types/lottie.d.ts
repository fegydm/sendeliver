// File: front/src/types/lottie.d.ts
// Last change: Added type declarations for Lottie Light

declare module '*.js' {
    const content: any;
    export default content;
  }
  
  interface LottieAnimationItem {
    destroy: () => void;
    setSpeed: (speed: number) => void;
    addEventListener: (event: string, callback: () => void) => void;
  }
  
  interface LottieInstance {
    loadAnimation: (params: {
      container: HTMLElement;
      renderer: string;
      loop: boolean;
      autoplay: boolean;
      animationData: any;
    }) => LottieAnimationItem;
  }