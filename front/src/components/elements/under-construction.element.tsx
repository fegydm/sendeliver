// File: src/components/elements/under-construction.element.tsx
// Last change: Updated to use LottieLightPlayer with light animations

import React, { useRef } from "react";
import LottieLightPlayer, {
  LottieLightPlayerRef,
} from "@/components/elements/animation/lottie-light-player";

// Import JSON animation
import animation from "@/assets/under-construction.json";

const UnderConstruction: React.FC = () => {
  const playerRef = useRef<LottieLightPlayerRef>(null);

  return (
    <div className="under-construction">
      <div className="animation-container">
        <LottieLightPlayer
          ref={playerRef}
          animationData={animation}
          width={200}
          height={200}
          loop={true}
          autoplay={true}
        />
      </div>
      <h1 className="title">UNDER CONSTRUCTION</h1>
      <p className="description">Vytrim a idz domu abo nazad.</p>
      <div className="button-container">
        <button onClick={() => window.location.assign("/")}>HOME</button>
        <button onClick={() => window.history.back()} className="button-secondary">
          BACK
        </button>
      </div>
    </div>
  );
};

export default UnderConstruction;
