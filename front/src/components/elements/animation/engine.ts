// File: src/components/elements/animation/engine.ts
// Last change: Fixed missing createCircle method and completed AnimationEngine class

export interface AnimationFrame {
  type: 'rect' | 'circle' | 'path';
  properties: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    radius?: number;
    d?: string;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    transform?: {
      rotation?: number;
      scale?: { x: number; y: number };
      position?: { x: number; y: number };
    };
  };
}

export interface Keyframe {
  frame: number;
  value: number;
  easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
}

export interface AnimationLayer {
  frames: AnimationFrame[];
  keyframes: {
    [property: string]: Keyframe[];
  };
}

interface EngineConfig {
  loop?: boolean;
}

export class AnimationEngine {
  private svgElement: SVGSVGElement;
  private layers: AnimationLayer[] = [];
  private currentFrame = 0;
  private totalFrames = 0;
  private fps = 60;
  private isPlaying = false;
  private lastFrameTime = 0;
  private config: EngineConfig;

  constructor(container: HTMLElement, width: number, height: number, config: EngineConfig = {}) {
    this.config = config;

    this.svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svgElement.setAttribute('width', width.toString());
    this.svgElement.setAttribute('height', height.toString());
    this.svgElement.setAttribute('viewBox', `0 0 ${width} ${height}`);
    container.appendChild(this.svgElement);
  }

  public loadAnimation(data: { layers: AnimationLayer[]; totalFrames: number }): void {
    this.layers = data.layers;
    this.totalFrames = data.totalFrames;
    this.currentFrame = 0;
    this.renderFrame(0);
  }

  private renderFrame(frame: number): void {
    this.svgElement.innerHTML = '';
    this.layers.forEach(layer => {
      layer.frames.forEach(frameData => {
        let element: SVGElement;
        switch (frameData.type) {
          case 'rect':
            element = this.createRect(frameData);
            break;
          case 'circle':
            element = this.createCircle(frameData);
            break;
          case 'path':
            element = this.createPath(frameData);
            break;
          default:
            return;
        }
        this.svgElement.appendChild(element);
      });
    });
  }

  private createRect(frame: AnimationFrame): SVGRectElement {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    const props = frame.properties;
    if (props.x) rect.setAttribute('x', props.x.toString());
    if (props.y) rect.setAttribute('y', props.y.toString());
    if (props.width) rect.setAttribute('width', props.width.toString());
    if (props.height) rect.setAttribute('height', props.height.toString());
    if (props.fill) rect.setAttribute('fill', props.fill);
    if (props.stroke) rect.setAttribute('stroke', props.stroke);
    return rect;
  }

  private createCircle(frame: AnimationFrame): SVGCircleElement {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    const props = frame.properties;
    if (props.x) circle.setAttribute('cx', props.x.toString());
    if (props.y) circle.setAttribute('cy', props.y.toString());
    if (props.radius) circle.setAttribute('r', props.radius.toString());
    if (props.fill) circle.setAttribute('fill', props.fill);
    if (props.stroke) circle.setAttribute('stroke', props.stroke);
    return circle;
  }

  private createPath(frame: AnimationFrame): SVGPathElement {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const props = frame.properties;
    if (props.d) path.setAttribute('d', props.d);
    if (props.fill) path.setAttribute('fill', props.fill);
    if (props.stroke) path.setAttribute('stroke', props.stroke);
    return path;
  }

  public play(): void {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.lastFrameTime = performance.now();
    this.animate();
  }

  public stop(): void {
    this.isPlaying = false;
    this.currentFrame = 0;
    this.renderFrame(0);
  }

  private animate = (): void => {
    if (!this.isPlaying) return;
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastFrameTime;

    if (deltaTime >= (1000 / this.fps)) {
      this.currentFrame++;

      if (this.currentFrame >= this.totalFrames) {
        if (this.config.loop) {
          this.currentFrame = 0;
        } else {
          this.stop();
          return;
        }
      }
      this.renderFrame(this.currentFrame);
      this.lastFrameTime = currentTime;
    }
    requestAnimationFrame(this.animate);
  };
}
