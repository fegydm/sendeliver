// File: src/components/elements/animation/dual-player.element.tsx
// Last change: Simplified version for basic JSON (Lottie) and SVG handling

import { forwardRef, useImperativeHandle, useEffect, useRef } from "react";
 import lottie, { AnimationItem } from "lottie-web/build/player/lottie_light";

export type AnimationType = "lottie" | "svg";

export interface DualPlayerRef {
  play: () => void;
  pause: () => void;
}

interface DualPlayerProps {
  animationPath: string;
  isPaused: boolean;
}

const DualPlayer = forwardRef<DualPlayerRef, DualPlayerProps>(
  ({ animationPath, isPaused }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const lottieInstance = useRef<AnimationItem | null>(null);

    const getAnimationType = (filename: string): AnimationType => {
      if (filename.endsWith(".svg")) return "svg";
      if (filename.endsWith(".json")) return "lottie";
      throw new Error(`Unsupported file type: ${filename}`);
    };

    const animationType = getAnimationType(animationPath);

    useImperativeHandle(ref, () => ({
      play: () => {
        if (animationType === "lottie" && lottieInstance.current) {
          lottieInstance.current.play();
        }
      },
      pause: () => {
        if (animationType === "lottie" && lottieInstance.current) {
          lottieInstance.current.pause();
        }
      },
    }));

    useEffect(() => {
      if (animationType === "lottie" && containerRef.current) {
        if (lottieInstance.current) {
          lottieInstance.current.destroy();
        }

        lottieInstance.current = lottie.loadAnimation({
          container: containerRef.current,
          path: animationPath,
          renderer: "svg",
          loop: true,
          autoplay: !isPaused,
        });
      }

      return () => {
        if (lottieInstance.current) {
          lottieInstance.current.destroy();
          lottieInstance.current = null;
        }
      };
    }, [animationPath, animationType]);

    useEffect(() => {
      if (animationType === "lottie" && lottieInstance.current) {
        isPaused ? lottieInstance.current.pause() : lottieInstance.current.play();
      }
    }, [isPaused, animationType]);

    if (animationType === "svg") {
      return <img src={animationPath} alt="SVG Animation" style={{ width: "100%", height: "100%" }} />;
    }

    return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
  }
);

DualPlayer.displayName = "DualPlayer";

export default DualPlayer;
