// ./front/src/components/under-construction.component.js
import React from 'react';
import { Player } from '@lottiefiles/react-lottie-player';
import { useNavigate } from 'react-router-dom';

const UnderConstruction = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
      <Player
        autoplay
        loop
        src="/animations/under-construction.json"  // Nahradiť cestu na animáciu pre "Under Construction"
        className="h-64 w-64 mb-8"
      />
      <h1 className="text-3xl font-bold text-gray-800 mb-4">UNDER CONSTRUCTION</h1>
      <p className="text-lg mb-6">vytrim a idz domu</p>
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
      <div className="flex flex-col items-center mt-4">
        <a href="https://www.sendeliver.com" className="text-blue-600 hover:text-blue-800 underline mb-2">
          abo nazad
        </a>
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:text-blue-800 underline"
        >
          Predošlá stránka
        </button>
      </div>
    </div>
  );
};

export default UnderConstruction;
