// File: front/src/components/elements/animation/lottie-player.element.tsx
import React, { useEffect, useRef } from "react";
import lottie, { AnimationItem } from "lottie-web";

interface LottiePlayerProps {
  animationPath: string;
  loop?: boolean;
  autoplay?: boolean;
}

const LottiePlayer: React.FC<LottiePlayerProps> = ({ animationPath, loop = true, autoplay = true }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lottieInstance = useRef<AnimationItem | null>(null);

  useEffect(() => {
    const loadAnimation = async () => {
      try {
        console.log("Fetching animation from:", animationPath);
        const response = await fetch(animationPath);
        if (!response.ok) {
          throw new Error(`Failed to fetch animation: ${response.status}`);
        }

        const animationData = await response.json();
        lottieInstance.current = lottie.loadAnimation({
          container: containerRef.current!,
          animationData,
          renderer: "svg",
          loop,
          autoplay,
        });
      } catch (error) {
        console.error("Error loading Lottie animation:", error);
      }
    };

    loadAnimation();

    return () => {
      if (lottieInstance.current) {
        lottieInstance.current.destroy();
        lottieInstance.current = null;
      }
    };
  }, [animationPath, loop, autoplay]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
};

export default LottiePlayer;
