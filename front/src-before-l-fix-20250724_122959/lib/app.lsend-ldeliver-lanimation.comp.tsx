// File: src/lib/app.lsend-ldeliver-lanimation.comp.tsx
// Last change: Fixed animation timing, added error handling, and improved performance

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Letters, { LetterKey } from '@/constants/letterPaths';

// TypeScript nás upozorní ak použijeme neplatné písmeno
const letter: LetterKey = 'S'; // OK
const path = Letters[letter];   // Typovo bezpečné

interface SendDeliverAnimationProps {
  onAnimationComplete?: () => void;
  onExport?: (svgContent: string) => void;
}

const SendDeliverAnimation: React.FC<sendDeliverAnimationProps> = ({
  onAnimationComplete,
  onExport
}) => {
  // Constants
  const ANIMATION_CONFIG = {
    width: 900,
    height: 200,
    duration: 3000,
    fill: "url(#gradient)",
    stroke: "#000",
    strokeWidth: 2,
    initialOffset: 600,
    defaultLetterSpacing: 40,
    reducedLetterSpacing: 37,
    verticalOffset: 50,
    deliverStartDelay: 0.3,
  } as const;

  // State
  const [sendPosition, setSendPosition] = useState(0);
  const [deliverPosition, setDeliverPosition] = useState(800);
  const [sendOpacity, setSendOpacity] = useState(0);
  const [deliverOpacity, setDeliverOpacity] = useState(0);
  
  // Refs
  const animationRef = useRef<number>();
  const svgRef = useRef<sVGSVGElement>(null);
  const startTimeRef = useRef<number | null>(null);

  // Memoized calculations
  const finalOffset = ANIMATION_CONFIG.initialOffset * 0.5;

  // Animation easing function
  const easeInOutCubic = useCallback((t: number) => 
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  , []);

  // Letter validation function
  const validateLetter = useCallback((letter: string): string | null => {
    const pathData = Letters[letter as keyof typeof Letters];
    if (!pathData) {
      console.warn(`Letter "${letter}" is missing in Letters object.`);
      return null;
    }
    return pathData;
  }, []);

  // Animation frame handler
  const animate = useCallback((timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }

    const progress = Math.min(
      (timestamp - startTimeRef.current) / ANIMATION_CONFIG.duration,
      1
    );
    const easedProgress = easeInOutCubic(progress);

    // Update SEND animation
    setSendPosition(finalOffset * easedProgress);
    setSendOpacity(easedProgress);

    // Update DELIVER animation with delay
    if (progress > ANIMATION_CONFIG.deliverStartDelay) {
      const deliverProgress = (progress - ANIMATION_CONFIG.deliverStartDelay) * 
        (1 / (1 - ANIMATION_CONFIG.deliverStartDelay));
      setDeliverPosition(800 - (380 * deliverProgress));
      setDeliverOpacity(Math.min(deliverProgress, 1));
    }

    // Handle animation completion
    if (progress < 1) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (onAnimationComplete) {
        onAnimationComplete();
      }

      if (onExport && svgRef.current) {
        try {
          const svgContent = svgRef.current.outerHTML;
          onExport(svgContent);
        } catch (error) {
          console.error('Failed to export SVG content:', error);
        }
      }
    }
  }, [finalOffset, easeInOutCubic, onAnimationComplete, onExport]);

  // Setup and cleanup animation
  useEffect(() => {
    startTimeRef.current = null;
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate]);

  return (
    <svg 
      ref={svgRef} 
      viewBox={`0 0 ${ANIMATION_CONFIG.width} 250`}
      width={ANIMATION_CONFIG.width}
      height={ANIMATION_CONFIG.height}
      aria-label="SendDeliver Animation"
    >
      {/* Define gradient if needed */}
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>

      {/* DELIVER Animation */}
      <g 
        transform={`translate(${deliverPosition}, ${ANIMATION_CONFIG.verticalOffset})`}
        style={{ opacity: deliverOpacity }}
      >
        {"DELIVER".split('').map((letter, idx, array) => {
          const pathData = validateLetter(letter);
          if (!pathData) return null;
          
          const xOffset = idx > 0 && array[idx - 1] === 'I' && letter === 'V'
            ? ANIMATION_CONFIG.reducedLetterSpacing * idx
            : ANIMATION_CONFIG.defaultLetterSpacing * idx;

          return (
            <path
              key={`deliver-${letter}-${idx}`}
              d={pathData}
              fill={ANIMATION_CONFIG.fill}
              stroke={ANIMATION_CONFIG.stroke}
              strokeWidth={ANIMATION_CONFIG.strokeWidth}
              transform={`translate(${xOffset}, 0)`}
            />
          );
        })}
      </g>

      {/* SEND Animation */}
      <g 
        transform={`translate(${sendPosition}, ${ANIMATION_CONFIG.verticalOffset})`}
        style={{ opacity: sendOpacity }}
      >
        {"SEND".split('').map((letter, idx) => {
          const pathData = validateLetter(letter);
          if (!pathData) return null;

          return (
            <path
              key={`send-${letter}-${idx}`}
              d={pathData}
              fill={ANIMATION_CONFIG.fill}
              stroke={ANIMATION_CONFIG.stroke}
              strokeWidth={ANIMATION_CONFIG.strokeWidth}
              transform={`translate(${ANIMATION_CONFIG.defaultLetterSpacing * idx}, 0)`}
            />
          );
        })}
      </g>
    </svg>
  );
};

export default SendDeliverAnimation;