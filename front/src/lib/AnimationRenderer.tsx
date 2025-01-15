// File: src/lib/SendDeliverAnimation.tsx
// Last change: Improved spacing and corrected SVG transformations for accuracy.

import React, { useEffect, useRef, useState } from 'react';

interface SendDeliverAnimationProps {
  width?: number;
  height?: number;
  duration?: number;
  onAnimationComplete?: () => void;
  sendColor?: string;
  deliverColor?: string;
}

const Letters: Record<string, string> = {
  S: "M53.52,-70.52 L53.52,-60.89 L36.38,-41.70 L6.89,-13.38 L27.48,-33.50 Z",
  E: "M9.81,-72.91 L55.91,-72.91 L55.91,-64.59 L19.67,-64.59 L19.67,-43.02 L54.39,-43.02 L54.39,-34.72 L19.67,-34.72 L19.67,-8.30 L56.78,-8.30 L56.78,-0.00 L9.81,-0.00 Z",
  N: "M9.81,-72.91 L23.09,-72.91 L55.42,-11.92 L55.42,-72.91 L64.98,-72.91 L64.98,-0.00 L51.70,-0.00 Z",
  D: "M19.67,-64.80 L19.67,-8.11 L31.59,-8.11 L19.67,-64.80 Z M9.81,-72.91 L30.08,-72.91 L9.81,-0.00 L9.81,-72.91 Z",
  L: "M9.81,-72.91 L19.67,-72.91 L19.67,-8.30 L55.17,-8.30 L55.17,-0.00 L9.81,-0.00 Z",
  I: "M9.81,-72.91 L19.67,-72.91 L19.67,-0.00 L9.81,-0.00 Z",
  V: "M28.61,-0.00 L0.78,-72.91 L11.08,-72.91 L34.19,-11.53 L57.33,-72.91 L67.58,-72.91 L39.80,-0.00 L28.61,-0.00 Z",
  R: "M44.39,-34.19 L66.61,-0.00 L56.00,-0.00 L46.69,-18.70 L19.67,-30.81 L19.67,-0.00 L9.81,-0.00 Z"
};

const SendDeliverAnimation: React.FC<SendDeliverAnimationProps> = ({
  width = 900,
  height = 100,
  duration = 3000,
  onAnimationComplete,
  sendColor = "#ff00ff",
  deliverColor = "#80ff00"
}) => {
  const [sendPosition, setSendPosition] = useState(-200);
  const [deliverPosition, setDeliverPosition] = useState(800);
  const animationRef = useRef<number>();

  useEffect(() => {
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      const easeInOutCubic = (t: number) => 
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      
      const easedProgress = easeInOutCubic(progress);

      setSendPosition(-200 + (500 * easedProgress));
      setDeliverPosition(800 - (380 * easedProgress));

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else if (onAnimationComplete) {
        onAnimationComplete();
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [duration, onAnimationComplete]);

  const letterSpacing = 80; // Increased spacing for better visual separation
  const baselineOffset = -20; // Adjusting baseline alignment

  return (
    <svg viewBox="0 0 900 200" width={width} height={height}>
      <defs>
        <linearGradient id="sendGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={sendColor} />
          <stop offset="100%" stopColor={sendColor} />
        </linearGradient>
        <linearGradient id="deliverGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={deliverColor} />
          <stop offset="100%" stopColor={deliverColor} />
        </linearGradient>
      </defs>

      {/* SEND Animation */}
      <g transform={`translate(${sendPosition}, ${baselineOffset})`}>
        {"SEND".split('').map((letter, idx) => (
          <path
            key={idx}
            d={Letters[letter as keyof typeof Letters]}
            fill="url(#sendGradient)"
            transform={`translate(${letterSpacing * idx}, 0)`}
          />
        ))}
      </g>

      {/* DELIVER Animation */}
      <g transform={`translate(${deliverPosition}, ${baselineOffset})`}>
        {"DELIVER".split('').map((letter, idx) => (
          <path
            key={idx}
            d={Letters[letter as keyof typeof Letters]}
            fill="url(#deliverGradient)"
            transform={`translate(${letterSpacing * idx}, 0)`}
          />
        ))}
      </g>
    </svg>
  );
};

export default SendDeliverAnimation;
