// ./front/src/components/under-construction.component.tsx
import { useEffect, useRef } from 'react';
import lottie from 'lottie-web/build/player/lottie_light';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const UnderConstruction = () => {
  const navigate = useNavigate();
  const container = useRef<HTMLDivElement>(null);
  const animationRef = useRef<any>(null);

  useEffect(() => {
    if (container.current) {
      animationRef.current = lottie.loadAnimation({
        container: container.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: '/animations/under-construction.json',
      });
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-start h-screen bg-hauler-gray-50 dark:bg-hauler-gray-800 p-4">
      <div ref={container} className="h-64 w-64 mb-8" />
      <h1 className="text-3xl font-bold text-hauler-gray-800 dark:text-hauler-gray-50 mb-4">
        UNDER CONSTRUCTION
      </h1>
      <p className="text-lg text-hauler-gray-600 dark:text-hauler-gray-300 mb-6">
        vytrim a idz domu abo nazad
      </p>
      <div className="flex items-center space-x-4">
        <Link to="/">
          <button className="bg-client-primary-500 hover:bg-client-primary-600 text-white font-bold py-3 px-8 rounded-lg transform transition-all duration-200 active:scale-95 active:translate-y-1">
            HOME
          </button>
        </Link>
        <button
          onClick={() => navigate(-1)}
          className="bg-hauler-primary-600 hover:bg-hauler-primary-700 text-white font-bold py-3 px-8 rounded-lg transform transition-all duration-200 active:scale-95 active:translate-y-1"
        >
          BACK
        </button>
      </div>
    </div>
  );
};

export default UnderConstruction;