// src/components/NotFound.js
import React, { useEffect, useState } from 'react';

const NotFound = () => {
  const [LottiePlayer, setLottiePlayer] = useState(null);
  const [isJsEnabled, setIsJsEnabled] = useState(false);

  useEffect(() => {
    setIsJsEnabled(true);
    // Dynamický import Lottie
    import('@lottiefiles/react-lottie-player')
      .then(module => setLottiePlayer(module.Player))
      .catch(err => console.log('Lottie load failed:', err));
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
      {/* Pre crawlery a non-JS používateľov */}
      <noscript>
        <div className="text-center">
          <p className="text-lg mb-6">
            Use the homepage {' '}
            <a href="https://www.sendeliver.com" className="text-blue-600 underline">
              www.sendeliver.com
            </a>
          </p>
          <a href="https://www.sendeliver.com">
            <button className="bg-[#74cc04] text-white font-bold py-3 px-8 rounded-lg">
              Home
            </button>
          </a>
        </div>
      </noscript>

      {/* Pre používateľov s JS */}
      {isJsEnabled && (
        <>
          {LottiePlayer && (
            <LottiePlayer
              autoplay
              loop
              src="/animations/notfound.json"
              className="h-64 w-64 mb-8"
            />
          )}
          <p className="text-lg mb-6">
            Use the homepage {' '}
            <a 
              href="https://www.sendeliver.com" 
              className="text-blue-600 hover:text-blue-800 underline"
            >
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
        </>
      )}
    </div>
  );
};

export default NotFound;