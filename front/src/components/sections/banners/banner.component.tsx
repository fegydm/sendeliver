// File: front/src/components/sections/banners/banner.component.tsx
// Last change: No changes, handled in player component.

import { useState, useRef } from "react";
import DualLottiePlayer, { type DualLottiePlayerRef } from "@/components/elements/animation/dual-lottie-player.element";
import sendeliverTextAnimation from "@/assets/sendeliver-text.json";
import sendeliverText2Animation from "@/assets/sendeliver-text2.json";

interface LottieJSON {
    v: string;
    fr: number;
    ip: number;
    op: number;
    w: number;
    h: number;
    layers: any[];
}

const Banner = (): JSX.Element => {
    const [isPaused, setIsPaused] = useState(false);
    const [currentAnimation, setCurrentAnimation] = useState<LottieJSON>(sendeliverTextAnimation as LottieJSON);
    const lottieRef = useRef<DualLottiePlayerRef>(null);

    const handlePlayPause = () => {
        setIsPaused((prev) => !prev);
        isPaused ? lottieRef.current?.play() : lottieRef.current?.pause();
    };

    const handleSwitchAnimation = () => {
        setCurrentAnimation(prev =>
            prev === sendeliverTextAnimation ? sendeliverText2Animation : sendeliverTextAnimation
        );
    };

    return (
        <main>
            <section className="banner">
                <h1 className="banner-title">Empowering connections between clients and carriers.</h1>
                <DualLottiePlayer
                    ref={lottieRef}
                    animationData={currentAnimation}
                    className="banner-animation"
                    isPaused={isPaused}
                />
                <div className="banner-controls">
                    <button onClick={handlePlayPause}>
                        {isPaused ? "Play" : "Pause"}
                    </button>
                    <button onClick={handleSwitchAnimation}>
                        Switch Animation
                    </button>
                </div>
            </section>
        </main>
    );
};

export default Banner;
