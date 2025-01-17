// File: front/src/lib/CoreRenderer.ts
// Last change: Fixed animation stopping and frame handling

import { LottieAnimation, LottieLayer } from "@/types/lottie";
import LayerRenderer from "@/lib/LayerRenderer";

export default class CoreRenderer {
 private canvas: HTMLCanvasElement;
 private ctx: CanvasRenderingContext2D;
 private animationData: LottieAnimation;
 private frame: number;
 private requestId: number | null = null;
 private layerRenderer: LayerRenderer;
 private lastFrameTime: number = 0;
 private isPlaying: boolean = false;
 private frameDuration: number;
 private frameCount: number = 0;
 private readonly DEBUG: boolean = false;

 constructor(canvas: HTMLCanvasElement, animationData: LottieAnimation) {
   this.canvas = canvas;
   this.animationData = animationData;
   this.frame = animationData.ip;
   this.frameDuration = 1000 / animationData.fr;

   const ctx = canvas.getContext("2d");
   if (!ctx) throw new Error("Failed to get canvas 2D context");
   this.ctx = ctx;

   canvas.width = animationData.w;
   canvas.height = animationData.h;

   this.layerRenderer = new LayerRenderer(ctx, animationData.layers);
   console.log("🎨 CoreRenderer initialized", {
     width: canvas.width,
     height: canvas.height,
     frameRate: animationData.fr,
     duration: this.frameDuration,
     totalFrames: animationData.op - animationData.ip
   });
 }

 private renderFrame() {
   if (this.DEBUG) {
     console.log(`🎬 Frame ${this.frame}/${this.animationData.op}`);
   }
   
   this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
   this.animationData.layers.forEach((layer: LottieLayer) => {
     if (this.frame >= layer.ip && this.frame < layer.op) {
       this.layerRenderer.renderLayer(layer, this.frame);
     }
   });
   this.frameCount++;
 }

 private animate = (timestamp: number) => {
   // Exit if animation was explicitly stopped
   if (!this.isPlaying || !this.requestId) {
     if (this.DEBUG) console.log("🛑 Animation cycle stopped");
     return;
   }

   // Initialize timing on first frame
   if (!this.lastFrameTime) {
     this.lastFrameTime = timestamp;
     this.requestId = requestAnimationFrame(this.animate);
     return;
   }

   const elapsed = timestamp - this.lastFrameTime;

   // Render frame if enough time has passed
   if (elapsed >= this.frameDuration) {
     // Render current frame
     this.renderFrame();
     
     // Check if animation should end
     if (this.frame >= this.animationData.op - 1) {
       console.log("🏁 Animation complete", {
         framesRendered: this.frameCount,
         duration: elapsed
       });
       this.stop();
       return;
     }

     // Increment frame and update timing
     this.frame++;
     this.lastFrameTime = timestamp - (elapsed % this.frameDuration);
   }

   // Continue animation if still playing
   if (this.isPlaying) {
     this.requestId = requestAnimationFrame(this.animate);
   }
 };

 play() {
   if (this.isPlaying || this.requestId) {
     console.log("⚠️ Animation already playing");
     return;
   }
   
   console.log("▶️ Starting animation");
   this.isPlaying = true;
   this.frame = this.animationData.ip;
   this.lastFrameTime = 0;
   this.frameCount = 0;
   this.requestId = requestAnimationFrame(this.animate);
 }

 stop() {
   if (!this.isPlaying) return;
   
   console.log("⏹️ Stopping animation", {
     finalFrame: this.frame,
     framesRendered: this.frameCount
   });
   
   this.isPlaying = false;
   
   if (this.requestId) {
     cancelAnimationFrame(this.requestId);
     this.requestId = null;
   }
   
   this.lastFrameTime = 0;
   this.frameCount = 0;
 }

 resize(width: number, height: number) {
   // Skip if dimensions haven't changed
   if (width === this.canvas.width && height === this.canvas.height) {
     return;
   }

   console.log("📐 Resizing canvas:", { width, height });
   this.canvas.width = width;
   this.canvas.height = height;
   
   // Re-render current frame if not animating
   if (!this.isPlaying && this.frame !== undefined) {
     this.renderFrame();
   }
 }
}
