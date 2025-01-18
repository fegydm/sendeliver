import React, { useEffect, useRef } from "react";
import lottie, {
  AnimationItem,
  AnimationConfigWithData
} from "lottie-web";

interface LottieLightMinPlayerProps {
  animationData: any;
  width?: string | number;
  height?: string | number;
  loop?: boolean;
  autoplay?: boolean;
}

const LottieLightMinPlayer: React.FC<LottieLightMinPlayerProps> = ({
  animationData,
  width = "100%",
  height = "100%",
  loop = true,
  autoplay = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<AnimationItem | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Using AnimationConfigWithData
    const config: AnimationConfigWithData<"svg"> = {
      container: containerRef.current,
      renderer: "svg",
      loop,
      autoplay,
      animationData,
    };

    animationRef.current = lottie.loadAnimation(config);

    return () => {
      animationRef.current?.destroy();
    };
  }, [animationData, loop, autoplay]);

  return (
    <div
      ref={containerRef}
      style={{ width, height, margin: "0 auto" }}
    />
  );
};

export default LottieLightMinPlayer;
