// ./front/src/@types/lottie.d.ts
declare module 'lottie-web' {
  interface AnimationConfig {
    container: Element;
    renderer?: 'svg' | 'canvas' | 'html';
    loop?: boolean;
    autoplay?: boolean;
    animationData?: any;
    path?: string;
    rendererSettings?: {
      progressiveLoad?: boolean;
      hideOnTransparent?: boolean;
      className?: string;
    };
  }

  interface AnimationItem {
    play(): void;
    stop(): void;
    pause(): void;
    destroy(): void;
    goToAndPlay(value: number, isFrame?: boolean): void;
    goToAndStop(value: number, isFrame?: boolean): void;
    setSpeed(speed: number): void;
    setDirection(direction: number): void;
    playSegments(segments: number[] | number[][], forceFlag?: boolean): void;
    setSubframe(useSubFrames: boolean): void;
    getDuration(inFrames?: boolean): number;
  }

  interface LottiePlayer {
    loadAnimation(params: AnimationConfig): AnimationItem;
  }

  const lottie: LottiePlayer;
  export default lottie;
}