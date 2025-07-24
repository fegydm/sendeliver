// File: src/lib/app.llayer-lrenderer.comp.tsx
// Last change: Fixed logs and added better typing

import { LottieLayer, LottieShape } from "@/types/lottie";

export default class LayerRenderer {
  private ctx: CanvasRenderingContext2D;
  private layers: LottieLayer[];

  constructor(ctx: CanvasRenderingContext2D, layers: LottieLayer[]) {
    this.ctx = ctx;
    this.layers = layers;
  }

  /**
   * Renders a layer based on its type
   * @param layer The layer to render
   * @param frame The current animation frame
   */
  renderLayer(layer: LottieLayer, frame: number) {
    // Minimized logging to reduce console spam
    if (layer.ty === 4 || layer.ty === 5) { // Log only shape and text layers
      console.log(`🎨 Layer: ${layer.nm}, frame: ${frame}`);
    }

    this.ctx.save();
    this.applyLayerTransformations(layer);
    this.applyParentTransformations(layer, this.layers);

    switch (layer.ty) {
      case 0: // Composition
        break;

      case 1: // Solid
        this.renderSolidLayer(layer);
        break;

      case 2: // Image
        this.renderImageLayer(layer);
        break;

      case 3: // Null
        // No rendering needed for null layers
        break;

      case 4: // Shape
        if (layer.shapes) {
          this.renderShapeLayer(layer);
        }
        break;

      case 5: // Text
        if (layer.t) {
          this.renderTextLayer(layer);
        }
        break;

      default:
        console.warn(`⚠️ Unsupported layer type: ${layer.ty}`);
        break;
    }

    this.ctx.restore();
  }

  /**
   * Applies layer transformations (opacity, scale, rotation, position, anchor point)
   */
  private applyLayerTransformations(layer: LottieLayer) {
    const { o, s, r, p, a } = layer.ks;

    if (o) this.ctx.globalAlpha = o.k / 100;
    if (p) this.ctx.translate(p.k[0], p.k[1]);
    if (s) this.ctx.scale(s.k[0] / 100, s.k[1] / 100);
    if (r) this.ctx.rotate((r.k * Math.PI) / 180);
    if (a) this.ctx.translate(-a.k[0], -a.k[1]);
  }

  /**
   * Applies parent layer transformations recursively
   */
  private applyParentTransformations(layer: LottieLayer, layers: LottieLayer[]) {
    if (layer.parent !== undefined) {
      const parentLayer = layers.find((l) => l.ind === layer.parent);
      if (parentLayer) {
        this.applyLayerTransformations(parentLayer);
        this.applyParentTransformations(parentLayer, layers);
      }
    }
  }

  /**
   * Renders a solid layer (ty: 1)
   */
  private renderSolidLayer(layer: LottieLayer) {
    const color = (layer as any).sc;
    const width = (layer as any).sw;
    const height = (layer as any).sh;

    if (!color || !width || !height) return;

    this.ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`;
    this.ctx.fillRect(0, 0, width, height);
  }

  /**
   * Renders an image layer (ty: 2)
   */
  private renderImageLayer(layer: LottieLayer) {
    const refId = (layer as any).refId;
    if (!refId) return;

    const image = new Image();
    image.src = refId;
    image.onload = () => {
      const { s, a } = layer.ks;
      const [scaleX, scaleY] = s?.k || [100, 100];
      const [anchorX, anchorY] = a?.k || [0, 0];

      this.ctx.drawImage(image, -anchorX, -anchorY, scaleX, scaleY);
    };
  }

  /**
   * Renders a text layer (ty: 5)
   */
  private renderTextLayer(layer: LottieLayer) {
    const textData = (layer as any).t?.d?.k[0]?.s;
    if (!textData) return;

    const position = layer.ks.p?.k || [0, 0];

    this.ctx.font = `${textData.s}px ${textData.f}`;
    this.ctx.fillStyle = `rgba(${textData.fc.map((c: number) => c * 255).join(",")}, 1)`;
    this.ctx.fillText(textData.t, position[0], position[1]);
  }

  /**
   * Renders a shape layer (ty: 4)
   */
  private renderShapeLayer(layer: LottieLayer) {
    const shapes = layer.shapes;
    if (!shapes) return;

    shapes.forEach((shape: LottieShape) => {
      if (shape.ty === "sh" && shape.ks) {
        const pathData = shape.ks.k;

        this.ctx.beginPath();
        pathData.v.forEach((point: [number, number], index: number) => {
          if (index === 0) {
            this.ctx.moveTo(point[0], point[1]);
          } else {
            this.ctx.lineTo(point[0], point[1]);
          }
        });

        if (pathData.c) this.ctx.closePath();

        // Handle stroke properties from shape.st
        if (shape.st) {
          this.ctx.strokeStyle = `rgba(${shape.st.c.k.map((c: number) => c * 255).join(",")}, 1)`;
          this.ctx.lineWidth = shape.st.w.k;
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