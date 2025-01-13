// File: front/src/components/sections/banners/banner.component.tsx
// Last change: Restored the original banner-title and corrected fallback handling.

import { useState, useRef, useEffect } from "react";
import DualLottiePlayer, { type DualLottiePlayerRef } from "@/components/elements/animation/dual-lottie-player.element";
import Animation1 from "@/assets/sendeliver-text.json";
import Animation2 from "@/assets/sendeliver-text2.json";

// ✅ Lottie format detection (unchanged)
const isLottieFormat = (data: any): boolean => {
    const requiredFields = ["v", "fr", "ip", "op", "w", "h", "layers"];
    return (
        data &&
        typeof data === 'object' &&
        requiredFields.every(field => field in data)
    );
};

const Banner = (): JSX.Element => {
    const [isPaused, setIsPaused] = useState(false);
    const [animations] = useState([Animation1, Animation2]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const lottieRef = useRef<DualLottiePlayerRef>(null);

    useEffect(() => {
        console.group("🎬 Animation Format Check");
        console.log("Animation 1:", isLottieFormat(Animation1));
        console.log("Animation 2:", isLottieFormat(Animation2));
        console.groupEnd();
    }, []);

    const handlePlayPause = () => {
        setIsPaused((prev) => {
            const nextState = !prev;
            nextState ? lottieRef.current?.pause() : lottieRef.current?.play();
            return nextState;
        });
    };

    const handleSwitchAnimation = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % animations.length);
        console.log(`🔄 Switched to animation index: ${currentIndex + 1}`);
    };

    return (
        <main className="banner">
            
            <h1 className="banner-title">Empowering connections between clients and carriers.</h1>
            
            <div className="banner-animation">
                <DualLottiePlayer
                    ref={lottieRef}
                    animationData={animations[currentIndex]}
                    isPaused={isPaused}
                />
            </div>

            <div className="banner-controls">
                <button onClick={handlePlayPause}>
                    {isPaused ? "Play" : "Pause"}
                </button>
                <button onClick={handleSwitchAnimation}>
                    Switch Animation
                </button>
            </div>
        </main>
    );
};

export default Banner;
