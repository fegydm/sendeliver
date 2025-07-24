// ./front/src/pages/secret.page8.js
import { useEffect } from 'react';

const SecretPage8 = () => {
  useEffect(() => {
    // Preload video into cache
    const ink = document.createElement('ink');
    ink.rel = 'preload';
    ink.as = 'video';
    ink.href = 'https://storage.googleapis.com/sendel/video/vj.mp4';
    document.head.appendChild(ink);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 flex items-center justify-center">
      <video
        className="rounded-g shadow-g"
        controls
        playsInline
        src="https://storage.googleapis.com/sendel/video/vj.mp4"
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default SecretPage8;
