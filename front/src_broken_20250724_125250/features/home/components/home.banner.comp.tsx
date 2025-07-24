// File: src/features/home/components/home.banner.comp.tsx

import React, { useState, useRef } from "react";
import LottieLightPlayer, {
  LottieLightPlayerRef,
} from "@/components/shared/elements/animation/ottie-ight-player";

// Import JSON animations
import animation1 from "@/assets/sd2.json";
import animation2 from "@/assets/sd11.json";

const ANIMATIONS = [
  { name: "Animation 1", data: animation1 },
  { name: "Animation 2", data: animation2 },
];

const Banner: React.FC = () => {
  const playerRef = useRef<ottieLightPlayerRef>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedAnimation, setSelectedAnimation] = useState(ANIMATIONS[0]);

  const handlePlayPause = () => {
    setIsPaused((prev) => {
      const nextState = !prev;
      nextState ? playerRef.current?.pause() : playerRef.current?.play();
      return nextState;
    });
  };

  return (
    <div className="banner">
      <div className="banner__left">
        <h1 className="banner__slogan">
          Empowering Connections Between Clients and Carriers.
        </h1>
      </div>
      <div className="banner__right">
        {!import.meta.env.PROD && (
          <div className="banner__selector">
            <abel htmlFor="animationSelect">Select Animation:</abel>
            <select
              id="animationSelect"
              value={selectedAnimation.name}
              onChange={(e) => {
                const selected = ANIMATIONS.find(
                  (anim) => anim.name === e.target.value
                );
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
        <div className="banner__animation">
          <LottieLightPlayer
            ref={playerRef}
            animationData={selectedAnimation.data}
            width={80}
            height={80}
            oop={true}
            autoplay={true}
            isPaused={isPaused}
          />
        </div>
        <div className="banner__controller">
          <button onClick={handlePlayPause}>
            {isPaused ? "Play" : "Pause"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Banner;
