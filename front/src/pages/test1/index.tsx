// File: src/pages/test1/index.tsx
// Last change: Added detailed console logging for debugging

import React, { useEffect, useRef, useState } from "react";
import DualPlayer, { type DualPlayerRef, type AnimationType } from "@/components/elements/animation/lottie-player.element";

const Test1Page: React.FC = () => {
  const playerRef = useRef<DualPlayerRef>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [animations, setAnimations] = useState<string[]>([]);
  const [selectedAnimation, setSelectedAnimation] = useState<string | null>(null);
  const [animationType, setAnimationType] = useState<AnimationType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getAnimationType = (filename: string): AnimationType => {
    console.log("Determining animation type for:", filename);
    if (filename.endsWith(".svg")) return "svg";
    if (filename.endsWith(".json")) return "lottie";
    throw new Error(`Unsupported file type: ${filename}`);
  };

  useEffect(() => {
    // Fetch the list of animations from the backend
    const fetchAnimations = async () => {
      console.log("Fetching animations from backend...");
      try {
        const response = await fetch("/api/animations");
        console.log("Response received:", response);

        if (!response.ok) {
          throw new Error(`Failed to fetch animations, status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Animations fetched successfully:", data);

        setAnimations(data);
        setSelectedAnimation(data[0] || null);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred.";
        console.error("Error fetching animations:", errorMessage);
        setError(errorMessage);
      }
    };

    fetchAnimations();
  }, []);

  useEffect(() => {
    if (selectedAnimation) {
      console.log("Selected animation changed:", selectedAnimation);
      try {
        const type = getAnimationType(selectedAnimation);
        setAnimationType(type);
        console.log("Animation type determined:", type);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred.";
        console.error("Error determining animation type:", errorMessage);
        setError(errorMessage);
      }
    } else {
      console.log("No animation selected.");
    }
  }, [selectedAnimation]);

  const handlePlayPause = () => {
    setIsPaused((prev) => {
      const nextState = !prev;
      console.log("Toggling play/pause:", nextState ? "Paused" : "Playing");
      if (nextState) {
        playerRef.current?.pause();
      } else {
        playerRef.current?.play();
      }
      return nextState;
    });
  };

  const handleAnimationChange = (path: string) => {
    console.log("Changing selected animation to:", path);
    setSelectedAnimation(path);
    setError(null);
  };

  return (
    <div>
      <h1>Test 1 - Dynamic Animation Player</h1>

      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      <div>
        <label htmlFor="animationSelect">Select Animation:</label>
        <select
          id="animationSelect"
          value={selectedAnimation || ""}
          onChange={(e) => handleAnimationChange(e.target.value)}
        >
          {animations.map((anim) => (
            <option key={anim} value={`/animation/${anim}`}>
              {anim}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p>Current Animation: {selectedAnimation || "None selected"}</p>
        <p>Animation Type: {animationType || "Unknown"}</p>

        {selectedAnimation ? (
          <DualPlayer
            ref={playerRef}
            animationPath={selectedAnimation}
            isPaused={isPaused}
          />
        ) : (
          <p>Please select an animation to play.</p>
        )}

        <button onClick={handlePlayPause} disabled={!selectedAnimation}>
          {isPaused ? "Play" : "Pause"}
        </button>
      </div>
    </div>
  );
};

export default Test1Page;
