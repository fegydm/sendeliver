// File: front/src/pages/test3/index.tsx
import React from "react";
import LottiePlayer from "@/components/elements/animation/lottie-player.element";

const Test3Page: React.FC = () => {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <LottiePlayer animationPath="/animation/sd11.json" />
    </div>
  );
};

export default Test3Page;
