// File: src/components/sections/banners/banner.component.tsx
// Last change: Simplified animation loading using static paths from public folder

import React, { useRef, useState } from 'react';
import DualPlayer, { type DualPlayerRef, type AnimationType } from "@/components/elements/animation/dual-player.element";

// Define available animations from public/animations folder with their types
const ANIMATIONS = [
  { name: 'sendeliver-text11.json', type: 'lottie' as const },
  { name: 'other-animation.json', type: 'lottie' as const },
  { name: 'logo-animation.svg', type: 'svg' as const }
];

const Banner: React.FC = () => {
  const playerRef = useRef<DualPlayerRef>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedAnimation, setSelectedAnimation] = useState(ANIMATIONS[0]);
  const [error, setError] = useState<string | null>(null);

  const handlePlayPause = () => {
    setIsPaused(prev => {
      const nextState = !prev;
      nextState ? playerRef.current?.pause() : playerRef.current?.play();
      return nextState;
    });
  };

  const getAnimationPath = (filename: string): string => `/animations/${filename}`;

  return (
    <div>
      <h2>Empowering Connections Between Clients and Carriers.</h2>

      {!import.meta.env.PROD && (
        <div>
          <label htmlFor="animationSelect">Select Animation:</label>
          <select
            id="animationSelect"
            value={selectedAnimation.name}
            onChange={(e) => {
              const selected = ANIMATIONS.find(anim => anim.name === e.target.value);
              if (selected) setSelectedAnimation(selected);
            }}
          >
            {ANIMATIONS.map((animation) => (
              <option key={animation.name} value={animation.name}>
                {animation.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {error ? (
        <div>{error}</div>
      ) : (
        <DualPlayer
          ref={playerRef}
          animationType={selectedAnimation.type}
          animationPath={getAnimationPath(selectedAnimation.name)}
          isPaused={isPaused}
        />
      )}

      <div>
        <button onClick={handlePlayPause}>
          {isPaused ? "Play" : "Pause"}
        </button>
      </div>
    </div>
  );
};

export default Banner;