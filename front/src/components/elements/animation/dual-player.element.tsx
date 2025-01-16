// File: src/components/elements/animation/dual-player.element.tsx
// Last change: Fixed Lottie initialization and file loading

import React, { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import Lottie from "lottie-react";
import AnimationRenderer from "./animation-renderer";

export type AnimationType = "lottie" | "svg";

export interface DualPlayerRef {
    play: () => void;
    pause: () => void;
}

interface DualPlayerProps {
    animationPath: string | null;
    isPaused: boolean;
}

const DualPlayer = forwardRef<DualPlayerRef, DualPlayerProps>(({ animationPath, isPaused }, ref) => {
    const [animationType, setAnimationType] = useState<AnimationType | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [animationData, setAnimationData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Load and validate animation file
    useEffect(() => {
        const loadAnimationFile = async () => {
            if (!animationPath) {
                setAnimationType(null);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                if (animationPath.endsWith('.json')) {
                    // Handle Lottie JSON animations
                    const response = await fetch(animationPath);
                    if (!response.ok) {
                        throw new Error(`Failed to load animation: ${response.statusText}`);
                    }

                    const data = await response.json();
                    
                    // Ensure required Lottie properties exist
                    const defaultLottieProps = {
                        v: "5.5.2",
                        fr: 30,
                        ip: 0,
                        op: 60,
                        w: 512,
                        h: 512,
                        nm: "Animation",
                        layers: []
                    };

                    // Merge default props with loaded data
                    const validatedData = {
                        ...defaultLottieProps,
                        ...data,
                        // Ensure layers exists
                        layers: data.layers || []
                    };

                    setAnimationData(validatedData);
                    setAnimationType("lottie");
                } else if (animationPath.endsWith('.svg')) {
                    setAnimationType("svg");
                } else {
                    throw new Error('Unsupported file format');
                }
            } catch (err) {
                console.error('Animation loading error:', err);
                setError(err instanceof Error ? err.message : 'Failed to load animation');
                setAnimationType(null);
                setAnimationData(null);
            } finally {
                setIsLoading(false);
            }
        };

        loadAnimationFile();
    }, [animationPath]);

    // External control methods
    useImperativeHandle(ref, () => ({
        play: () => {
            // Add play logic if needed
            console.log("Play animation");
        },
        pause: () => {
            // Add pause logic if needed
            console.log("Pause animation");
        },
    }));

    if (isLoading) {
        return <div>Loading animation...</div>;
    }

    if (error) {
        return <div style={{ color: 'red' }}>{error}</div>;
    }

    return (
        <div style={{ width: '100%', height: '100%' }}>
            {animationType === "lottie" && animationData && (
                <Lottie
                    animationData={animationData}
                    autoplay={!isPaused}
                    loop={true}
                    style={{ width: '100%', height: '100%' }}
                    onError={(err) => {
                        console.error('Lottie playback error:', err);
                        setError('Error playing animation');
                    }}
                />
            )}
            {animationType === "svg" && animationPath && (
                <AnimationRenderer
                    path={animationPath}
                    isPaused={isPaused}
                />
            )}
        </div>
    );
});

DualPlayer.displayName = 'DualPlayer';

export default DualPlayer;