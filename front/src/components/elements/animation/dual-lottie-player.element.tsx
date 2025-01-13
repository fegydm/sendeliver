// File: front/src/components/elements/animation/dual-lottie-player.element.tsx
// Last change: Fixed animation rendering issue and ensured proper scaling.

import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import lottie, { AnimationItem } from 'lottie-web';
import CustomAnimationRenderer from "@/components/elements/animation/custom-lottie-player.element";

const MAX_HEIGHT = 150; // Fixed height control for the player container.

interface LottieJSON {
    v: string;
    fr: number;
    ip: number;
    op: number;
    w: number;
    h: number;
    layers: any[];
}

interface DualLottiePlayerProps {
    animationData: LottieJSON | any;
    className?: string;
    maxHeight?: number;
    isPaused?: boolean;
}

export type DualLottiePlayerRef = {
    play: () => void;
    pause: () => void;
    stop: () => void;
}

const isLottieFormat = (data: any): data is LottieJSON => {
    return data && typeof data === 'object' && Array.isArray(data.layers);
};

const DualLottiePlayer = forwardRef<DualLottiePlayerRef, DualLottiePlayerProps>(({
    animationData,
    className = '',
    maxHeight = MAX_HEIGHT,
    isPaused = false
}, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<AnimationItem | null>(null);
    const isLottieAnimation = isLottieFormat(animationData);

    useImperativeHandle(ref, () => ({
        play: () => animationRef.current?.play(),
        pause: () => animationRef.current?.pause(),
        stop: () => animationRef.current?.stop()
    }), []);

    useEffect(() => {
        if (!containerRef.current) return;

        if (!isLottieAnimation) {
            return undefined; // Return for non-lottie animation
        }

        // ✅ Clear container before rendering (prevent overlapping)
        containerRef.current.innerHTML = '';

        try {
            const newAnimation = lottie.loadAnimation({
                container: containerRef.current,
                renderer: 'svg',
                loop: true,
                autoplay: !isPaused,
                animationData,
                rendererSettings: {
                    preserveAspectRatio: 'xMidYMid meet' // Prevent cropping and scale correctly
                }
            });

            animationRef.current = newAnimation;
            return () => newAnimation.destroy();
        } catch (error) {
            console.error('Error loading animation:', error);
            return undefined;
        }
    }, [animationData, isPaused, isLottieAnimation]);

    return (
        <div 
            className={`banner-animation player-container ${className}`}
            style={{
                maxHeight: maxHeight, 
                width: '100%',
                overflow: 'hidden'
            }}
        >
            {isLottieAnimation ? (
                <div 
                    ref={containerRef}
                    style={{
                        width: '100%',
                        height: '100%',
                        overflow: 'hidden'
                    }}
                />
            ) : (
                <CustomAnimationRenderer 
                    animationData={animationData}
                    width={maxHeight}      
                    height={maxHeight}    
                    loop
                />
            )}
        </div>
    );
});

DualLottiePlayer.displayName = 'DualLottiePlayer';
export default DualLottiePlayer;
