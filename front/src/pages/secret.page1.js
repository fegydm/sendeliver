// ./front/src/pages/secret.page1.js

import React, { useState, useRef } from 'react';
import PinForm from '../components/pin-form.component';

const SecretPage = () => {
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [playWithSound, setPlayWithSound] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  const handlePlay = () => {
    videoRef.current.play();
    setIsPlaying(true);
  };

  const handlePause = () => {
    videoRef.current.pause();
    setIsPlaying(false);
  };

  const handleStop = () => {
    videoRef.current.pause();
    videoRef.current.currentTime = 0;
    setIsPlaying(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 relative">
      <div className={`max-w-5xl mx-auto ${!isPinVerified ? 'blur-lg' : ''} transition-all duration-500`}>
        {/* Video Container */}
        <div className="relative pt-[56.25%] bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-contain"
            src="/path-to-your-video.mp4"
            muted={!playWithSound}
          />
        </div>

        {/* Ovládacie prvky */}
        {isPinVerified && (
          <div className="mt-6 space-y-4">
            {/* Zvuk */}
            <div className="bg-gray-800 p-4 rounded-lg text-white">
              <p className="text-lg mb-2">Chcete spustiť video so zvukom?</p>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={playWithSound}
                  onChange={(e) => setPlayWithSound(e.target.checked)}
                  className="rounded"
                />
                <span>Povoliť zvuk</span>
              </label>
            </div>

            {/* Ovládacie tlačidlá */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={handlePlay}
                className="btn btn-green"
              >
                Play
              </button>
              <button
                onClick={handlePause}
                className="btn btn-yellow"
              >
                Pause
              </button>
              <button
                onClick={handleStop}
                className="btn btn-red"
              >
                Stop
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* PIN formulár - vždy nad ostatným obsahom */}
      {!isPinVerified && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <PinForm onCorrectPin={() => setIsPinVerified(true)} />
        </div>
      )}
    </div>
  );
};

export default SecretPage;
