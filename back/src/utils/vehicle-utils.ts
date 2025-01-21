import { vehicleTypes } from "../constants/vehicle-types.js";

export const calculateSuitableVehicles = (
  input: { weight?: number; palletCount?: number },
  weightPerPallet: number = 200
) => {
  let calculatedWeight = input.weight || 0;
  let calculatedPallets = input.palletCount || 0;

  if (!calculatedWeight && calculatedPallets) {
    calculatedWeight = calculatedPallets * weightPerPallet;
  }

  if (!calculatedPallets && calculatedWeight) {
    calculatedPallets = Math.ceil(calculatedWeight / weightPerPallet);
  }

  const suitableVehicles = vehicleTypes.filter(
    (vehicle) =>
      calculatedPallets >= vehicle.minPallets &&
      calculatedPallets <= vehicle.maxPallets &&
      calculatedWeight <= vehicle.maxPayloadKg
  );

  const warnings = suitableVehicles
    .filter(
      (vehicle) =>
        calculatedWeight + vehicle.emptyWeightKg > vehicle.totalWeightKg
    )
    .map(
      (vehicle) =>
        `Warning: Total weight (${calculatedWeight + vehicle.emptyWeightKg}kg) exceeds the total weight limit for ${vehicle.name} (${vehicle.totalWeightKg}kg).`
    );

  if (suitableVehicles.length === 0) {
    return {
      error: "No suitable vehicle found for the given weight and pallet count.",
      weight: calculatedWeight,
      palletCount: calculatedPallets,
    };
  }

  return {
    weight: calculatedWeight,
    palletCount: calculatedPallets,
    suggestedVehicles: suitableVehicles.map((v) => ({
      id: v.id,
      name: v.name,
      maxPayloadKg: v.maxPayloadKg,
      totalWeightKg: v.totalWeightKg,
    })),
    warnings,
  };
};
