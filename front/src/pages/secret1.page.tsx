import { useState, useEffect, useRef } from 'react';
import PinForm from '../components/pin-form.component';

const SecretPage = () => {
  const [isPinVerified, setIsPinVerified] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isPinVerified) {
      // Preload video into cache
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'video';
      link.href = 'https://storage.googleapis.com/sendel/video/vj.mp4';
      document.head.appendChild(link);

      // Set timeout to revert to PIN form after inactivity
      const timer = setTimeout(() => {
        setIsPinVerified(false);
      }, 60000); // 1 minute inactivity

      return () => {
        clearTimeout(timer);
        document.head.removeChild(link); // Cleanup the preloaded video link
      };
    }
  }, [isPinVerified]);

  const handlePlay = () => {
    videoRef.current?.play();
  };

  const handlePause = () => {
    videoRef.current?.pause();
  };

  const handleStop = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 relative">
      <div className="max-w-5xl mx-auto">
        {/* Video Container */}
        {isPinVerified && (
          <>
            <div className="relative pt-[56.25%] bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full"
                playsInline
                src="https://storage.googleapis.com/sendel/video/vj.mp4"
              >
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="mt-4 flex justify-center space-x-4">
              <button
                onClick={handlePlay}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Play
              </button>
              <button
                onClick={handlePause}
                className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
              >
                Pause
              </button>
              <button
                onClick={handleStop}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Stop
              </button>
            </div>
          </>
        )}

        {/* PIN Form */}
        {!isPinVerified && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <PinForm onCorrectPin={() => setIsPinVerified(true)} />
          </div>
        )}
      </div>
    </div>
  );
};

export default SecretPage;