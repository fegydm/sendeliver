// File: src/components/elements/animation/dual-lottie-player.element.tsx
// Last change: Fixed TypeScript typing issue and ensured proper export of DualLottiePlayerRef.

import { useRef, useImperativeHandle, forwardRef } from 'react';
import Lottie from 'lottie-react';
import SendDeliverAnimation from '../../../lib/SendDeliverAnimation';

export type AnimationType = "lottie" | "sendDeliver" | "svg";

export type DualLottiePlayerRef = {
    play: () => void;
    pause: () => void;
    stop: () => void;
};

interface DualLottiePlayerProps {
    animationType: AnimationType;
    animationData?: any;
    svgPath?: string;
    isPaused?: boolean;
}

// Fallback Lottie animation if data is invalid
const fallbackAnimation = {
    v: "5.7.4",
    fr: 30,
    ip: 0,
    op: 120,
    w: 500,
    h: 500,
    layers: [
        {
            ty: 4,
            shapes: [
                { ty: "sh", ks: { k: { i: [], o: [], v: [[250, 250]], c: true } } }
            ]
        }
    ]
};

const isValidLottie = (data: any): boolean =>
    data?.v && Array.isArray(data.layers) && data.layers.length > 0;

const DualLottiePlayer = forwardRef<DualLottiePlayerRef, DualLottiePlayerProps>(
    ({ animationData, animationType, svgPath, isPaused = false }, ref) => {
        const lottieRef = useRef<any>(null);

        useImperativeHandle(ref, () => ({
            play: () => lottieRef.current?.play(),
            pause: () => lottieRef.current?.pause(),
            stop: () => lottieRef.current?.stop()
        }));

        const isLottieFormat = animationType === "lottie";
        const isSvgFormat = animationType === "svg";

        return (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                {isLottieFormat && animationData ? (
                    <Lottie
                        lottieRef={lottieRef}
                        animationData={isValidLottie(animationData) ? animationData : fallbackAnimation}
                        loop
                        autoplay={!isPaused}
                    />
                ) : isSvgFormat && svgPath ? (
                    <object type="image/svg+xml" data={svgPath} width="100%" height="100%" />
                ) : (
                    <SendDeliverAnimation
                        width={300}
                        height={300}
                        sendColor="#ff00ff"
                        deliverColor="#80ff00"
                    />
                )}
            </div>
        );
    }
);

DualLottiePlayer.displayName = 'DualLottiePlayer';

export default DualLottiePlayer;
