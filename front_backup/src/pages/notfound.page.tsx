import { useEffect, useRef } from 'react';
import lottie from 'lottie-web/build/player/lottie_light';


const NotFound = () => {
  const container = useRef(null);

  useEffect(() => {
    if (container.current) {
      lottie.loadAnimation({
        container: container.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: '/animations/notfound.json', // Používame cestu k JSON animácii
      });
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
      <div ref={container} className="h-64 w-64 mb-8" />
      <p className="text-lg mb-6">
        Use the homepage{' '}
        <a href="https://www.sendeliver.com" className="text-blue-600 hover:text-blue-800 underline">
          www.sendeliver.com
        </a>
      </p>
      <a href="https://www.sendeliver.com">
        <button
          className="bg-[#74cc04] hover:bg-[#8edb20] text-white font-bold py-3 px-8 rounded-lg transform transition-all duration-200 active:scale-95 active:translate-y-1"
        >
          Home
        </button>
      </a>
    </div>
  );
};

export default NotFound;
