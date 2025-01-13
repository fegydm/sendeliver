// File: front/src/components/elements/animation/lottie-player.element.tsx
// Last change: Fixed type exports

import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import lottie, { AnimationItem } from 'lottie-web';

interface LottieJSON {
    v: string;
    fr: number;
    ip: number;
    op: number;
    w: number;
    h: number;
    nm?: string;
    ddd?: number;
    assets?: any[];
    layers: any[];
    meta?: {
        g: string;
    };
}

interface LottiePlayerProps {
    animationData: LottieJSON;
    width?: number;
    height?: number;
    isPaused?: boolean;
}

export type LottiePlayerRef = {
    play: () => void;
    pause: () => void;
    stop: () => void;
}

const LottiePlayer = forwardRef<LottiePlayerRef, LottiePlayerProps>(({ 
    animationData, 
    width = 200, 
    height = 200,
    isPaused = false
}, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<AnimationItem | null>(null);

    useImperativeHandle(ref, () => ({
        play: () => {
            console.log('Play called');
            if (animationRef.current) {
                animationRef.current.play();
            }
        },
        pause: () => {
            console.log('Pause called');
            if (animationRef.current) {
                animationRef.current.pause();
            }
        },
        stop: () => {
            console.log('Stop called');
            if (animationRef.current) {
                animationRef.current.stop();
            }
        }
    }));

    useEffect(() => {
        if (!containerRef.current || !animationData) return;

        if (animationRef.current) {
            animationRef.current.destroy();
            animationRef.current = null;
        }

        animationRef.current = lottie.loadAnimation({
            container: containerRef.current,
            renderer: 'svg',
            loop: true,
            autoplay: !isPaused,
            animationData: animationData,
            rendererSettings: {
                progressiveLoad: false,
                hideOnTransparent: false,
                className: 'lottie-svg'
            }
        });

        const handleComplete = () => {
            if (animationRef.current && !isPaused) {
                animationRef.current.goToAndPlay(0, true);
            }
        };

        animationRef.current.addEventListener('complete', handleComplete);
        animationRef.current.addEventListener('DOMLoaded', () => {
            if (animationRef.current) {
                animationRef.current.setSpeed(1);
                if (!isPaused) {
                    animationRef.current.play();
                }
            }
        });

        return () => {
            if (animationRef.current) {
                animationRef.current.removeEventListener('complete', handleComplete);
                animationRef.current.destroy();
                animationRef.current = null;
            }
        };
    }, [animationData, isPaused]);

    useEffect(() => {
        if (animationRef.current) {
            if (isPaused) {
                animationRef.current.pause();
            } else {
                animationRef.current.play();
            }
        }
    }, [isPaused]);

    return (
        <div 
            ref={containerRef}
            style={{ 
                width, 
                height,
                overflow: 'hidden',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}
            className="lottie-container"
        />
    );
});

LottiePlayer.displayName = 'LottiePlayer';

export default LottiePlayer;