// File: ./back/src/constants/vehicle.constants.ts
// Constants for backend vehicle logic and database filtering

export interface VehicleType {
  id: string;
  name: string;
  minPallets: number;
  maxPallets: number;
  maxPayloadKg: number;
  totalWeightKg: number;
  emptyWeightKg: number;
}

export const AVERAGE_PALLET_WEIGHT_KG = 200; // Average weight of one pallet in kilograms

export const VEHICLE_TYPES: VehicleType[] = [
  { id: "curtain", name: "Curtain-sided Van", minPallets: 8, maxPallets: 10, maxPayloadKg: 800, totalWeightKg: 3500, emptyWeightKg: 2700 },
  { id: "box", name: "Box Van", minPallets: 4, maxPallets: 6, maxPayloadKg: 1200, totalWeightKg: 3500, emptyWeightKg: 2300 },
  { id: "lorry", name: "Small Lorry (Avia)", minPallets: 16, maxPallets: 16, maxPayloadKg: 3000, totalWeightKg: 7500, emptyWeightKg: 4500 },
  { id: "rigid", name: "Rigid Truck (Solo)", minPallets: 20, maxPallets: 20, maxPayloadKg: 7000, totalWeightKg: 12000, emptyWeightKg: 5000 },
  { id: "artic", name: "Articulated Truck", minPallets: 33, maxPallets: 33, maxPayloadKg: 24000, totalWeightKg: 40000, emptyWeightKg: 16000 },
] as const;

export const SEARCH_CONSTANTS = {
  MAX_DISTANCE_KM: 300, // Maximum distance for vehicle search in kilometers
  MAX_PAST_TIME_HOURS: 40, // Maximum time in the past to filter vehicles from database
  DEFAULT_LOADING_TIME_OFFSET_HOURS: 3, // Default offset for loading_dt if not provided (now + 3h)
} as const;