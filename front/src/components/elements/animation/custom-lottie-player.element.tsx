// File: front/src/components/elements/animation/custom-lottie-player.element.tsx
// Last change: Added support for animated text scaling and movement.

import React, { useEffect, useRef } from 'react';

// ✅ Fixed maximum dimensions for consistent scaling
const MAX_HEIGHT = 150;

interface AnimationProps {
    animationData: {
        type: string;
        frames: number;
        width: number;
        height: number;
        shapes: Array<{
            type: string;
            text?: string;
            color?: string;
            startPosition?: [number, number];
            endPosition?: [number, number];
            startScale?: number;
            endScale?: number;
            startFrame: number;
            endFrame: number;
        }>
    };
    width?: number;
    height?: number;
    loop?: boolean;
}

const CustomLottiePlayer: React.FC<AnimationProps> = ({
    animationData,
    width = MAX_HEIGHT,
    height = MAX_HEIGHT,
    loop = true
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    let animationFrameId: number | null = null;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            console.error("❌ Canvas element not found.");
            return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error("❌ Canvas rendering context not available.");
            return;
        }

        console.log("🎬 Custom Player initialized with:", animationData);

        const { shapes, frames } = animationData;
        let currentFrame = 0;

        // ✅ Function to interpolate between two values
        const interpolate = (start: number, end: number, progress: number) =>
            start + (end - start) * progress;

        // ✅ Function to draw text animations with scaling and movement
        const drawFrame = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            shapes.forEach((shape) => {
                const progress =
                    Math.min(
                        Math.max(
                            (currentFrame - shape.startFrame) /
                                (shape.endFrame - shape.startFrame),
                            0
                        ),
                        1
                    );

                const x = interpolate(
                    shape.startPosition?.[0] ?? 0,
                    shape.endPosition?.[0] ?? 0,
                    progress
                );
                const y = interpolate(
                    shape.startPosition?.[1] ?? 0,
                    shape.endPosition?.[1] ?? 0,
                    progress
                );
                const scale = interpolate(
                    shape.startScale ?? 100,
                    shape.endScale ?? 100,
                    progress
                );

                if (shape.type === "text" && shape.text) {
                    ctx.font = `${scale}px Arial`;
                    ctx.fillStyle = shape.color || "#000";
                    ctx.fillText(shape.text, x, y);
                }
            });
        };

        const renderAnimation = () => {
            drawFrame();
            currentFrame++;

            if (currentFrame >= frames) {
                if (loop) {
                    currentFrame = 0;
                } else {
                    cancelAnimationFrame(animationFrameId!);
                    return;
                }
            }

            animationFrameId = requestAnimationFrame(renderAnimation);
        };

        renderAnimation();

        // ✅ Cleanup when component unmounts
        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [animationData, loop]);

    return <canvas ref={canvasRef} width={width} height={height} />;
};

export default CustomLottiePlayer;
