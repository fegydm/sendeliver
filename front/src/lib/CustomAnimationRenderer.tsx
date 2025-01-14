// File: src/lib/CustomAnimationRenderer.tsx

import React, { useEffect, useState } from 'react';

// Define the structure of the animation data
interface AnimationData {
  v: string; // Lottie version
  fr: number; // Frame rate
  ip: number; // Initial frame
  op: number; // End frame
  w: number; // Width
  h: number; // Height
  nm: string; // Name
  layers: {
    ty: number; // Layer type (5 = text)
    nm: string; // Layer name
    t: {
      d: {
        k: {
          s: {
            f: string; // Font
            s: number; // Font size
            t: string; // Text
            j: number; // Justification
            fc: number[]; // Text color (RGB)
          };
          t: number; // Start time
        }[];
      };
    };
    p: { a: number; k: number[] }; // Position
    a: { a: number; k: number[] }; // Anchor point
    s: { a: number; k: number[] }; // Scale
    ks: {
      o: { a: number; k: number }; // Opacity
      r: { a: number; k: number }; // Rotation
      p: {
        a: number; // Position animation
        k: {
          t: number; // Time
          s: number[]; // Start position
          e: number[]; // End position
          i: { x: number; y: number }; // Bezier in
          o: { x: number; y: number }; // Bezier out
        }[];
      };
      a: { a: number; k: number[] }; // Anchor point
      s: { a: number; k: number[] }; // Scale
    };
  }[];
}

// Props for the renderer
interface CustomAnimationRendererProps {
  animationData: AnimationData;
}

const CustomAnimationRenderer: React.FC<CustomAnimationRendererProps> = ({ animationData }) => {
  const [styles, setStyles] = useState<React.CSSProperties[]>([]);

  useEffect(() => {
    // Initialize styles for each layer
    const initialStyles = animationData.layers.map((layer) => {
      const startPosition = layer.ks.p.k[0].s;
      return {
        opacity: 0,
        transform: `translate(${startPosition[0]}px, ${startPosition[1]}px)`,
        color: `rgb(${layer.t.d.k[0].s.fc.join(',')})`,
        fontSize: `${layer.t.d.k[0].s.s}px`,
        position: 'absolute' as const, // Explicitly set the type to 'absolute'
      };
    });
    setStyles(initialStyles);

    // Animate each layer
    animationData.layers.forEach((layer, index) => {
      const { s: startPosition, e: endPosition } = layer.ks.p.k[0];
      const duration = (animationData.op - animationData.ip) / animationData.fr;

      setTimeout(() => {
        setStyles((prevStyles) => {
          const updatedStyles = [...prevStyles];
          updatedStyles[index] = {
            ...updatedStyles[index],
            opacity: 1,
            transform: `translate(${endPosition[0]}px, ${endPosition[1]}px)`,
            transition: `opacity ${duration}ms, transform ${duration}ms`,
          };
          return updatedStyles;
        });
      }, layer.ks.p.k[0].t);
    });
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