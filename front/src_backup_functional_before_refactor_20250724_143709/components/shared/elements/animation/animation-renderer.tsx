// File: src/components/elements/animation/animation-renderer.tsx
// Last change: Added SVG rendering logic.

import React, { useEffect, useRef } from "react";

interface AnimationRendererProps {
    path: string;
    isPaused: boolean;
}

const AnimationRenderer: React.FC<AnimationRendererProps> = ({ path, isPaused }) => {
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        let svgElement: SVGSVGElement | null = null;

        const loadSVG = async () => {
            if (!path || !containerRef.current) return;

            try {
                const response = await fetch(path);
                if (!response.ok) throw new Error("Failed to fetch SVG file.");

                const svgText = await response.text();
                const parser = new DOMParser();
                const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
                svgElement = svgDoc.querySelector("svg");

                if (svgElement) {
                    svgElement.style.width = "100%";
                    svgElement.style.height = "100%";
                    containerRef.current.innerHTML = ""; // Clear previous content
                    containerRef.current.appendChild(svgElement);
                }
            } catch (error) {
                console.error("Error loading SVG:", error);
            }
        };

        loadSVG();

        return () => {
            if (svgElement && containerRef.current?.contains(svgElement)) {
                containerRef.current.removeChild(svgElement);
            }
        };
    }, [path]);

    useEffect(() => {
        if (!containerRef.current) return;

        const svgElement = containerRef.current.querySelector("svg");
        if (!svgElement) return;

        if (isPaused) {
            svgElement.style.animationPlayState = "paused";
        } else {
            svgElement.style.animationPlayState = "running";
        }
    }, [isPaused]);

    return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
};

export default AnimationRenderer;
