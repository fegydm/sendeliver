// File: ./front/src/pages/jozo.page.tsx
import { useState, useEffect, useRef } from "react";
import PinForm from "@/components/shared/elements/pin-form.comp";
import "@/styles/sections/jozo.page.css";
import videoFile from "@/assets/jp.mp4";

const JozoPage: React.FC = () => {
  const [isPinVerified, setIsPinVerified] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPinVerified) {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "video";
      link.href = videoFile;
      document.head.appendChild(link);
      timerRef.current = setTimeout(() => {
        setIsPinVerified(false);
      }, 60000);
      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
        document.head.removeChild(link);
      };
    }
  }, [isPinVerified]);

  const handlePlay = () => {
    window.open(videoFile, "_blank");
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
    <div className="jozo-page">
      <div className="jozo-page__container">
        {isPinVerified ? (
          <>
            <div className="jozo-page__video-container">
              <video
                ref={videoRef}
                className="jozo-page__video"
                playsInline
                src={videoFile}
              >
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="jozo-page__button-container">
              <button onClick={handlePlay} className="jozo-page__button jozo-page__button--play">
                Play
              </button>
              <button onClick={handlePause} className="jozo-page__button jozo-page__button--pause">
                Pause
              </button>
              <button onClick={handleStop} className="jozo-page__button jozo-page__button--stop">
                Stop
              </button>
            </div>
          </>
        ) : (
          <div className="jozo-page__overlay">
            <PinForm onCorrectPin={() => setIsPinVerified(true)} />
          </div>
        )}
      </div>
    </div>
  );
};

export default JozoPage;
