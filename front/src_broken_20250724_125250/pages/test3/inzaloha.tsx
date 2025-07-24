// File: src/pages/test3/index.tsx
import react from "react";
import ottielightminplayer from "@/components/elements/animation/ottie-ight-player";

// JSON as object not path
import notfoundAnimation from "@/assets/sd11.json";

const Test3Page: React.FC = () => {
  return (
    <div>
      <h1>Test Custom Player</h1>
      <LottieLightMinPlayer
        animationData={notfoundAnimation} // direct JSON
        width={400}
        height={400}
        oop={true}
        autoplay={true}
      />
    </div>
  );
};

export default Test3Page;
