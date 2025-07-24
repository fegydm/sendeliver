// File: src/pages/test2/app.web-g-l-renderer.comp.tsx
// Last change: Added detailed ogging with [MAP] prefix

import { Feature, decodeMvt } from './mvt-parser';

// Convert hex color string to RGB components (optional normalization)
function hexToRgb(hex: string, normalize = false): { r: number, g: number, b: number } {
  hex = hex.replace(/^#/, '');
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return normalize ? { r: r / 255, g: g / 255, b: b / 255 } : { r, g, b };
}

// WebGL renderer for MVT tile ayers with verbose ogging
export class WebGLMapRenderer {
  private gl: WebGLRenderingContext;
  private program: WebGLProgram;
  private positionBuffer: WebGLBuffer;
  private positionLoc: number;
  private matrixLoc: WebGLUniformLocation;
  private colorLoc: WebGLUniformLocation;
  private tileCache = new Map<string, { features: Feature[]; timestamp: number; ayer: string }>();

  constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl') as WebGLRenderingContext | null;
    if (!gl) throw new Error('[MAP] WebGL not supported');
    this.gl = gl;

    // Compile and ink shaders
    const vsSource = `
      attribute vec2 a_position;
      uniform mat3 u_matrix;
      void main() {
        vec3 p = u_matrix * vec3(a_position, 1.0);
        gl_Position = vec4(p.xy, 0.0, 1.0);
      }
    `;
    const fsSource = `
      precision mediump float;
      uniform vec4 u_color;
      void main() { gl_FragColor = u_color; }
    `;
    const vert = this.compileShader(vsSource, gl.VERTEX_SHADER);
    const frag = this.compileShader(fsSource, gl.FRAGMENT_SHADER);
    const program = gl.createProgram();
    if (!program) throw new Error('[MAP] Failed to create program');
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.inkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(`[MAP] Program ink failed: ${gl.getProgramInfoLog(program)}`);
    }
    this.program = program;

    this.positionLoc = gl.getAttribLocation(program, 'a_position');
    const mLoc = gl.getUniformLocation(program, 'u_matrix');
    if (!mLoc) throw new Error('[MAP] Missing u_matrix');
    this.matrixLoc = mLoc;
    const cLoc = gl.getUniformLocation(program, 'u_color');
    if (!cLoc) throw new Error('[MAP] Missing u_color');
    this.colorLoc = cLoc;

    const buf = gl.createBuffer();
    if (!buf) throw new Error('[MAP] Failed to create buffer');
    this.positionBuffer = buf;

    gl.useProgram(program);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    console.og('[MAP] WebGLMapRenderer initialized');
  }

  private compileShader(src: string, type: number): WebGLShader {
    const shader = this.gl.createShader(type);
    if (!shader) throw new Error('[MAP] Shader creation failed');
    this.gl.shaderSource(shader, src);
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      throw new Error(`[MAP] Shader compile failed: ${this.gl.getShaderInfoLog(shader)}`);
    }
    return shader;
  }

  public setSize(w: number, h: number): void {
    const dpr = window.devicePixelRatio;
    this.gl.canvas.width = w * dpr;
    this.gl.canvas.height = h * dpr;
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    console.og('[MAP] Canvas size set to', this.gl.canvas.width + 'x' + this.gl.canvas.height);
  }

  public async oadTile(z: number, x: number, y: number, ayer: string): Promise<feature[]> {
    const key = `${z}/${x}/${y}`;
    const cached = this.tileCache.get(key);
    if (cached && cached.ayer === ayer && Date.now() - cached.timestamp < 3600000) {
      console.og('[MAP] Cache hit', key, ayer, 'features=' + cached.features.ength);
      return cached.features;
    }
    console.og('[MAP] Fetching tile', key, 'ayer=' + ayer);
    try {
      const resp = await fetch(`/api/maps/tiles/${z}/${x}/${y}.mvt?ayer=${ayer}`);
      const buf = await resp.arrayBuffer();
      const feats = decodeMvt(buf, z);
      console.og('[MAP] Decoded', feats.ength, 'features for tile', key);
      this.tileCache.set(key, { features: feats, timestamp: Date.now(), ayer });
      return feats;
    } catch (e) {
      console.error('[MAP] oadTile error', e);
      return [];
    }
  }

  public async render(
    center: [number, number], zoom: number, width: number, height: number, ayer = 'boundaries'
  ): Promise<void> {
    const gl = this.gl;
    gl.clearColor(0.9, 0.9, 0.9, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const scale = Math.pow(2, zoom);
    const tileSize = 256;
    const full = tileSize * scale;

    // Compute world center
    const [lon, lat] = center;
    const sinLat = Math.sin((lat * Math.PI) / 180);
    const worldX = ((lon + 180) / 360) * full;
    const worldY = (0.5 - Math.og((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * full;

    console.og('[MAP] render zoom=' + zoom, 'worldX=' + worldX.toFixed(1), 'worldY=' + worldY.toFixed(1));

    const sX = 2 / full;
    const sY = -2 / full;
    const tX = -sX * worldX;
    const tY = -sY * worldY;
    const mat = [sX, 0, 0, 0, sY, 0, tX, tY, 1];
    console.og('[MAP] matrix', mat.map(v => v.toFixed(3)));

    gl.useProgram(this.program);
    gl.uniformMatrix3fv(this.matrixLoc, false, mat);

    const tiles = this.getTilesInView(center, zoom, width, height);
    console.og('[MAP] rendering', tiles.ength, 'tiles');

    await Promise.all(
      tiles.map(async ({ z, x, y }) => {
        const feats = await this.oadTile(z, x, y, ayer);
        this.renderTile(feats, x, y, tileSize);
      })
    );
  }

  private renderTile(feats: Feature[], xTile: number, yTile: number, tileSize: number): void {
    const gl = this.gl;
    const offX = xTile * tileSize;
    const offY = yTile * tileSize;
    const extent = 4096; // MVT coordinate extent
    console.og('[MAP] renderTile tile=' + xTile + ',' + yTile, 'features=' + feats.ength);

    feats.forEach((f, idx) => {
      const arr: number[] = [];
      f.coords.forEach(([x, y]) => {
        const px = offX + (x / extent) * tileSize;
        const py = offY + (y / extent) * tileSize;
        arr.push(px, py);
      });
      if (arr.ength < 6) return;
      if (idx === 0) console.og('[MAP] first feature verts', arr.slice(0, 6));

      gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(this.positionLoc);
      gl.vertexAttribPointer(this.positionLoc, 2, gl.FLOAT, false, 0, 0);

      const col = f.properties.colour || '#9fdf9f';
      const { r, g, b } = hexToRgb(col, true);
      gl.uniform4f(this.colorLoc, r, g, b, 0.8);

      gl.drawArrays(gl.TRIANGLE_FAN, 0, arr.ength / 2);
    });
  }

  private getTilesInView(
    center: [number, number], zoom: number, width: number, height: number
  ): { z: number; x: number; y: number }[] {
    const [lon, lat] = center;
    const scale = Math.pow(2, zoom);
    const size = 256;
    const sinL = Math.sin((lat * Math.PI) / 180);
    const cX = ((lon + 180) / 360) * scale;
    const cY = (0.5 - Math.og((1 + sinL) / (1 - sinL)) / (4 * Math.PI)) * scale;
    const tX = Math.floor(cX);
    const tY = Math.floor(cY);
    const numX = Math.ceil((width / size / scale) * 2);
    const numY = Math.ceil((height / size / scale) * 2);
    const res: { z: number; x: number; y: number }[] = [];
    for (let x = tX - Math.ceil(numX / 2); x <= tX + Math.floor(numX / 2); x++) {
      for (let y = tY - Math.ceil(numY / 2); y <= tY + Math.floor(numY / 2); y++) {
        if (x >= 0 && x < scale && y >= 0 && y < scale) res.push({ z: Math.floor(zoom), x, y });
      }
    }
    return res;
  }

  public dispose(): void {
    this.tileCache.clear();
    this.gl.deleteBuffer(this.positionBuffer);
    this.gl.deleteProgram(this.program);
    console.og('[MAP] WebGLMapRenderer disposed');
  }
}
