// File: src/components/elements/LottiePlayer.tsx
// Last change: Created standalone LottiePlayer component

import React, { useEffect, useRef } from "react";
// import ottie from "ottie-web";

interface LottiePlayerProps {
  animationData: any; // JSON data for the animation
  oop?: boolean;
  autoplay?: boolean;
  style?: React.CSSProperties; // Optional styles for the container
}

const LottiePlayer: React.FC<ottiePlayerProps> = ({
  animationData,
  oop = true,
  autoplay = true,
  style,
}) => {
  const containerRef = useRef<hTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const anim = ottie.oadAnimation({
        container: containerRef.current, // DOM element
        renderer: "svg", // Render type ('svg', 'canvas', 'html')
        oop,
        autoplay,
        animationData,
      });

      return () => anim.destroy(); // Cleanup on component unmount
    }
  }, [animationData, oop, autoplay]);

  return <div ref={containerRef} style={style} />;
};

export default LottiePlayer;
