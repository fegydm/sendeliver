// File: front/src/components/elements/animation/lottie-player.element.tsx
// Last change: Added proper scaling

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
    maxHeight?: number;
    scalePercentage?: number;  // New prop for scaling
    isPaused?: boolean;
}

export type LottiePlayerRef = {
    play: () => void;
    pause: () => void;
    stop: () => void;
}

const LottiePlayer = forwardRef<LottiePlayerRef, LottiePlayerProps>(({ 
    animationData, 
    maxHeight = 150,
    scalePercentage = 90,  // Default to 90%
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
    }), []);

    useEffect(() => {
        if (!containerRef.current || !animationData) return;

        // Calculate scale
        const scale = (maxHeight * (scalePercentage / 100)) / animationData.h;
        console.log('Scaling animation:', { 
            originalHeight: animationData.h, 
            maxHeight, 
            scale,
            scalePercentage 
        });

        if (animationRef.current) {
            animationRef.current.destroy();
        }

        try {
            const newAnimation = lottie.loadAnimation({
                container: containerRef.current,
                renderer: 'svg',
                loop: true,
                autoplay: !isPaused,
                animationData: animationData,
                rendererSettings: {
                    preserveAspectRatio: 'xMidYMid meet',
                    progressiveLoad: false,
                    hideOnTransparent: false,
                    className: 'lottie-svg'
                }
            });

            // Set the scale
            containerRef.current.style.transform = `scale(${scale})`;
            
            animationRef.current = newAnimation;

            const handleComplete = () => {
                if (!isPaused && animationRef.current) {
                    animationRef.current.goToAndPlay(0, true);
                }
            };

            const handleDOMLoaded = () => {
                if (animationRef.current) {
                    animationRef.current.setSpeed(1);
                    if (isPaused) {
                        animationRef.current.pause();
                    }
                }
            };

            newAnimation.addEventListener('complete', handleComplete);
            newAnimation.addEventListener('DOMLoaded', handleDOMLoaded);

            return () => {
                newAnimation.removeEventListener('complete', handleComplete);
                newAnimation.removeEventListener('DOMLoaded', handleDOMLoaded);
                newAnimation.destroy();
                animationRef.current = null;
            };
        } catch (error) {
            console.error('Error creating animation:', error);
        }
    }, [animationData, maxHeight, scalePercentage]);

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
        <div style={{ 
            height: maxHeight, 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            overflow: 'hidden' 
        }}>
            <div 
                ref={containerRef}
                style={{ 
                    transformOrigin: 'center center'
                }}
            />
        </div>
    );
});

LottiePlayer.displayName = 'LottiePlayer';

export default LottiePlayer;