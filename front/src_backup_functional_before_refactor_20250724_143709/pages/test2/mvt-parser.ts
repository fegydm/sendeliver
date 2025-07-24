// File: /Users/deutschmann/sendeliver/front/src/pages/test2/mvt-parser.ts
// Last change: Added logging for debugging zoom issues

/** Feature reprezentujúca entity v MVT dlaždici */
export interface Feature {
  coords: [number, number][];       // súradnice v rozsahu [0..extent]
  properties: Record<string, any>;  // dekódované vlastnosti
  type: number;                     // typ geometrie: 1=Point, 2=LineString, 3=Polygon
}

/** Point pre vnútorné použitie v parseri */
interface Point {
  x: number;
  y: number;
}

class Reader {
  private dv: DataView;
  private pos = 0;
  
  constructor(buf: ArrayBuffer) { 
    this.dv = new DataView(buf); 
  }
  
  eof(): boolean { 
    return this.pos >= this.dv.byteLength; 
  }

  /** Číta jeden protobuf varint (unsigned) */
  readVarint(): number {
    let res = 0, shift = 0;
    while (true) {
      if (this.pos >= this.dv.byteLength) {
        throw new Error(`Premature end of buffer reading varint at position ${this.pos}`);
      }
      const b = this.dv.getUint8(this.pos++);
      res |= (b & 0x7f) << shift;
      if ((b & 0x80) === 0) break;
      shift += 7;
      if (shift > 28) {
        throw new Error(`Varint too large at position ${this.pos}`);
      }
    }
    return res;
  }

  /** Číta "packed" varinty: najprv dĺžku, potom číta toľko varintov */
  readPackedVarint(): number[] {
    const len = this.readVarint();
    const end = this.pos + len;
    if (end > this.dv.byteLength) {
      throw new Error(`Invalid packed varint length ${len} exceeds buffer size`);
    }
    
    const arr: number[] = [];
    while (this.pos < end) {
      arr.push(this.readVarint());
    }
    return arr;
  }

  /** Pre wire-type=2 (length-delimited): načíta raw byty */
  readLengthDelimited(): ArrayBuffer {
    const len = this.readVarint();
    const start = this.pos;
    if (start + len > this.dv.byteLength) {
      throw new Error(`Invalid length ${len} exceeds buffer size`);
    }
    
    this.pos += len;
    return this.dv.buffer.slice(start, start + len);
  }

  /** Preskočí jedno políčko, ak wire-type nie je žiadaný */
  skipField(wireType: number): void {
    if (wireType === 0) {
      this.readVarint();
    } else if (wireType === 2) {
      const len = this.readVarint();
      this.pos += len;
      if (this.pos > this.dv.byteLength) {
        throw new Error(`Skip field: Invalid length ${len} at position ${this.pos}`);
      }
    } else if (wireType === 5) {
      this.pos += 4;
      if (this.pos > this.dv.byteLength) {
        throw new Error(`Skip field: Invalid fixed32 at position ${this.pos}`);
      }
    } else if (wireType === 1) {
      this.pos += 8;
      if (this.pos > this.dv.byteLength) {
        throw new Error(`Skip field: Invalid fixed64 at position ${this.pos}`);
      }
    } else {
      throw new Error(`Unsupported wire type: ${wireType}`);
    }
  }

  /** Čítanie float hodnoty */
  readFloat(): number {
    const val = this.dv.getFloat32(this.pos, true);
    this.pos += 4;
    return val;
  }

  /** Čítanie double hodnoty */
  readDouble(): number {
    const val = this.dv.getFloat64(this.pos, true);
    this.pos += 8;
    return val;
  }

  /** Čítanie int32 hodnoty */
  readInt32(): number {
    const val = this.dv.getInt32(this.pos, true);
    this.pos += 4;
    return val;
  }

  /** Čítanie sint32 hodnoty (zigzag kódovaná) */
  readSInt32(): number {
    const n = this.readVarint();
    return (n >> 1) ^ (-(n & 1)); // ZigZag dekódovanie
  }
}

/** Hlavná funkcia: dekóduje MVT tile z ArrayBufferu na pole Feature */
export function decodeMvt(buf: ArrayBuffer, zoom: number = 0): Feature[] {
  try {
    console.log(`Decoding MVT tile: size=${buf.byteLength}, zoom=${zoom}`);
    const r = new Reader(buf);
    let layerBuf: ArrayBuffer | null = null;

    // 1) nájdi a vyextrahuj prvú "layer" správu (field=3, wire=2)
    while (!r.eof()) {
      const key = r.readVarint();
      const field = key >> 3, wire = key & 0x7;
      if (field === 3 && wire === 2) {
        layerBuf = r.readLengthDelimited();
        break;
      }
      r.skipField(wire);
    }
    if (!layerBuf) {
      console.warn('No layer found in MVT tile');
      return [];
    }

    // 2) parse layer: extent + surové featury
    const { extent, features: rawFeats, keys, values } = parseLayer(layerBuf);
    console.log(`Layer parsed: extent=${extent}, features=${rawFeats.length}`);

    // 3) dekóduj geometriu a vlastnosti
    const out: Feature[] = [];
    
    for (const feat of rawFeats) {
      const geomType = feat.type;
      const rings = decodeGeometry(feat.geometry);
      
      // Skip prázdnu geometriu
      if (!rings.length || !rings[0].length) {
        console.warn(`Skipping empty geometry in feature, type=${geomType}`);
        continue;
      }
      
      // Dekódovanie vlastností
      const properties = decodeProperties(feat.tags, keys, values);
      
      // pre Polygon (type=3)
      if (geomType === 3) {
        // Prvý ring je outer, ostatné sú diery (zatiaľ ignorujeme diery)
        const outerRing = rings[0];
        const coords = outerRing.map(p => [p.x, p.y] as [number, number]);
        
        if (coords.length >= 3) { // Musí byť platný polygón
          out.push({ 
            coords,
            properties,
            type: geomType
          });
        }
      } 
      // pre LineString (type=2)
      else if (geomType === 2) {
        rings.forEach(ring => {
          const coords = ring.map(p => [p.x, p.y] as [number, number]);
          if (coords.length >= 2) { // Platná čiara musí mať aspoň 2 body
            out.push({
              coords,
              properties,
              type: geomType
            });
          }
        });
      }
      // pre Point (type=1)
      else if (geomType === 1) {
        rings.forEach(ring => {
          ring.forEach(point => {
            out.push({
              coords: [[point.x, point.y]],
              properties,
              type: geomType
            });
          });
        });
      }
    }
    
    console.log(`Decoded ${out.length} features for zoom=${zoom}`);
    DEBUG.setFeatureCount(out.length);
    return out;
  } catch (error) {
    console.error("MVT Parse error:", error);
    DEBUG.setError(error as Error);
    return [];
  }
}

/** Parse layer message */
function parseLayer(buf: ArrayBuffer): { 
  extent: number; 
  features: { 
    type: number; 
    geometry: number[]; 
    tags: number[] 
  }[]; 
  keys: string[]; 
  values: any[] 
} {
  const r = new Reader(buf);
  let extent = 4096;
  const features: { type: number; geometry: number[]; tags: number[] }[] = [];
  const keys: string[] = [];
  const values: any[] = [];

  while (!r.eof()) {
    const key = r.readVarint();
    const field = key >> 3, wire = key & 0x7;
    
    if (field === 1 && wire === 2) {      // name
      r.readLengthDelimited(); // Skip name
    } else if (field === 2 && wire === 2) { // features
      const fbuf = r.readLengthDelimited();
      features.push(parseFeature(fbuf));
    } else if (field === 3 && wire === 2) { // keys
      const keyBuf = r.readLengthDelimited();
      keys.push(parseString(keyBuf));
    } else if (field === 4 && wire === 2) { // values
      const valueBuf = r.readLengthDelimited();
      values.push(parseValue(valueBuf));
    } else if (field === 5 && wire === 0) { // extent
      extent = r.readVarint();
    } else if (field === 15 && wire === 0) { // version
      r.readVarint(); // Skip version
    } else {
      r.skipField(wire);
    }
  }
  
  return { extent, features, keys, values };
}

/** Parse feature message */
function parseFeature(buf: ArrayBuffer): { type: number; geometry: number[]; tags: number[] } {
  const r = new Reader(buf);
  let id = 0;
  let type = 0;
  let geom: number[] = [];
  let tags: number[] = [];

  while (!r.eof()) {
    const key = r.readVarint();
    const field = key >> 3, wire = key & 0x7;
    
    if (field === 1 && wire === 0) {      // id
      id = r.readVarint();
    } else if (field === 2 && wire === 2) { // tags
      tags = r.readPackedVarint();
    } else if (field === 3 && wire === 0) { // type
      type = r.readVarint();
    } else if (field === 4 && wire === 2) { // geometry
      geom = r.readPackedVarint();
    } else {
      r.skipField(wire);
    }
  }
  
  return { type, geometry: geom, tags };
}

/** Parse MVT string */
function parseString(buf: ArrayBuffer): string {
  return new TextDecoder().decode(buf);
}

/** Parse MVT value */
function parseValue(buf: ArrayBuffer): any {
  const r = new Reader(buf);
  while (!r.eof()) {
    const key = r.readVarint();
    const field = key >> 3, wire = key & 0x7;
    
    if (field === 1 && wire === 2) {      // string
      return parseString(r.readLengthDelimited());
    } else if (field === 2 && wire === 0) { // float
      return r.readFloat();
    } else if (field === 3 && wire === 0) { // double
      return r.readDouble();
    } else if (field === 4 && wire === 0) { // int
      return r.readVarint();
    } else if (field === 5 && wire === 0) { // uint
      return r.readVarint();
    } else if (field === 6 && wire === 0) { // sint
      const n = r.readVarint();
      return (n >> 1) ^ (-(n & 1)); // ZigZag decoding
    } else if (field === 7 && wire === 0) { // bool
      return !!r.readVarint();
    } else {
      r.skipField(wire);
    }
  }
  return null;
}

/** Dekódovanie properties z tagov */
function decodeProperties(tags: number[], keys: string[], values: any[]): Record<string, any> {
  const properties: Record<string, any> = {};
  // Tags sú key-value páry ako indexy do polí keys a values
  for (let i = 0; i < tags.length; i += 2) {
    if (i + 1 >= tags.length) break;
    const keyIdx = tags[i];
    const valIdx = tags[i + 1];
    if (keyIdx < keys.length && valIdx < values.length) {
      properties[keys[keyIdx]] = values[valIdx];
    }
  }
  return properties;
}

/** Dekódovanie geometrie z command streamu */
function decodeGeometry(cmds: number[]): Point[][] {
  let i = 0, x = 0, y = 0;
  const rings: Point[][] = [];
  const zig = (n: number) => (n >> 1) ^ (-(n & 1)); // ZigZag dekódovanie
  
  try {
    while (i < cmds.length) {
      const cmdInt = cmds[i++];
      const cmd = cmdInt & 0x7;        // Command ID: 1=MoveTo, 2=LineTo, 7=ClosePath
      const count = cmdInt >> 3;       // Počet bodov pre tento príkaz
      
      if (cmd === 1) {  // MoveTo: začiatok nového ringu
        for (let c = 0; c < count; c++) {
          if (i + 1 >= cmds.length) break;
          x += zig(cmds[i++]);  // dx
          y += zig(cmds[i++]);  // dy
          rings.push([{ x, y }]);
        }
      } else if (cmd === 2) {  // LineTo: pridávanie bodov do aktuálneho ringu
        const ring = rings[rings.length - 1];
        for (let c = 0; c < count; c++) {
          if (i + 1 >= cmds.length) break;
          x += zig(cmds[i++]);  // dx
          y += zig(cmds[i++]);  // dy
          ring.push({ x, y });
        }
      } else if (cmd === 7) {  // ClosePath: uzavretie ringu
        // Implicitné uzavretie - nerobíme nič extra
      } else {
        console.warn("[mvt-parser] Unknown command", cmd);
        break;
      }
    }
  } catch (error) {
    console.error("Geometry decoding error:", error);
  }
  
  return rings;
}

/** Konvertuje súradnice z MVT priestoru do geografického (lat/lng) */
export function mvtCoordsToLatLng(
  x: number, 
  y: number, 
  z: number, 
  tileX: number, 
  tileY: number, 
  extent: number = 4096
): [number, number] {
  // Normalizované súradnice v rámci dlaždice [0..1]
  const normX = x / extent;
  const normY = y / extent;
  
  // Geografická šírka a dĺžka
  const lng = (tileX + normX) / Math.pow(2, z) * 360 - 180;
  
  const n = Math.PI - 2 * Math.PI * (tileY + normY) / Math.pow(2, z);
  const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  
  return [lat, lng];
}

/** Ukladanie dodatočných debug informácií */
export const DEBUG = {
  lastError: null as Error | null,
  lastParsedFeatures: 0,
  setError(err: Error): void {
    this.lastError = err;
    console.error("[mvt-parser] Error:", err);
  },
  resetError(): void {
    this.lastError = null;
  },
  setFeatureCount(count: number): void {
    this.lastParsedFeatures = count;
  }
};