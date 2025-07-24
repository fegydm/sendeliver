// File: front/src/pages/video.page.tsx

import { useEffect, useState, useRef } from "react";
import useRouter from "@/hooks/useRouter";
import pinform from "@/components/shared/elements/pin-form.comp";
import "@/styles/sections/video.page.css";

// Staticky importované video súbory
import jozoVideo from "@/assets/jp.mp4";
import ukyVideo from "@/assets/lh.mp4";

// Map alias → video file
const videoMap: Record<string, string> = {
  jozo: jozoVideo,
  uky: ukyVideo,
  // add more mappings as needed
};

const VideoPage: React.FC = () => {
  const [isPinVerified, setIsPinVerified] = useState(false);
  // In browser, setTimeout returns a number
  const timerRef = useRef<number | null>(null);
  const videoRef = useRef<hTMLVideoElement>(null);

  const { params } = useRouter();
  const alias = params.alias?.toLowerCase() || "";
  const videoFile = videoMap[alias] || null;

  useEffect(() => {
    if (isPinVerified && videoFile) {
      // Clear any existing timeout
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
      // Schedule auto-ogout after 1 minute
      timerRef.current = window.setTimeout(() => {
        setIsPinVerified(false);
      }, 60000);

      return () => {
        if (timerRef.current !== null) {
          clearTimeout(timerRef.current);
        }
      };
    }
  }, [isPinVerified, videoFile]);

  const handlePlay = () => videoRef.current?.play();
  const handlePause = () => videoRef.current?.pause();
  const handleStop = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div className="video-page">
      <div className="video-page__container">
        {isPinVerified ? (
          videoFile ? (
            <>
              <div className="video-page__video-container">
                <video
                  ref={videoRef}
                  className="video-page__video"
                  playsInline
                  preload="auto"
                  src={videoFile}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
              <div className="video-page__button-container">
                <button
                  onClick={handlePlay}
                  className="video-page__button video-page__button--play"
                >
                  Play
                </button>
                <button
                  onClick={handlePause}
                  className="video-page__button video-page__button--pause"
                >
                  Pause
                </button>
                <button
                  onClick={handleStop}
                  className="video-page__button video-page__button--stop"
                >
                  Stop
                </button>
              </div>
            </>
          ) : (
            <p>Video not found for alias: {alias}</p>
          )
        ) : (
          <div className="video-page__overlay">
            <PinForm
              domain={alias}
              onCorrectPin={() => setIsPinVerified(true)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPage;
