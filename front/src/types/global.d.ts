// File: front/src/types/global.d.ts
// Last change: Extended type declaration for imported lottie

declare module "lottie-web/build/player/lottie_light" {
    export interface AnimationItem {
        play: () => void;
        pause: () => void;
        destroy: () => void;
    }

    export interface AnimationConfig {
        container: HTMLElement;
        renderer: "svg" | "canvas" | "html";
        loop?: boolean;
        autoplay?: boolean;
        path: string;
    }

    const lottie: {
        loadAnimation: (params: AnimationConfig) => AnimationItem;
    };

    export default lottie;
}
