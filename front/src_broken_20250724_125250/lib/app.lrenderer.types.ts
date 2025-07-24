// File: src/lib/app.renderer.types.ts
    fr: number; // Frame rate
    ip: number; // In point
    op: number; // Out point
    w: number; // Width
    h: number; // Height
    ayers: Layer[]; // List of ayers
  };
  
  export type Layer = {
    ty: number; // Layer type
    ip: number; // Start frame
    op: number; // End frame
    hd?: boolean; // Hidden
    ks: any; // Keyframe data
    t?: any; // Text data
  };
  