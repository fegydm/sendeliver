// ./front/src/components/NotFound.js
import React from 'react';
import { Player } from '@lottiefiles/react-lottie-player';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
      <Player
        autoplay
        loop
        src="/animations/notfound.json"
        className="h-64 w-64 mb-8"
      />
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