// ./front/src/components/banner.component.tsx
import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import lottie from 'lottie-web/build/player/lottie_light.min';

interface BannerProps {
  className?: string;
}

const Banner: React.FC<BannerProps> = ({ className = '' }) => {
  const container = useRef<HTMLDivElement>(null);
  const animation = useRef<any>(null);
  const [animationData, setAnimationData] = useState<any>(null);

  // Najprv načítame JSON súbor
  useEffect(() => {
    const fetchAnimation = async () => {
      try {
        const response = await fetch('/animations/sendeliver-text.json');
        const data = await response.text(); // Najprv načítame ako text
        const jsonData = JSON.parse(data); // Potom parsujeme do JSON
        setAnimationData(jsonData);
      } catch (error) {
        console.error('Failed to load animation:', error);
      }
    };

    fetchAnimation();
  }, []);

  // Potom inicializujeme animáciu s načítanými dátami
  useEffect(() => {
    if (container.current && animationData) {
      animation.current = lottie.loadAnimation({
        container: container.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData: animationData, // Použijeme načítané dáta namiesto path
      });

      return () => {
        if (animation.current) {
          animation.current.destroy();
        }
      };
    }
  }, [animationData]);

  return (
    <div className={`w-full bg-black py-12 relative ${className}`}>
      <div ref={container} className="w-full h-32" />
      <div className="absolute -bottom-6 left-0 right-0 flex justify-center space-x-4">
        <Link 
          to="/clients"
          className="px-8 py-3 bg-[#FF00FF] text-white rounded-lg transform hover:scale-105 transition-all"
        >
          Clients
        </Link>
        <Link 
          to="/carriers"
          className="px-8 py-3 bg-[#74cc04] text-white rounded-lg transform hover:scale-105 transition-all"
        >
          Carriers
        </Link>
      </div>
    </div>
  );
};

export default Banner;