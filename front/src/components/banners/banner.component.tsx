// ./front/src/components/banners/banner.component.tsx
import React, { useEffect, useRef } from "react";
<<<<<<< HEAD
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
=======
import lottie from "lottie-web";
import type { AnimationItem } from "lottie-web";

const Banner: React.FC = () => {
  const container = useRef<HTMLDivElement>(null);
  const anim = useRef<AnimationItem | null>(null);

  useEffect(() => {
    let animationInstance: AnimationItem | null = null;

    const loadAnimation = async () => {
      if (container.current && !anim.current) {
        try {
          const response = await fetch("/animations/sendeliver-text.json");
          const animationData = await response.json();

          animationInstance = lottie.loadAnimation({
            container: container.current,
            renderer: "svg",
            loop: true,
            autoplay: true,
            animationData,
            rendererSettings: {
              progressiveLoad: true,
              hideOnTransparent: false,
              className: "lottie-svg",
            },
          });

          animationInstance.setSubframe(false);
          anim.current = animationInstance;
        } catch (error) {
          console.error("Failed to load animation:", error);
        }
      }
    };

    loadAnimation();

    return () => {
      if (animationInstance) {
        animationInstance.destroy();
      }
      if (anim.current) {
        anim.current.destroy();
        anim.current = null;
      }
    };
>>>>>>> 5430219 (up css)
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

<<<<<<< HEAD
          {/* Lottie animation */}
          <div className="relative w-1/2 h-full">
            <div ref={container} className="absolute inset-0 max-h-banner" aria-hidden="true" />
=======
          {/* Lottie animation container */}
          <div className="relative w-1/2 h-full">
            <div
              ref={container}
              className="absolute inset-0"
              aria-hidden="true"
            />
>>>>>>> 5430219 (up css)
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
