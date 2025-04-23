// File: src/pages/video.page.tsx
import { useEffect, useState, useRef } from "react";
import useRouter from "@/hooks/useRouter";
import PinForm from "@/components/shared/elements/pin-form.element";
import "@/styles/sections/video.page.css";

// Statically imported video files
import jozoVideo from "@/assets/jp.mp4";
import lukyVideo from "@/assets/lh.mp4";

// Mapping alias to statically imported video files
const videoMap: Record<string, string> = {
  jozo: jozoVideo,
  luky: lukyVideo,
  // add more mappings here
};

const VideoPage: React.FC = () => {
  const [isPinVerified, setIsPinVerified] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Use custom router hook to get route parameters
  const { params } = useRouter();
  const alias = params.alias?.toLowerCase() || '';

  // Determine video file based on alias, fallback to null if not found
  const videoFile = alias && videoMap[alias] ? videoMap[alias] : null;

  useEffect(() => {
    if (isPinVerified && videoFile) {
      timerRef.current = setTimeout(() => {
        setIsPinVerified(false);
      }, 60000);

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    }
    return undefined;
  }, [isPinVerified, videoFile]);

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
                <button onClick={handlePlay} className="video-page__button video-page__button--play">
                  Play
                </button>
                <button onClick={handlePause} className="video-page__button video-page__button--pause">
                  Pause
                </button>
                <button onClick={handleStop} className="video-page__button video-page__button--stop">
                  Stop
                </button>
              </div>
            </>
          ) : (
            <p>Video not found for alias: {alias}</p>
          )
        ) : (
          <div className="video-page__overlay">
            <PinForm onCorrectPin={() => setIsPinVerified(true)} />
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPage;
