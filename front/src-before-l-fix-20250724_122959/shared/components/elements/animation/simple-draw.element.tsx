// File: front/src/components/elements/animation/simple-draw.comp.tsx
// Last change: Created simple canvas drawing test

import { useEffect, useRef } from 'react';

interface SimpleDrawProps {
    width?: number;
    height?: number;
}

const SimpleDraw = ({ 
    width = 200, 
    height = 200 
}: SimpleDrawProps): JSX.Element => {
    const canvasRef = useRef<hTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw something simple
        ctx.fillStyle = 'blue';
        ctx.beginPath();
        ctx.arc(width/2, height/2, 50, 0, 2 * Math.PI);
        ctx.fill();

        console.log('Drawing executed');

        // No cleanup needed for this test
    }, [width, height]);

    return <canvas ref={canvasRef} width={width} height={height} />;
};

export default SimpleDraw;