export type Animation = {
    fr: number; // Frame rate
    ip: number; // In point
    op: number; // Out point
    w: number; // Width
    h: number; // Height
    layers: Layer[]; // List of layers
  };
  
  export type Layer = {
    ty: number; // Layer type
    ip: number; // Start frame
    op: number; // End frame
    hd?: boolean; // Hidden
    ks: any; // Keyframe data
    t?: any; // Text data
  };
  