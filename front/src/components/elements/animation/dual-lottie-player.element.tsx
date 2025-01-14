// File: front/src/components/elements/animation/dual-lottie-player.element.tsx
<<<<<<< HEAD
// Last change: Enhanced type safety and error handling for animation data

import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
=======
import { useRef, useImperativeHandle, forwardRef, CSSProperties } from 'react';
>>>>>>> fdf2a50 (up lottie)
import Lottie from 'lottie-react';
import CustomAnimationRenderer from '../../../lib/CustomAnimationRenderer';
import { BANNER_HEIGHT } from '@/constants/layout.constants';

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
    try {
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
    } catch {
        return false;
    }
};

const DualLottiePlayer = forwardRef<DualLottiePlayerRef, DualLottiePlayerProps>(
    ({ animationData, isPaused = false }, ref) => {
        const lottieRef = useRef<any>(null);

        useImperativeHandle(ref, () => ({
            play: () => lottieRef.current?.play(),
            pause: () => lottieRef.current?.pause(),
            stop: () => lottieRef.current?.stop()
        }), []);

        const isLottie = isLottieFormat(animationData);
<<<<<<< HEAD
        const width = isLottie && animationData.h > 0 
            ? (animationData.w / animationData.h) * 150 
            : 150; // Default width if height is invalid

        return (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
=======

        // Correct style applied to the container instead of the Lottie component directly
        const containerStyle: CSSProperties = {
            height: `${BANNER_HEIGHT}px`,
            width: '100%',
            maxWidth: '100%',
            objectFit: 'cover',
            pointerEvents: 'none',
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
        };

        return (
            <div style={containerStyle}>
>>>>>>> fdf2a50 (up lottie)
                {isLottie ? (
                    <Lottie
                        lottieRef={lottieRef}
                        animationData={animationData}
                        loop
                        autoplay={!isPaused}
<<<<<<< HEAD
                        style={{ height: '150px', width: `${width}px` }}
                        rendererSettings={{ preserveAspectRatio: 'xMidYMid meet' }}
=======
                        rendererSettings={{
                            preserveAspectRatio: 'xMidYMid meet'
                        }}
>>>>>>> fdf2a50 (up lottie)
                    />
                ) : (
                    <CustomAnimationRenderer
                        animationData={animationData}
<<<<<<< HEAD
                        width={width}
                        height={150}
=======
>>>>>>> fdf2a50 (up lottie)
                        loop
                    />
                )}
            </div>
        );
    }
);

DualLottiePlayer.displayName = 'DualLottiePlayer';

export default DualLottiePlayer;
