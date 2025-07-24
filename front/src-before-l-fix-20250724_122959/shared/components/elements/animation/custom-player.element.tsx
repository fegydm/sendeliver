// File: front/src/components/custom-player.comp.tsx
// Last change: Integrated complete rendering and animation state management

import { useEffect, useRef, useState } from "react";
import corerenderer from "@/lib/corerenderer";
import { LottieAnimation } from "@/types/lottie";
import animationData from "@/assets/sd21.json";

const CustomPlayer = () => {
  const canvasRef = useRef<hTMLCanvasElement>(null);
  const rendererRef = useRef<coreRenderer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const typedAnimationData = animationData as LottieAnimation;

    rendererRef.current = new CoreRenderer(canvas, typedAnimationData);
    rendererRef.current.play();
    setIsPlaying(true);

    const timer = setTimeout(() => {
      rendererRef.current?.stop();
      setIsPlaying(false);
    }, 2000);

    return () => {
      clearTimeout(timer);
      rendererRef.current?.stop();
      rendererRef.current = null;
    };
  }, []);

  return (
    <div className="w-full max-w-[800px] mx-auto">
      <canvas
        ref={canvasRef}
        className="w-full h-auto aspect-[4/3] border border-solid border-gray-300"
      />
      <div className="mt-2 text-center">
        {isPlaying ? "Playing animation" : "Animation stopped"}
      </div>
    </div>
  );
};

export default CustomPlayer;