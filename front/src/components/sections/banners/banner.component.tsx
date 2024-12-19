import React, { useEffect, useRef } from "react";
import lottie from "lottie-web/build/player/lottie_light";

const Banner: React.FC = () => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const anim = lottie.loadAnimation({
      container: container.current!,
      renderer: "svg",
      loop: true,
      autoplay: true,
      path: "/animations/sendeliver-text.json", // Path to animation
    });

    return () => anim.destroy(); // Cleanup on unmount
  }, []);

  return (
    <section className="banner">
      <div className="banner-content">
        {/* Left section - Title */}
        <h1 className="banner-title">
          Empowering connections between clients and carriers.
        </h1>
        {/* Right section - Animation */}
        <div
          className="banner-animation"
          ref={container}
          aria-hidden="true"
          style={{
            width: "150px",
            height: "150px",
            margin: "0 auto", // Center
            overflow: "hidden",
          }}
        />
      </div>
    </section>
  );
};

export default Banner;
