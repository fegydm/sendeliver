// File: front/src/components/elements/animation/custom-lottie-player.element.tsx
// Last change: Fixed TypeScript warning (TS6133) by removing unused parameter

import React, { useEffect, useRef } from 'react';

interface AnimationProps {
    animationData: any;
    width?: number;
    height?: number;
    loop?: boolean;
}

const CustomLottiePlayer: React.FC<AnimationProps> = ({ 
    animationData, 
    width = 200, 
    height = 200, 
    loop = true 
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    let animationFrameId: number | null = null;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { layers, op } = animationData;
        const totalFrames = op;
        let currentFrame = 0;

        const drawFrame = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            layers.forEach((layer: any) => {
                if (layer.ty === 4) {
                    layer.shapes.forEach((shape: any) => {
                        if (shape.ty === 'rc') {
                            const [x, y] = layer.ks.p.k;
                            const [width, height] = shape.s.k;
                            const cornerRadius = shape.r.k;
                            ctx.fillStyle = `rgba(${shape.c.k.map((c: number) => c * 255).join(",")})`;
                            ctx.beginPath();
                            ctx.moveTo(x + cornerRadius, y);
                            ctx.arcTo(x + width, y, x + width, y + height, cornerRadius);
                            ctx.arcTo(x + width, y + height, x, y + height, cornerRadius);
                            ctx.arcTo(x, y + height, x, y, cornerRadius);
                            ctx.arcTo(x, y, x + width, y, cornerRadius);
                            ctx.fill();
                        }
                    });
                }
            });
        };

        const renderAnimation = () => {
            drawFrame();
            currentFrame++;
            
            if (currentFrame >= totalFrames) {
                if (loop) {
                    currentFrame = 0; // ✅ Reset loop correctly
                } else {
                    cancelAnimationFrame(animationFrameId!);
                    return;
                }
            }
            animationFrameId = requestAnimationFrame(renderAnimation);
        };

        renderAnimation();

        // ✅ Cleanup function added
        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [animationData, loop]);

    return <canvas ref={canvasRef} width={width} height={height} />;
};

export default CustomLottiePlayer;
