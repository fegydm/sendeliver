import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import lottie from 'lottie-web/build/player/lottie_light';


const Banner: React.FC = () => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (container.current) {
      lottie.loadAnimation({
        container: container.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: '/animations/sendeliver-text.json', // Cesta k animácii
      });
    }
  }, []);

  return (
    <div className="w-full bg-black py-12 relative">
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
