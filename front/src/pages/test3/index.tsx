// File: front/src/pages/test3/index.tsx
// Last change: Updated Test3Page with a simple title and CustomPlayer

import React from "react";
import CustomPlayer from "@/components/elements/animation/custom-player.element";

const Test3Page: React.FC = () => {
  return (
    <div>
      <h1>Test Custom Player</h1>
      <CustomPlayer />
    </div>
  );
};

export default Test3Page;
