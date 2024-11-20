// ./front/src/components/banners/banner.component.tsx
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
      path: "/animations/sendeliver-text.json",
    });

    return () => anim.destroy(); // Cleanup on unmount
  }, []);

  return (
    <section className="bg-banner-lightBg dark:bg-banner-darkBg text-banner-lightText dark:text-banner-darkText">
      <div className="max-w-content mx-auto flex items-center justify-between h-full px-container">
        {/* Text section */}
        <div className="text-white">
          <p className="text-lg font-light">
            Empowering connections between clients and carriers.
          </p>
        </div>

        {/* Lottie animation */}
        <div className="relative w-1/2 h-full">
          <div
            ref={container}
            className="absolute inset-0"
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  );
};

export default Banner;
