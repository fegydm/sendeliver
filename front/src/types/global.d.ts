// File: front/src/types/global.d.ts
// Last change: Added type declaration for global window.lottie

declare interface Window {
    lottie: {
        loadAnimation: (params: {
            container: HTMLElement;
            renderer: string;
            loop: boolean;
            autoplay: boolean;
            path: string;
        }) => { destroy: () => void };
    };
}
