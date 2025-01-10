// File: src/components/elements/animation/custom-player.element.tsx
// Last change: Added console logs for debugging

import React, { useEffect, useRef } from 'react';
import { AnimationEngine } from './engine';
import transformLottieToEngineFormat from "@/utils/transform-lottie-to-engine-format";

interface CustomPlayerProps {
  src: string;
  width: number;
  height: number;
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
}

const CustomPlayer: React.FC<CustomPlayerProps> = ({
  src,
  width,
  height,
  className = '',
  loop = true,
  autoplay = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<AnimationEngine | null>(null);

  useEffect(() => {
    const loadAnimation = async () => {
      if (!containerRef.current) {
        console.error('Container ref is not available.');
        return;
      }

      try {
        console.log('Creating animation engine with dimensions:', { width, height });
        engineRef.current = new AnimationEngine(
          containerRef.current, 
          width, 
          height,
          { loop }
        );

        console.log('Fetching Lottie data from:', src);
        const response = await fetch(src);
        if (!response.ok) {
          throw new Error(`Failed to fetch Lottie data: ${response.statusText}`);
        }
        const lottieData = await response.json();
        console.log('Lottie Data:', lottieData);

        // Transform Lottie data into AnimationEngine format
        const animationData = transformLottieToEngineFormat(lottieData);
        console.log('Transformed Animation Data:', animationData);

        // Load animation data into the engine
        engineRef.current.loadAnimation(animationData);
        console.log('Animation data loaded successfully.');

        if (autoplay) {
          console.log('Starting animation playback.');
          engineRef.current.play();
        }
      } catch (error) {
        console.error('Error loading animation:', error);
      }
    };

    loadAnimation();

    return () => {
      if (engineRef.current) {
        console.log('Stopping animation engine.');
        engineRef.current.stop();
      }
    };
  }, [src, width, height, loop, autoplay]);

  return (
    <div 
      ref={containerRef} 
      className={className}
      style={{ width: `${width}px`, height: `${height}px`, border: '1px solid blue' }}
    />
  );
};

export default CustomPlayer;