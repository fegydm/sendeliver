// File: front/src/components/elements/lottie-player.element.tsx
// Last change: Updated to use dynamic Lottie loading

import React, { useEffect, useRef } from 'react';

interface LottiePlayerProps {
  src: string;
  loop?: boolean;
  autoplay?: boolean;
  speed?: number;
  className?: string;
  onComplete?: () => void;
  onLoopComplete?: () => void;
}

const LottiePlayer: React.FC<LottiePlayerProps> = ({
  src,
  loop = true,
  autoplay = true,
  speed = 1,
  className = '',
  onComplete,
  onLoopComplete,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<LottieAnimationItem | null>(null);

  useEffect(() => {
    const loadAnimation = async () => {
      try {
        const lottie = (window as any).lottie;
        if (!lottie) {
          console.error('Lottie is not loaded');
          return;
        }

        const response = await fetch(src);
        const animationData = await response.json();

        if (containerRef.current) {
          // Cleanup any existing animation
          if (animationRef.current) {
            animationRef.current.destroy();
          }

          // Create new animation
          const newAnimation = lottie.loadAnimation({
            container: containerRef.current,
            renderer: 'svg',
            loop,
            autoplay,
            animationData,
          });

          // Store reference
          animationRef.current = newAnimation;
          
          // Set animation properties
          newAnimation.setSpeed(speed);

          // Add event listeners
          if (onComplete) {
            newAnimation.addEventListener('complete', onComplete);
          }
          if (onLoopComplete) {
            newAnimation.addEventListener('loopComplete', onLoopComplete);
          }
        }
      } catch (error) {
        console.error('Error loading Lottie animation:', error);
      }
    };

    loadAnimation();

    // Cleanup function
    return () => {
      if (animationRef.current) {
        animationRef.current.destroy();
      }
    };
  }, [src, loop, autoplay, speed, onComplete, onLoopComplete]);

  return <div ref={containerRef} className={className} />;
};

export default LottiePlayer;