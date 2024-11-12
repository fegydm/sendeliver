// ./front/src/components/banners/banner.component.tsx
import React, { useEffect, useRef } from "react";
import lottie from "lottie-web/build/player/lottie_light"; // Používa ľahkú verziu lottie-web bez eval
// Namiesto priameho importu JSON súboru použijeme URL z priečinka `public`

const Banner: React.FC = () => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const anim = lottie.loadAnimation({
      container: container.current!,
      renderer: "svg",
      loop: true,
      autoplay: true,
      path: "/animations/sendeliver-text.json", // Použite URL namiesto priameho importu JSON objektu
    });

    return () => anim.destroy(); // Vyčistenie animácie po demontáži komponentu
  }, []);

  return (
    <div className="h-banner bg-gray-950 py-banner">
      <div className="container mx-auto h-banner-inner">
        <div className="flex items-center justify-between h-full">
          {/* Textová sekcia */}
          <div className="text-white">
            <p className="text-banner font-light">
              Empowering connections between clients and carriers.
            </p>
          </div>

          {/* Lottie animácia */}
          <div className="relative w-1/2 h-full">
            <div ref={container} className="absolute inset-0" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
