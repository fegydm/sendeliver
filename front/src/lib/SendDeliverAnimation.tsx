// File: src/lib/SendDeliverAnimation.tsx
// Last change: Added `fill` and `stroke` props for better customization.

import React, { useEffect, useRef, useState } from 'react';
import Letters from '@/constants/letterPaths';

interface SendDeliverAnimationProps {
  width?: number;
  height?: number;
  duration?: number;
  onAnimationComplete?: () => void;
  sendColor?: string;
  deliverColor?: string;
  fill?: string; // Added fill prop
  stroke?: string; // Added stroke prop
  strokeWidth?: number; // Added stroke width prop
}

const SendDeliverAnimation: React.FC<SendDeliverAnimationProps> = ({
  width = 900,
  height = 200,
  duration = 3000,
  onAnimationComplete,
  sendColor = "#ff00ff",
  deliverColor = "#80ff00",
  fill,
  stroke,
  strokeWidth
}) => {
  const [sendPosition, setSendPosition] = useState(0);  
  const [deliverPosition, setDeliverPosition] = useState(800);
  const [sendOpacity, setSendOpacity] = useState(0); 
  const [deliverOpacity, setDeliverOpacity] = useState(0); 
  const animationRef = useRef<number>();

  const initialOffset = 600; 
  const finalOffset = initialOffset * 0.5;
  const defaultLetterSpacing = 40;
  const reducedLetterSpacing = 37;
  const verticalOffset = 50;

  useEffect(() => {
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeInOutCubic = (t: number) => 
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const easedProgress = easeInOutCubic(progress);

      setSendPosition(finalOffset * easedProgress);
      setSendOpacity(easedProgress);

      if (progress > 0.3) {
        setDeliverPosition(800 - (380 * (progress - 0.3) * (10 / 7)));
        setDeliverOpacity((progress - 0.3) * (10 / 7));
      }

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

  return (
    <svg viewBox="0 0 900 250" width={width} height={height}>
      {/* DELIVER Animation */}
      <g transform={`translate(${deliverPosition}, ${verticalOffset})`} style={{ opacity: deliverOpacity }}>
        {"DELIVER".split('').map((letter, idx, array) => (
          <path
            key={idx}
            d={Letters[letter as keyof typeof Letters]}
            fill={fill || "url(#deliverGradient)"}
            stroke={stroke}
            strokeWidth={strokeWidth}
            transform={`translate(${idx > 0 && array[idx - 1] === 'I' && letter === 'V'
              ? reducedLetterSpacing * idx
              : defaultLetterSpacing * idx}, 0)`}
          />
        ))}
      </g>

      {/* SEND Animation */}
      <g transform={`translate(${sendPosition}, ${verticalOffset})`} style={{ opacity: sendOpacity }}>
        {"SEND".split('').map((letter, idx) => (
          <path
            key={idx}
            d={Letters[letter as keyof typeof Letters]}
            fill={fill || "url(#sendGradient)"}
            stroke={stroke}
            strokeWidth={strokeWidth}
            transform={`translate(${defaultLetterSpacing * idx}, 0)`}
          />
        ))}
      </g>
    </svg>
  );
};

export default SendDeliverAnimation;
