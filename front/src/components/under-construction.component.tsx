import { useEffect, useRef } from 'react';
import lottie from 'lottie-web/build/player/lottie_light';
import { useNavigate } from 'react-router-dom';

const UnderConstruction = () => {
  const navigate = useNavigate();
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (container.current) {
      lottie.loadAnimation({
        container: container.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: '/animations/under-construction.json', // Cesta k animácii
      });
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-start h-screen bg-white p-4">
      <div ref={container} className="h-64 w-64 mb-8" />
      <h1 className="text-3xl font-bold text-gray-800 mb-4">UNDER CONSTRUCTION</h1>
      <p className="text-lg mb-6">vytrim a idz domu abo nazad</p>
      <div className="flex items-center space-x-4">
        <a href="https://www.sendeliver.com">
          <button
            className="bg-[#74cc04] hover:bg-[#8edb20] text-white font-bold py-3 px-8 rounded-lg transform transition-all duration-200 active:scale-95 active:translate-y-1"
          >
            HOME
          </button>
        </a>
        <button
          onClick={() => navigate(-1)}
          className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-3 px-8 rounded-lg transform transition-all duration-200 active:scale-95 active:translate-y-1"
        >
          BACK
        </button>
      </div>
    </div>
  );
};

export default UnderConstruction;
