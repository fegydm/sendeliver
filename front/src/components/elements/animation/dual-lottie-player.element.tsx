// File: front/src/components/elements/animation/dual-lottie-player.element.tsx
// Last change: Fixed TypeScript error by ensuring numeric width and height types.

import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import Lottie from 'lottie-react';
import CustomAnimationRenderer from './custom-lottie-player.element';

interface LottieJSON {
    v: string;
    fr: number;
    ip: number;
    op: number;
    w: number;
    h: number;
    layers: Array<{ ty: number; [key: string]: any }>;
}

interface DualLottiePlayerProps {
    animationData: LottieJSON | any;
    isPaused?: boolean;
}

export type DualLottiePlayerRef = {
    play: () => void;
    pause: () => void;
    stop: () => void;
};

const isLottieFormat = (data: any): boolean => {
    return (
        data &&
        typeof data.v === 'string' &&
        typeof data.fr === 'number' &&
        typeof data.ip === 'number' &&
        typeof data.op === 'number' &&
        typeof data.w === 'number' &&
        typeof data.h === 'number' &&
        Array.isArray(data.layers) &&
        data.layers.length > 0
    );
};

const DualLottiePlayer = forwardRef<DualLottiePlayerRef, DualLottiePlayerProps>(({ animationData, isPaused = false }, ref) => {
    const lottieRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
        play: () => lottieRef.current?.play(),
        pause: () => lottieRef.current?.pause(),
        stop: () => lottieRef.current?.stop()
    }), []);

    const isLottie = isLottieFormat(animationData);
    const width = isLottie ? (animationData.w / animationData.h) * 150 : 150; // Ensuring numeric width

    return (
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            {isLottie ? (
                <Lottie
                    lottieRef={lottieRef}
                    animationData={animationData}
                    loop
                    autoplay={!isPaused}
                    style={{ height: '150px', width: `${width}px` }}
                    rendererSettings={{ preserveAspectRatio: 'xMidYMid meet' }}
                />
            ) : (
                <CustomAnimationRenderer
                    animationData={animationData}
                    width={width}
                    height={150}
                    loop
                />
            )}
        </div>
    );
});

DualLottiePlayer.displayName = 'DualLottiePlayer';

export default DualLottiePlayer;
