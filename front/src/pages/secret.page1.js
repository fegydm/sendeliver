// ./front/src/pages/secret.page1.js
import React, { useState, useRef } from 'react';
import PinForm from '../components/pin-form.component';

const SecretPage = () => {
  const [isPinVerified, setIsPinVerified] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 relative">
      <div className="max-w-5xl mx-auto">
        {/* Video Container */}
        {isPinVerified && (
          <div className="relative pt-[56.25%] bg-black rounded-lg overflow-hidden">
            <iframe
              className="absolute inset-0 w-full h-full"
              src="https://youtu.be/cZ9xOeLuG3o?si=_C-qQHu-qJ5jHOsW"
              title="YouTube Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
        )}

        {/* PIN Form - Zobrazený nad obsahom */}
        {!isPinVerified && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <PinForm onCorrectPin={() => setIsPinVerified(true)} />
          </div>
        )}
      </div>
    </div>
  );
};

export default SecretPage;
