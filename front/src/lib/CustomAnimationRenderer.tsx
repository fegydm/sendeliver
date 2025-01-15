// File: src/lib/CustomAnimationRenderer.tsx

import React, { useEffect, useState, useRef } from 'react';

interface AnimationData {
  v: string;
  fr: number;
  ip: number;
  op: number;
  w: number;
  h: number;
  nm: string;
  layers: {
    ty: number;
    nm: string;
    t: {
      d: {
        k: {
          s: {
            f: string;
            s: number;
            t: string;
            j: number;
            fc: number[];
          };
          t: number;
        }[];
      };
    };
    p: { a: number; k: number[] };
    a: { a: number; k: number[] };
    s: { a: number; k: number[] };
    ks: {
      o: { a: number; k: number };
      r: { a: number; k: number };
      p: {
        a: number;
        k: {
          t: number;
          s: number[];
          e: number[];
          i: { x: number; y: number };
          o: { x: number; y: number };
        }[];
      };
      a: { a: number; k: number[] };
      s: { a: number; k: number[] };
    };
  }[];
}

interface CustomAnimationRendererProps {
  animationData: AnimationData;
}

const CustomAnimationRenderer: React.FC<CustomAnimationRendererProps> = ({ animationData }) => {
  const [styles, setStyles] = useState<React.CSSProperties[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    // Initialize styles for each layer
    const initialStyles = animationData.layers.map((layer) => {
      const startPosition = layer.ks.p.k[0].s;
      return {
        opacity: 0,
        transform: `translate(${startPosition[0]}px, ${startPosition[1]}px)`,
        color: `rgb(${layer.t.d.k[0].s.fc.map((c) => Math.round(c * 255)).join(',')})`,
        fontSize: `${layer.t.d.k[0].s.s}px`,
        fontFamily: layer.t.d.k[0].s.f,
        position: 'absolute' as const,
        whiteSpace: 'nowrap',
      };
    });
    setStyles(initialStyles);

    // Start animation
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;

      const progress = timestamp - startTimeRef.current;
      const duration = (animationData.op - animationData.ip) / animationData.fr * 1000; // Prevod na milisekundy

      const newStyles = animationData.layers.map((layer, index) => {
        const { s: startPosition, e: endPosition } = layer.ks.p.k[0];
        const percentage = Math.min(progress / duration, 1);

        const currentX = startPosition[0] + (endPosition[0] - startPosition[0]) * percentage;
        const currentY = startPosition[1] + (endPosition[1] - startPosition[1]) * percentage;

        return {
          ...initialStyles[index], // Zachovaj pôvodné štýly
          opacity: percentage,
          transform: `translate(${currentX}px, ${currentY}px)`,
        };
      });

      setStyles(newStyles);

      if (progress < duration) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animationData]);

  return (
    <div style={{ position: 'relative', width: animationData.w, height: animationData.h }}>
      {animationData.layers.map((layer, index) => (
        <div key={index} style={styles[index]}>
          {layer.t.d.k[0].s.t}
        </div>
      ))}
    </div>
  );
};

export default CustomAnimationRenderer;