// File: src/pages/test1/index.tsx
// Last change: Added dropdown for selecting animations from the public folder.

import React, { useRef, useState, useEffect } from 'react';
import DualLottiePlayer, { type DualLottiePlayerRef, AnimationType } from "@/components/elements/animation/dual-lottie-player.element";

// Kontrola platnosti Lottie JSON súboru
const isValidLottie = (data: any): boolean =>
    data?.v && Array.isArray(data.layers) && data.layers.length > 0;

// Automatické načítanie animácií z priečinka
const animations = import.meta.glob('/public/animations/*.{json,svg}');

const Test1Page: React.FC = () => {
    const playerRef = useRef<DualLottiePlayerRef>(null);
    const [isPaused, setIsPaused] = useState(false);
    const [animationData, setAnimationData] = useState<any>(null);
    const [animationType, setAnimationType] = useState<AnimationType>("lottie");
    const [selectedAnimation, setSelectedAnimation] = useState<string | null>(null);
    const [animationList, setAnimationList] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Načíta zoznam animácií pri načítaní stránky
    useEffect(() => {
        const loadAnimationList = async () => {
            const filePaths = Object.keys(animations).map(file => file.replace('/public/animations/', '')).sort();
            if (filePaths.length > 0) {
                setAnimationList(filePaths);
                setSelectedAnimation(filePaths[0]); // Predvolene zvoli prvú animáciu
            } else {
                console.warn("No animations found.");
                setError("No animations available.");
            }
        };
        loadAnimationList();
    }, []);

    // Načíta vybranú animáciu z dropdownu
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
                    throw new Error("Invalid Lottie animation data.");
                }
            } catch (error) {
                console.error("Error loading animation:", error);
                setError("Failed to load a valid animation file.");
            }
        };

        if (selectedAnimation?.endsWith('.json')) {
            loadSelectedAnimation();
        } else {
            setAnimationType("svg");
            setAnimationData(null);
            setError(null);
        }
    }, [selectedAnimation]);

    const handlePlayPause = () => {
        setIsPaused((prev) => {
            const nextState = !prev;
            nextState ? playerRef.current?.pause() : playerRef.current?.play();
            return nextState;
        });
    };

    return (
        <div>
            <h1>Test 1 - Dynamic Animation Player</h1>
            
            {/* Dropdown na výber animácie */}
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

            <p>Player Type: <strong>{animationType.toUpperCase()}</strong></p>
            <p>Selected Animation: <strong>{selectedAnimation || "None"}</strong></p>

            {/* Kontrola chýb */}
            {error ? (
                <p style={{ color: 'red' }}>{error}</p>
            ) : (
                <DualLottiePlayer
                    ref={playerRef}
                    animationType={animationType}
                    animationData={animationType === "lottie" ? animationData : undefined}
                    svgPath={animationType === "svg" ? `/animations/${selectedAnimation}` : undefined}
                    isPaused={isPaused}
                />
            )}

            {/* Tlačidlo pre pauzu */}
            <button onClick={handlePlayPause}>
                {isPaused ? "Play" : "Pause"}
            </button>
        </div>
    );
};

export default Test1Page;
