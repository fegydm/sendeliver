// File: front/src/components/sections/banners/banner.component.tsx
// Last change: Cleaned up structure and improved class naming consistency.

import { useState, useRef } from "react";
import DualLottiePlayer, { type DualLottiePlayerRef } from "@/components/elements/animation/dual-lottie-player.element";
import Animation1 from "@/assets/sendeliver-text.json";
import Animation2 from "@/assets/sendeliver-text2.json";
import { BANNER_HEIGHT } from "@/constants/layout.constants";

const Banner = (): JSX.Element => {
    const [isPaused, setIsPaused] = useState(false);
    const [animations] = useState([Animation1, Animation2]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const lottieRef = useRef<DualLottiePlayerRef>(null);

    const handlePlayPause = () => {
        setIsPaused((prev) => {
            const nextState = !prev;
            nextState ? lottieRef.current?.pause() : lottieRef.current?.play();
            return nextState;
        });
    };

    const handleSwitchAnimation = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % animations.length);
    };

    return (
        <div className="banner">
            {/* Banner Title Section */}
            <div className="banner-title">
                <h2>Empowering connections between clients and carriers.</h2>
            </div>

            {/* Banner Container for Animation */}
            <div className="banner-container">
                <DualLottiePlayer
                    ref={lottieRef}
                    animationData={animations[currentIndex]}
                    isPaused={isPaused}
                />
            </div>

            {/* Banner Control Section */}
            <div className="banner-control">
                <button onClick={handlePlayPause}>
                    {isPaused ? "Play" : "Pause"}
                </button>
                <button onClick={handleSwitchAnimation}>
                    Switch Animation
                </button>
            </div>
        </div>
    );
};

export default Banner;
