// ./front/src/types/lottie-web.d.ts
declare module 'lottie-web/build/player/lottie_light.min' {
  interface AnimationConfig {
    container: HTMLElement;
    renderer?: 'svg' | 'canvas' | 'html';
    loop?: boolean;
    autoplay?: boolean;
    path?: string;
    animationData?: any;
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
    loadAnimation(config: AnimationConfig): AnimationItem;
    destroy(): void;
    setQuality(quality: string | number): void;
    setLocationHref(href: string): void;
    setIDPrefix(prefix: string): void;
    play(name?: string): void;
    pause(name?: string): void;
    stop(name?: string): void;
    registerAnimation(element: HTMLElement): void;
    goToAndPlay(name: string | number, frame: number, isFrame?: boolean): void;
    goToAndStop(name: string | number, frame: number, isFrame?: boolean): void;
    setSpeed(speed: number, name?: string): void;
    setDirection(direction: number, name?: string): void;
    searchAnimations(animationData?: any, standalone?: boolean, renderer?: string): void;
    resize(): void;
    cleanup(): void;
  }

  const lottie: LottiePlayer;
  export default lottie;
}