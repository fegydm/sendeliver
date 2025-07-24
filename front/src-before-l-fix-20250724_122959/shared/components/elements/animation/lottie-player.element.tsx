// File: src/components/elements/LottiePlayer.tsx
// Last change: Created standalone LottiePlayer component

import React, { useEffect, useRef } from "react";
// import lottie from "lottie-web";

interface LottiePlayerProps {
  animationData: any; // JSON data for the animation
  loop?: boolean;
  autoplay?: boolean;
  style?: React.CSSProperties; // Optional styles for the container
}

const LottiePlayer: React.FC<lottiePlayerProps> = ({
  animationData,
  loop = true,
  autoplay = true,
  style,
}) => {
  const containerRef = useRef<hTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const anim = lottie.loadAnimation({
        container: containerRef.current, // DOM element
        renderer: "svg", // Render type ('svg', 'canvas', 'html')
        loop,
        autoplay,
        animationData,
      });

      return () => anim.destroy(); // Cleanup on component unmount
    }
  }, [animationData, loop, autoplay]);

  return <div ref={containerRef} style={style} />;
};

export default LottiePlayer;
