// File: src/pages/test1/index.tsx
// Last change: Fixed dynamic animation loading and Lottie initialization

import React, { useRef, useState, useEffect } from 'react';
import DualPlayer, { type DualPlayerRef } from "@/components/elements/animation/dual-player.element";

// Load animations using Vite's dynamic import
const animations = import.meta.glob(
  '/public/animations/*.{json,svg}',
  { eager: true }  // Important: This loads the files eagerly
);

const Test1Page: React.FC = () => {
    const playerRef = useRef<DualPlayerRef>(null);
    const [isPaused, setIsPaused] = useState(false);
    const [selectedAnimation, setSelectedAnimation] = useState<string | null>(null);
    const [animationList, setAnimationList] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Initialize animation list
    useEffect(() => {
        try {
            const paths = Object.keys(animations)
                .map(path => path.replace('/public/animations/', ''))
                .sort();

            if (paths.length === 0) {
                setError('No animations found in the animations directory');
                return;
            }

            setAnimationList(paths);
            setSelectedAnimation(paths[0]);
            setError(null);
        } catch (err) {
            console.error('Failed to load animation list:', err);
            setError('Failed to load animations');
        }
    }, []);

    // Handle play/pause
    const handlePlayPause = () => {
        setIsPaused(prev => {
            const nextState = !prev;
            if (nextState) {
                playerRef.current?.pause();
            } else {
                playerRef.current?.play();
            }
            return nextState;
        });
    };

    // Get full path for selected animation
    const getAnimationPath = (filename: string | null) => {
        if (!filename) return null;
        return `/animations/${filename}`;
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1 style={{ marginBottom: '20px' }}>
                Test 1 - Dynamic Animation Player
            </h1>
            
            {/* Animation selector */}
            <div style={{ marginBottom: '20px' }}>
                <label htmlFor="animationSelect" style={{ marginRight: '10px' }}>
                    Select Animation:
                </label>
                <select
                    id="animationSelect"
                    value={selectedAnimation || ''}
                    onChange={(e) => setSelectedAnimation(e.target.value)}
                    style={{ padding: '5px' }}
                >
                    {animationList.map((file) => (
                        <option key={file} value={file}>
                            {file}
                        </option>
                    ))}
                </select>
            </div>

            {error && (
                <div style={{ color: 'red', marginBottom: '20px' }}>
                    {error}
                </div>
            )}

            {selectedAnimation && (
                <div>
                    <p style={{ marginBottom: '10px' }}>
                        Current Animation: <strong>{selectedAnimation}</strong>
                    </p>

                    <div style={{ marginBottom: '20px' }}>
                        <DualPlayer
                            ref={playerRef}
                            animationPath={getAnimationPath(selectedAnimation)}
                            isPaused={isPaused}
                        />
                    </div>

                    <button 
                        onClick={handlePlayPause}
                        style={{
                            padding: '8px 16px',
                            cursor: 'pointer'
                        }}
                    >
                        {isPaused ? "Play" : "Pause"}
                    </button>
                </div>
            )}
        </div>
    );
};

export default Test1Page;