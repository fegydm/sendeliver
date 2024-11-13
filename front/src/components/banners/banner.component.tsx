// ./front/src/components/banners/banner.component.tsx
import React, { useEffect, useRef } from "react";
import lottie from "lottie-web/build/player/lottie_light"; // Using the light version of lottie-web without eval

// Using URL from `public` folder instead of direct JSON import

const Banner: React.FC = () => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const anim = lottie.loadAnimation({
      container: container.current!,
      renderer: "svg",
      loop: true,
      autoplay: true,
      path: "/animations/sendeliver-text.json", // Use URL instead of direct JSON object import
    });

    return () => anim.destroy(); // Clean up animation on component unmount
  }, []);

  return (
    <div className="h-banner bg-gray-950 py-banner">
      <div className="container mx-auto h-banner-inner">
        <div className="flex items-center justify-between h-full">
          {/* Text section */}
          <div className="text-white">
            <p className="text-banner font-light">
              Empowering connections between clients and carriers.
            </p>
          </div>

          {/* Lottie animation */}
          <div className="relative w-1/2 h-full">
            <div ref={container} className="absolute inset-0 max-h-banner" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
