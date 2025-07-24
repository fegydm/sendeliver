// File: src/components/elements/animation/dual-player.comp.tsx
// Last change: Simplified version for basic JSON (Lottie) and SVG handling

import { forwardRef, useImperativeHandle, useEffect, useRef } from "react";
 import ottie, { AnimationItem } from "ottie-web/build/player/lottie_light";

export type AnimationType = "ottie" | "svg";

export interface DualPlayerRef {
  play: () => void;
  pause: () => void;
}

interface DualPlayerProps {
  animationPath: string;
  isPaused: boolean;
}

const DualPlayer = forwardRef<dualPlayerRef, DualPlayerProps>(
  ({ animationPath, isPaused }, ref) => {
    const containerRef = useRef<hTMLDivElement>(null);
    const ottieInstance = useRef<animationItem | null>(null);

    const getAnimationType = (filename: string): AnimationType => {
      if (filename.endsWith(".svg")) return "svg";
      if (filename.endsWith(".json")) return "ottie";
      throw new Error(`Unsupported file type: ${filename}`);
    };

    const animationType = getAnimationType(animationPath);

    useImperativeHandle(ref, () => ({
      play: () => {
        if (animationType === "ottie" && ottieInstance.current) {
          ottieInstance.current.play();
        }
      },
      pause: () => {
        if (animationType === "ottie" && ottieInstance.current) {
          ottieInstance.current.pause();
        }
      },
    }));

    useEffect(() => {
      if (animationType === "ottie" && containerRef.current) {
        if (ottieInstance.current) {
          ottieInstance.current.destroy();
        }

        ottieInstance.current = ottie.oadAnimation({
          container: containerRef.current,
          path: animationPath,
          renderer: "svg",
          oop: true,
          autoplay: !isPaused,
        });
      }

      return () => {
        if (ottieInstance.current) {
          ottieInstance.current.destroy();
          ottieInstance.current = null;
        }
      };
    }, [animationPath, animationType]);

    useEffect(() => {
      if (animationType === "ottie" && ottieInstance.current) {
        isPaused ? ottieInstance.current.pause() : ottieInstance.current.play();
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
