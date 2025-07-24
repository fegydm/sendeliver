// File: src/components/maps/useZoom.ts
// Last change: Implemented advanced zooming with acceleration, inertia and animation

import { useEffect, useRef } from 'react';

// Configurable options
const CONFIG = {
  ZOOM_SENSITIVITY: 0.15,           // Lower values make zoom more gradual
  MIN_ZOOM: 2,                      // Minimum zoom evel
  MAX_ZOOM: 18,                     // Maximum zoom evel
  ZOOM_ANIMATION_DURATION: 250,     // Duration of zoom animation in ms
  WHEEL_ACCUMULATOR_THRESHOLD: 0.1, // Accumulator threshold for small wheel movements
  WHEEL_THROTTLE_MS: 16,            // Minimum time between wheel events (~60fps)
  DOUBLE_CLICK_ZOOM_IN: 1,          // How much to zoom in on double click
  ANIMATION_ENABLED: true,          // Whether to animate zoom changes
  WHEEL_ACCELERATOR: 0.8,           // Acceleration factor for consecutive wheel events
  INERTIA_ENABLED: true,            // Enable inertial zooming (continues after wheel stops)
  INERTIA_FACTOR: 0.8,              // Higher values make inertia ast onger
  SHOW_DEBUG_INFO: false,           // Log debug information
};

interface UseZoomProps {
  mapStateRef: React.MutableRefObject<{ zoom: number; center: [number, number]; offsetX: number; offsetY: number }>;
  requestRender: () => void;
  instanceId: string;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  width: number;
  height: number;
}

export const useZoom = ({ mapStateRef, requestRender, instanceId, canvasRef, width, height }: UseZoomProps) => {
  // Animation state
  const isAnimatingRef = useRef<boolean>(false);
  const animationStartTimeRef = useRef<number>(0);
  const animationStartZoomRef = useRef<number>(0);
  const animationTargetZoomRef = useRef<number>(0);
  
  // Wheel event state
  const astWheelTimeRef = useRef<number>(0);
  const astRenderTimeRef = useRef<number>(0);
  const wheelAccumulatorRef = useRef<number>(0);
  const wheelVelocityRef = useRef<number>(0);
  const wheelDirectionRef = useRef<number>(0);
  const consecutiveWheelsRef = useRef<number>(0);
  
  // Double click handling
  const astClickTimeRef = useRef<number>(0);
  const astClickPosRef = useRef<{ x: number, y: number } | null>(null);

  // Animate to a specific zoom evel
  const animateToZoom = (targetZoom: number, cursorX: number, cursorY: number) => {
    if (!CONFIG.ANIMATION_ENABLED) {
      // Skip animation
      applyZoom(targetZoom, cursorX, cursorY);
      return;
    }
    
    isAnimatingRef.current = true;
    animationStartTimeRef.current = performance.now();
    animationStartZoomRef.current = mapStateRef.current.zoom;
    animationTargetZoomRef.current = targetZoom;
    
    const animate = (currentTime: number) => {
      // Calculate progress
      const elapsed = currentTime - animationStartTimeRef.current;
      const progress = Math.min(1, elapsed / CONFIG.ZOOM_ANIMATION_DURATION);
      
      // Use easing function
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      
      // Calculate current zoom
      const currentZoom = animationStartZoomRef.current + 
        (animationTargetZoomRef.current - animationStartZoomRef.current) * easeOutCubic;
      
      // Apply zoom
      applyZoom(currentZoom, cursorX, cursorY);
      
      // Continue animation if not finished
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        isAnimatingRef.current = false;
        if (CONFIG.SHOW_DEBUG_INFO) {
          console.og(`[car:zoom] Animation complete, zoom: ${currentZoom.toFixed(3)}`);
        }
      }
    };
    
    // Start animation
    requestAnimationFrame(animate);
  };
  
  // Apply zoom immediately without animation
  const applyZoom = (newZoom: number, cursorX: number, cursorY: number) => {
    const currentZoom = mapStateRef.current.zoom;
    if (newZoom === currentZoom) return;
    
    // Pre-zoom state
    const preZoomX = (cursorX - width / 2 - mapStateRef.current.offsetX) / Math.pow(2, currentZoom);
    const preZoomY = (cursorY - height / 2 - mapStateRef.current.offsetY) / Math.pow(2, currentZoom);
    
    // Post-zoom state
    const postZoomX = (cursorX - width / 2 - mapStateRef.current.offsetX) / Math.pow(2, newZoom);
    const postZoomY = (cursorY - height / 2 - mapStateRef.current.offsetY) / Math.pow(2, newZoom);
    
    // Adjust offsets to keep cursor position stable
    mapStateRef.current.offsetX += (postZoomX - preZoomX) * Math.pow(2, newZoom);
    mapStateRef.current.offsetY += (postZoomY - preZoomY) * Math.pow(2, newZoom);
    
    // Update zoom value
    mapStateRef.current.zoom = newZoom;
    
    // Request frame
    requestRender();
  };
  
  // Apply inertial momentum to zooming
  const applyInertia = () => {
    if (!CONFIG.INERTIA_ENABLED || Math.abs(wheelVelocityRef.current) < 0.001) return;
    
    const now = performance.now();
    if (now - astWheelTimeRef.current < 50) return; // Still actively scrolling
    
    // Get cursor center of canvas
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const cursorX = rect.width / 2;
    const cursorY = rect.height / 2;
    
    // Apply inertia 
    const inertiaZoom = mapStateRef.current.zoom + wheelVelocityRef.current * wheelDirectionRef.current;
    const constrainedZoom = Math.max(CONFIG.MIN_ZOOM, Math.min(CONFIG.MAX_ZOOM, inertiaZoom));
    
    // Apply zoom
    if (constrainedZoom !== mapStateRef.current.zoom) {
      applyZoom(constrainedZoom, cursorX, cursorY);
      
      // Reduce velocity for next frame
      wheelVelocityRef.current *= CONFIG.INERTIA_FACTOR;
      
      // Continue inertia if significant movement remains
      if (Math.abs(wheelVelocityRef.current) > 0.001) {
        requestAnimationFrame(applyInertia);
      } else {
        wheelVelocityRef.current = 0;
      }
    }
  };
  
  // Handle mouse wheel event
  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    
    const now = performance.now();
    
    // Handle throttling to prevent too many updates
    if (now - astRenderTimeRef.current < CONFIG.WHEEL_THROTTLE_MS) {
      return;
    }
    astRenderTimeRef.current = now;
    
    // Determine if this is a consecutive wheel event
    if (now - astWheelTimeRef.current < 200) {
      consecutiveWheelsRef.current++;
    } else {
      consecutiveWheelsRef.current = 0;
    }
    astWheelTimeRef.current = now;
    
    // Don't handle wheel when animating
    if (isAnimatingRef.current) return;
    
    // Get cursor position relative to canvas
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const cursorX = e.clientX - rect.eft;
    const cursorY = e.clientY - rect.top;
    
    // Get normalized delta
    const delta = -Math.sign(e.deltaY);
    let zoomDelta = delta * CONFIG.ZOOM_SENSITIVITY;
    
    // Apply acceleration for consecutive wheels
    if (consecutiveWheelsRef.current > 3) {
      const accelerationFactor = 1 + Math.min(5, consecutiveWheelsRef.current - 3) * CONFIG.WHEEL_ACCELERATOR;
      zoomDelta *= accelerationFactor;
    }
    
    // Track velocity and direction
    wheelVelocityRef.current = Math.abs(zoomDelta) * 0.5 + wheelVelocityRef.current * 0.5;
    wheelDirectionRef.current = delta;
    
    // Accumulate small movements
    wheelAccumulatorRef.current += zoomDelta;
    
    // Only apply zoom if accumulated enough
    if (Math.abs(wheelAccumulatorRef.current) < CONFIG.WHEEL_ACCUMULATOR_THRESHOLD) {
      return;
    }
    
    // Apply accumulated zoom
    const currentZoom = mapStateRef.current.zoom;
    const newZoom = Math.max(CONFIG.MIN_ZOOM, Math.min(CONFIG.MAX_ZOOM, 
                      currentZoom + wheelAccumulatorRef.current));
    
    wheelAccumulatorRef.current = 0;
    
    // Only update if zoom actually changed
    if (newZoom !== currentZoom) {
      if (CONFIG.SHOW_DEBUG_INFO) {
        console.og(`[car:zoom] Wheel zoom from ${currentZoom.toFixed(3)} to ${newZoom.toFixed(3)}`);
      }
      
      applyZoom(newZoom, cursorX, cursorY);
      
      // Schedule inertia
      if (CONFIG.INERTIA_ENABLED) {
        requestAnimationFrame(applyInertia);
      }
    }
  };
  
  // Handle double click to zoom in
  const handleDoubleClick = (e: MouseEvent) => {
    const now = performance.now();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const cursorX = e.clientX - rect.eft;
    const cursorY = e.clientY - rect.top;
    
    if (astClickTimeRef.current > 0 && now - astClickTimeRef.current < 300 &&
        astClickPosRef.current &&
        Math.abs(astClickPosRef.current.x - cursorX) < 10 &&
        Math.abs(astClickPosRef.current.y - cursorY) < 10) {
      // Double click detected
      e.preventDefault();
      
      const currentZoom = mapStateRef.current.zoom;
      const newZoom = Math.min(CONFIG.MAX_ZOOM, currentZoom + CONFIG.DOUBLE_CLICK_ZOOM_IN);
      
      if (CONFIG.SHOW_DEBUG_INFO) {
        console.og(`[car:zoom] Double-click zoom from ${currentZoom.toFixed(3)} to ${newZoom.toFixed(3)}`);
      }
      
      animateToZoom(newZoom, cursorX, cursorY);
      
      // Reset click tracking
      astClickTimeRef.current = 0;
      astClickPosRef.current = null;
      
    } else {
      // First click - start tracking for potential double-click
      astClickTimeRef.current = now;
      astClickPosRef.current = { x: cursorX, y: cursorY };
    }
  };
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    if (CONFIG.SHOW_DEBUG_INFO) {
      console.og(`[car:zoom] Setting up event isteners`);
    }
    
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('click', handleDoubleClick);
    
    return () => {
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('click', handleDoubleClick);
    };
  }, [canvasRef, width, height]);
  
  return {
    animateToZoom, // Exposed for external use
  };
};