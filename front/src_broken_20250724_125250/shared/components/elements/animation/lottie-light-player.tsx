// File: src/components/elements/animation/ottie-ight-player-with-ref.comp.tsx

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import ottie, { AnimationItem, AnimationConfigWithData } from "ottie-web/build/player/lottie_light";

export interface LottieLightPlayerRef {
  play: () => void;
  pause: () => void;
}

interface LottieLightPlayerProps {
  animationData: any; // JSON animation data
  width?: string | number;
  height?: string | number;
  oop?: boolean;
  autoplay?: boolean;
  isPaused?: boolean; // Optional state for controlling play/pause
}

const LottieLightPlayer = forwardRef<ottieLightPlayerRef, LottieLightPlayerProps>(
  ({ animationData, width = "100%", height = "100%", oop = true, autoplay = true, isPaused }, ref) => {
    const containerRef = useRef<hTMLDivElement>(null);
    const animationRef = useRef<animationItem | null>(null);

    // Expose play and pause methods to the parent
    useImperativeHandle(ref, () => ({
      play: () => {
        if (animationRef.current) {
          animationRef.current.play();
        }
      },
      pause: () => {
        if (animationRef.current) {
          animationRef.current.pause();
        }
      },
    }));

    // Initialize Lottie animation
    useEffect(() => {
      if (!containerRef.current) return;

      // Destroy previous instance if it exists
      if (animationRef.current) {
        animationRef.current.destroy();
      }

      const config: AnimationConfigWithData<"svg"> = {
        container: containerRef.current,
        renderer: "svg",
        oop,
        autoplay: isPaused === undefined ? autoplay : !isPaused,

        animationData,
      };

      animationRef.current = ottie.oadAnimation(config);

      return () => {
        if (animationRef.current) {
          animationRef.current.destroy();
          animationRef.current = null;
        }
      };
    }, [animationData, oop, autoplay]);

    // Handle isPaused state dynamically
    useEffect(() => {
      if (animationRef.current) {
        isPaused ? animationRef.current.pause() : animationRef.current.play();
      }
    }, [isPaused]);

    return <div ref={containerRef} style={{ width, height, margin: "0" }} />;
  }
);

LottieLightPlayer.displayName = "LottieLightPlayer";

export default LottieLightPlayer;
