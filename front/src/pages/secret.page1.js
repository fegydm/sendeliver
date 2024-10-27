// src/pages/secret-video.page.js
import React, { useState, useRef } from 'react';

const PinForm = ({ onCorrectPin }) => {
  const [pin, setPin] = useState('');
  const correctPin = '1234'; // V produkcii by toto malo byť bezpečne uložené

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin === correctPin) {
      onCorrectPin();
    } else {
      alert('Nesprávny PIN');
      setPin('');
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-lg z-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold mb-4">Zadajte PIN</h2>
        <input
          type="password"
          maxLength="4"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="w-full p-3 border rounded mb-4 text-center text-2xl tracking-widest"
          autoFocus
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Potvrdiť
        </button>
      </form>
    </div>
  );
};

const SecretVideoPage = () => {
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
    <div className="min-h-screen bg-gray-900 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Video Container - 70% výšky */}
        <div className="relative pt-[56.25%] bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-contain"
            src="/path-to-your-video.mp4"
            muted={!playWithSound}
          />
          
          {!isPinVerified && <PinForm onCorrectPin={() => setIsPinVerified(true)} />}
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
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Play
              </button>
              <button
                onClick={handlePause}
                className="px-8 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Pause
              </button>
              <button
                onClick={handleStop}
                className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Stop
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecretVideoPage;