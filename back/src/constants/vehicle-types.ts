export interface VehicleType {
    id: string; // Vehicle identifier
    name: string; // Readable name
    minPallets: number; // Minimum number of pallets
    maxPallets: number; // Maximum number of pallets
    maxPayloadKg: number; // Maximum payload capacity (cargo weight)
    totalWeightKg: number; // Total vehicle weight (including cargo)
    emptyWeightKg: number; // Empty vehicle weight
  }
  
  // Average weight of one pallet (can be adjusted as needed)
  export const averagePalletWeight = 200; // in kilograms
  
  // Vehicle definitions
  export const vehicleTypes: VehicleType[] = [
    {
      id: "curtain",
      name: "Curtain-sided Van",
      minPallets: 8,
      maxPallets: 10,
      maxPayloadKg: 800,
      totalWeightKg: 3500,
      emptyWeightKg: 2700,
    },
    {
      id: "box",
      name: "Box Van",
      minPallets: 4,
      maxPallets: 6,
      maxPayloadKg: 1200,
      totalWeightKg: 3500,
      emptyWeightKg: 2300,
    },
    {
      id: "lorry",
      name: "Small Lorry (Avia)",
      minPallets: 16,
      maxPallets: 16,
      maxPayloadKg: 3000,
      totalWeightKg: 7500,
      emptyWeightKg: 4500,
    },
    {
      id: "rigid",
      name: "Rigid Truck (Solo)",
      minPallets: 20,
      maxPallets: 20,
      maxPayloadKg: 7000,
      totalWeightKg: 12000,
      emptyWeightKg: 5000,
    },
    {
      id: "artic",
      name: "Articulated Truck",
      minPallets: 33,
      maxPallets: 33,
      maxPayloadKg: 24000,
      totalWeightKg: 40000,
      emptyWeightKg: 16000,
    },
  ];
  