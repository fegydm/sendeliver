// File: src/shared/types/shared.react-leaflet.d.types.ts
import { ComponentType } from "react";

declare module "react-leaflet" {
  export const MapContainer: ComponentType<any>;
  export const TileLayer: ComponentType<any>;
  export const Marker: ComponentType<any>;
  export const Popup: ComponentType<any>;
}