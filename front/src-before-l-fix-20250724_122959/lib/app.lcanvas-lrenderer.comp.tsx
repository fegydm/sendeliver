// File: src/lib/app.lcanvas-lrenderer.comp.tsx
// Last change: Adjusted to support Lottie-compatible layer structure

interface AnimationData {
  fr: number; // Frames per second
  w: number; // Width
  h: number; // Height
  layers: Array<{
    ty: number; // Layer type
    nm: string; // Name
    ip: number; // In point (start frame)
    op: number; // Out point (end frame)
    t?: { d: { k: Array<{ s: { t: string; fc: [number, number, number]; f: string; s: number } }> } }; // Text data
    ks: {
      p: { a: number; k: Array<{ t: number; s: [number, number]; e: [number, number] }> }; // Position animation
    };
  }>;
}

export default class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationData: AnimationData;
  private frame: number = 0;
  private requestId: number | null = null;

  constructor(canvas: HTMLCanvasElement, animationData: AnimationData) {
    this.canvas = canvas;
    this.animationData = animationData;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get canvas 2D context");
    this.ctx = ctx;

    canvas.width = animationData.w;
    canvas.height = animationData.h;
  }

  private renderFrame() {
    const { ctx, animationData } = this;
    const frame = this.frame;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    animationData.layers.forEach((layer) => {
      if (layer.ty === 5 && layer.t) {
        const textKeyframes = layer.t.d.k[0].s;
        const position = layer.ks.p.k.find((kf) => kf.t === frame)?.s || [0, 0];

        ctx.font = `${textKeyframes.s}px ${textKeyframes.f}`;
        ctx.fillStyle = `rgb(${textKeyframes.fc[0] * 255}, ${textKeyframes.fc[1] * 255}, ${textKeyframes.fc[2] * 255})`;
        ctx.fillText(textKeyframes.t, position[0], position[1]);
      }
    });
  }

  play() {
    const render = () => {
      this.renderFrame();
      this.frame = (this.frame + 1) % this.animationData.layers[0].op;
      this.requestId = requestAnimationFrame(render);
    };

    this.requestId = requestAnimationFrame(render);
  }

  stop() {
    if (this.requestId) {
      cancelAnimationFrame(this.requestId);
      this.requestId = null;
    }
  }
}
