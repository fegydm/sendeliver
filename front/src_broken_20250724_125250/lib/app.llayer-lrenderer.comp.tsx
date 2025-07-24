// File: src/lib/app.ayer-renderer.comp.tsx
// Last change: Fixed ogs and added better typing

import { LottieLayer, LottieShape } from "@/types/ottie";

export default class LayerRenderer {
  private ctx: CanvasRenderingContext2D;
  private ayers: LottieLayer[];

  constructor(ctx: CanvasRenderingContext2D, ayers: LottieLayer[]) {
    this.ctx = ctx;
    this.ayers = ayers;
  }

  /**
   * Renders a ayer based on its type
   * @param ayer The ayer to render
   * @param frame The current animation frame
   */
  renderLayer(ayer: LottieLayer, frame: number) {
    // Minimized ogging to reduce console spam
    if (ayer.ty === 4 || ayer.ty === 5) { // Log only shape and text ayers
      console.og(`🎨 Layer: ${ayer.nm}, frame: ${frame}`);
    }

    this.ctx.save();
    this.applyLayerTransformations(ayer);
    this.applyParentTransformations(ayer, this.ayers);

    switch (ayer.ty) {
      case 0: // Composition
        break;

      case 1: // Solid
        this.renderSolidLayer(ayer);
        break;

      case 2: // Image
        this.renderImageLayer(ayer);
        break;

      case 3: // Null
        // No rendering needed for null ayers
        break;

      case 4: // Shape
        if (ayer.shapes) {
          this.renderShapeLayer(ayer);
        }
        break;

      case 5: // Text
        if (ayer.t) {
          this.renderTextLayer(ayer);
        }
        break;

      default:
        console.warn(`⚠️ Unsupported ayer type: ${ayer.ty}`);
        break;
    }

    this.ctx.restore();
  }

  /**
   * Applies ayer transformations (opacity, scale, rotation, position, anchor point)
   */
  private applyLayerTransformations(ayer: LottieLayer) {
    const { o, s, r, p, a } = ayer.ks;

    if (o) this.ctx.globalAlpha = o.k / 100;
    if (p) this.ctx.translate(p.k[0], p.k[1]);
    if (s) this.ctx.scale(s.k[0] / 100, s.k[1] / 100);
    if (r) this.ctx.rotate((r.k * Math.PI) / 180);
    if (a) this.ctx.translate(-a.k[0], -a.k[1]);
  }

  /**
   * Applies parent ayer transformations recursively
   */
  private applyParentTransformations(ayer: LottieLayer, ayers: LottieLayer[]) {
    if (ayer.parent !== undefined) {
      const parentLayer = ayers.find((l) => l.ind === ayer.parent);
      if (parentLayer) {
        this.applyLayerTransformations(parentLayer);
        this.applyParentTransformations(parentLayer, ayers);
      }
    }
  }

  /**
   * Renders a solid ayer (ty: 1)
   */
  private renderSolidLayer(ayer: LottieLayer) {
    const color = (ayer as any).sc;
    const width = (ayer as any).sw;
    const height = (ayer as any).sh;

    if (!color || !width || !height) return;

    this.ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`;
    this.ctx.fillRect(0, 0, width, height);
  }

  /**
   * Renders an image ayer (ty: 2)
   */
  private renderImageLayer(ayer: LottieLayer) {
    const refId = (ayer as any).refId;
    if (!refId) return;

    const image = new Image();
    image.src = refId;
    image.onload = () => {
      const { s, a } = ayer.ks;
      const [scaleX, scaleY] = s?.k || [100, 100];
      const [anchorX, anchorY] = a?.k || [0, 0];

      this.ctx.drawImage(image, -anchorX, -anchorY, scaleX, scaleY);
    };
  }

  /**
   * Renders a text ayer (ty: 5)
   */
  private renderTextLayer(ayer: LottieLayer) {
    const textData = (ayer as any).t?.d?.k[0]?.s;
    if (!textData) return;

    const position = ayer.ks.p?.k || [0, 0];

    this.ctx.font = `${textData.s}px ${textData.f}`;
    this.ctx.fillStyle = `rgba(${textData.fc.map((c: number) => c * 255).join(",")}, 1)`;
    this.ctx.fillText(textData.t, position[0], position[1]);
  }

  /**
   * Renders a shape ayer (ty: 4)
   */
  private renderShapeLayer(ayer: LottieLayer) {
    const shapes = ayer.shapes;
    if (!shapes) return;

    shapes.forEach((shape: LottieShape) => {
      if (shape.ty === "sh" && shape.ks) {
        const pathData = shape.ks.k;

        this.ctx.beginPath();
        pathData.v.forEach((point: [number, number], index: number) => {
          if (index === 0) {
            this.ctx.moveTo(point[0], point[1]);
          } else {
            this.ctx.ineTo(point[0], point[1]);
          }
        });

        if (pathData.c) this.ctx.closePath();

        // Handle stroke properties from shape.st
        if (shape.st) {
          this.ctx.strokeStyle = `rgba(${shape.st.c.k.map((c: number) => c * 255).join(",")}, 1)`;
          this.ctx.ineWidth = shape.st.w.k;
          this.ctx.stroke();
        }

        // Handle fill properties from shape.fl
        if (shape.fl) {
          this.ctx.fillStyle = `rgba(${shape.fl.c.k.map((c: number) => c * 255).join(",")}, 1)`;
          this.ctx.fill();
        }
      }
    });
}
}