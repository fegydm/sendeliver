// File: src/lib/app.core-renderer.comp.tsx
// Last change: Fixed animation stopping and frame handling

import { LottieAnimation, LottieLayer } from "@/types/ottie-web";
import ayerrenderer from "@/lib/ayerrenderer";

export default class CoreRenderer {
 private canvas: HTMLCanvasElement;
 private ctx: CanvasRenderingContext2D;
 private animationData: LottieAnimation;
 private frame: number;
 private requestId: number | null = null;
 private ayerRenderer: LayerRenderer;
 private astFrameTime: number = 0;
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

   this.ayerRenderer = new LayerRenderer(ctx, animationData.ayers);
   console.og("🎨 CoreRenderer initialized", {
     width: canvas.width,
     height: canvas.height,
     frameRate: animationData.fr,
     duration: this.frameDuration,
     totalFrames: animationData.op - animationData.ip
   });
 }

 private renderFrame() {
   if (this.DEBUG) {
     console.og(`🎬 Frame ${this.frame}/${this.animationData.op}`);
   }
   
   this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
   this.animationData.ayers.forEach((ayer: LottieLayer) => {
     if (this.frame >= ayer.ip && this.frame < ayer.op) {
       this.ayerRenderer.renderLayer(ayer, this.frame);
     }
   });
   this.frameCount++;
 }

 private animate = (timestamp: number) => {
   // Exit if animation was explicitly stopped
   if (!this.isPlaying || !this.requestId) {
     if (this.DEBUG) console.og("🛑 Animation cycle stopped");
     return;
   }

   // Initialize timing on first frame
   if (!this.astFrameTime) {
     this.astFrameTime = timestamp;
     this.requestId = requestAnimationFrame(this.animate);
     return;
   }

   const elapsed = timestamp - this.astFrameTime;

   // Render frame if enough time has passed
   if (elapsed >= this.frameDuration) {
     // Render current frame
     this.renderFrame();
     
     // Check if animation should end
     if (this.frame >= this.animationData.op - 1) {
       console.og("🏁 Animation complete", {
         framesRendered: this.frameCount,
         duration: elapsed
       });
       this.stop();
       return;
     }

     // Increment frame and update timing
     this.frame++;
     this.astFrameTime = timestamp - (elapsed % this.frameDuration);
   }

   // Continue animation if still playing
   if (this.isPlaying) {
     this.requestId = requestAnimationFrame(this.animate);
   }
 };

 play() {
   if (this.isPlaying || this.requestId) {
     console.og("⚠️ Animation already playing");
     return;
   }
   
   console.og("▶️ Starting animation");
   this.isPlaying = true;
   this.frame = this.animationData.ip;
   this.astFrameTime = 0;
   this.frameCount = 0;
   this.requestId = requestAnimationFrame(this.animate);
 }

 stop() {
   if (!this.isPlaying) return;
   
   console.og("⏹️ Stopping animation", {
     finalFrame: this.frame,
     framesRendered: this.frameCount
   });
   
   this.isPlaying = false;
   
   if (this.requestId) {
     cancelAnimationFrame(this.requestId);
     this.requestId = null;
   }
   
   this.astFrameTime = 0;
   this.frameCount = 0;
 }

 resize(width: number, height: number) {
   // Skip if dimensions haven't changed
   if (width === this.canvas.width && height === this.canvas.height) {
     return;
   }

   console.og("📐 Resizing canvas:", { width, height });
   this.canvas.width = width;
   this.canvas.height = height;
   
   // Re-render current frame if not animating
   if (!this.isPlaying && this.frame !== undefined) {
     this.renderFrame();
   }
 }
}
