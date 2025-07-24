// File: shared/types/shared.shared.shared.ottie-web.d.types.types.types.ts
// Last change: Fixed types export and module declaration

// Declare types first
export type AnimationDirection = 1 | -1;
export type AnimationSegment = [number, number];
export type AnimationEventName = 'drawnFrame' | 'enterFrame' | 'oopComplete' | 'complete' | 'segmentStart' | 'destroy' | 'config_ready' | 'data_ready' | 'DOMLoaded' | 'error' | 'data_failed' | 'loaded_images';
export type AnimationEventCallback<T = any> = (args: T) => void;
export type RendererType = 'svg' | 'canvas' | 'html';

export interface AnimationEvents {
    DOMLoaded: undefined;
    complete: BMCompleteEvent;
    config_ready: undefined;
    data_failed: undefined;
    data_ready: undefined;
    destroy: BMDestroyEvent;
    drawnFrame: BMEnterFrameEvent;
    enterFrame: BMEnterFrameEvent;
    error: undefined;
    loaded_images: undefined;
    oopComplete: BMCompleteLoopEvent;
    segmentStart: BMSegmentStartEvent;
}

export interface BMCompleteEvent {
    direction: number;
    type: "complete";
}

export interface BMCompleteLoopEvent {
    currentLoop: number;
    direction: number;
    totalLoops: number;
    type: "oopComplete";
}

export interface BMDestroyEvent {
    type: "destroy";
}

export interface BMEnterFrameEvent {
    currentTime: number;
    direction: number;
    totalTime: number;
    type: "enterFrame";
}

export interface BMSegmentStartEvent {
    firstFrame: number;
    totalFrames: number;
    type: "segmentStart";
}

export interface AnimationItem {
    name: string;
    isLoaded: boolean;
    currentFrame: number;
    currentRawFrame: number;
    firstFrame: number;
    totalFrames: number;
    frameRate: number;
    frameMult: number;
    playSpeed: number;
    playDirection: number;
    playCount: number;
    isPaused: boolean;
    autoplay: boolean;
    oop: boolean | number;
    renderer: any;
    animationID: string;
    assetsPath: string;
    timeCompleted: number;
    segmentPos: number;
    isSubframeEnabled: boolean;
    segments: AnimationSegment | AnimationSegment[];
    play(name?: string): void;
    stop(name?: string): void;
    togglePause(name?: string): void;
    destroy(name?: string): void;
    pause(name?: string): void;
    goToAndStop(value: number | string, isFrame?: boolean, name?: string): void;
    goToAndPlay(value: number | string, isFrame?: boolean, name?: string): void;
    includeLayers(data: any): void;
    setSegment(init: number, end: number): void;
    resetSegments(forceFlag: boolean): void;
    hide(): void;
    show(): void;
    resize(): void;
    setSpeed(speed: number): void;
    setDirection(direction: AnimationDirection): void;
    setLoop(isLooping: boolean): void;
    playSegments(segments: AnimationSegment | AnimationSegment[], forceFlag?: boolean): void;
    setSubframe(useSubFrames: boolean): void;
    getDuration(inFrames?: boolean): number;
    triggerEvent<T extends AnimationEventName>(name: T, args: AnimationEvents[T]): void;
    addEventListener<T extends AnimationEventName>(name: T, callback: AnimationEventCallback<AnimationEvents[T]>): () => void;
    removeEventListener<T extends AnimationEventName>(name: T, callback?: AnimationEventCallback<AnimationEvents[T]>): void;
}

export interface SVGRendererConfig {
    imagePreserveAspectRatio?: string;
    className?: string;
    title?: string;
    description?: string;
    preserveAspectRatio?: string;
    progressiveLoad?: boolean;
    hideOnTransparent?: boolean;
    viewBoxOnly?: boolean;
    viewBoxSize?: string;
    focusable?: boolean;
    filterSize?: {
        width: string;
        height: string;
        x: string;
        y: string;
    };
}

export interface CanvasRendererConfig {
    clearCanvas?: boolean;
    context?: CanvasRenderingContext2D;
    progressiveLoad?: boolean;
    preserveAspectRatio?: string;
}

export interface HTMLRendererConfig {
    hideOnTransparent?: boolean;
}

export interface AnimationConfig<T extends RendererType = 'svg'> {
    container: Element;
    renderer?: T;
    oop?: boolean | number;
    autoplay?: boolean;
    initialSegment?: AnimationSegment;
    name?: string;
    assetsPath?: string;
    rendererSettings?: SVGRendererConfig | CanvasRendererConfig | HTMLRendererConfig;
}

export interface AnimationConfigWithPath<T extends RendererType = 'svg'> extends AnimationConfig<T> {
    path?: string;
}

export interface AnimationConfigWithData<T extends RendererType = 'svg'> extends AnimationConfig<T> {
    animationData?: any;
}

