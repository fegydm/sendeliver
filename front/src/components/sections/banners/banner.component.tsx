// ./front/src/components/banner.component.tsx
import React, { useEffect, useRef } from "react";
import lottie from "lottie-web/build/player/lottie_light";
import "@/styles/components/_banner.css"; // Import CSS styles for the banner

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
        <div className="banner-animation" ref={container} aria-hidden="true" />
      </div>
    </section>
  );
};

export default Banner;
