// File: src/pages/test3/index.tsx
import React from "react";
import LottieLightMinPlayer from "@/components/elements/animation/lottie-light-min-player";

// JSON as object not path
import notfoundAnimation from "@/assets/notfound.json";

const Test3Page: React.FC = () => {
  return (
    <div>
      <h1>Test Custom Player</h1>
      <LottieLightMinPlayer
        animationData={notfoundAnimation} // direct JSON
        width={500}
        height={500}
        loop={true}
        autoplay={true}
      />
    </div>
  );
};

export default Test3Page;
