// File: src/components/sections/banners/banner.component.tsx
// Last change: Removed max height and ensured proper spacing between banner and content.

import React, { useState, useEffect, useRef } from 'react';
import DualPlayer, { type DualPlayerRef, AnimationType } from "@/components/elements/animation/dual-player.element";

// Automatically import all animations from the public folder
const animations = import.meta.glob('/public/animations/*.{json,svg}');

// Validate if the provided data is a valid Lottie animation
const isValidLottie = (data: any): boolean =>
    data?.v && Array.isArray(data.layers) && data.layers.length > 0;

const Banner: React.FC = () => {
    const playerRef = useRef<DualPlayerRef>(null);
    const [isPaused, setIsPaused] = useState(false);
    const [animationData, setAnimationData] = useState<any>(null);
    const [selectedAnimation, setSelectedAnimation] = useState<string | null>(null);
    const [animationType, setAnimationType] = useState<AnimationType>("lottie");
    const [animationList, setAnimationList] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Load all available animations when the component mounts
    useEffect(() => {
        document.title = "Banner";
        
        const loadAnimationList = async () => {
            const filePaths = Object.keys(animations).map(file =>
                file.replace('/public/animations/', '')
            ).sort();

            if (filePaths.length > 0) {
                setAnimationList(filePaths);
                setSelectedAnimation(filePaths[0]); // Select the first animation by default
            } else {
                setError("No animations available.");
            }
        };
        loadAnimationList();
    }, []);

    // Load the selected animation and validate the format
    useEffect(() => {
        const loadSelectedAnimation = async () => {
            if (!selectedAnimation) return;
            try {
                const response = await fetch(`/animations/${selectedAnimation}`);
                if (!response.ok) throw new Error("Failed to load the animation file.");
                const jsonData = await response.json();

                if (isValidLottie(jsonData)) {
                    setAnimationData(jsonData);
                    setAnimationType("lottie");
                    setError(null);
                } else {
                    setAnimationType("svg");
                    setAnimationData(null);
                    setError(null);
                }
            } catch (error) {
                console.error("Error loading animation:", error);
                setError("Invalid animation file.");
            }
        };

        loadSelectedAnimation();
    }, [selectedAnimation]);

    // Toggle Play/Pause for the animation
    const handlePlayPause = () => {
        setIsPaused((prev) => {
            const nextState = !prev;
            nextState ? playerRef.current?.pause() : playerRef.current?.play();
            return nextState;
        });
    };

    return (
        <div style={{ marginBottom: "50px" }}>
            {/* Slogan above the animation */}
            <h2>Empowering Connections Between Clients and Carriers.</h2>

            {/* Animation selection dropdown (only in development mode) */}
            {!import.meta.env.PROD && (
                <>
                    <label htmlFor="animationSelect">Select Animation:</label>
                    <select
                        id="animationSelect"
                        value={selectedAnimation || ''}
                        onChange={(e) => setSelectedAnimation(e.target.value)}
                    >
                        {animationList.map((file, index) => (
                            <option key={index} value={file}>
                                {file}
                            </option>
                        ))}
                    </select>
                </>
            )}

            {/* Render the player or display error message */}
            {error ? (
                <p style={{ color: 'red' }}>{error}</p>
            ) : (
                <DualPlayer
                    ref={playerRef}
                    animationType={animationType}
                    animationData={animationType === "lottie" ? animationData : undefined}
                    svgPath={animationType === "svg" ? `/animations/${selectedAnimation}` : undefined}
                    isPaused={isPaused}
                />
            )}

            {/* Control buttons for play/pause */}
            <div>
                <button onClick={handlePlayPause}>{isPaused ? "Play" : "Pause"}</button>
            </div>
        </div>
    );
};

export default Banner;
