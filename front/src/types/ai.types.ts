// File: src/types/ai.types.ts
// Last change: Added form types and conversion utilities

export interface AIRequest {
  message: string;
  type: "sender" | "hauler";
  lang1?: string;
}

export interface AIResponse {
  content: string;
  data?: {
    pickupLocation?: string;
    deliveryLocation?: string;
    pickupTime?: string;
    deliveryTime?: string;
    weight?: string;
    palletCount?: number;
    quantity?: string;
    vehicleType?: string;
    cargoType?: string;
  };
}

export interface CargoData {
  pallets: number;
  weight: number;
}

export interface LocationData {
  country: {
    code: string;
    flag: string;
  };
  postalCode: string;
  city: string;
  time: string;
}

export interface FormData {
  pickup: LocationData;
  delivery: LocationData;
  cargo: CargoData;
}

// For AI compatibility
export interface AIFormData {
  pickupLocation: string;
  deliveryLocation: string;
  pickupTime: string;
  deliveryTime: string;
  weight: number;
  palletCount: number;
}

// Conversion utilities
export const convertToAIFormData = (data: FormData): AIFormData => ({
  pickupLocation: `${data.pickup.postalCode} ${data.pickup.city}, ${data.pickup.country.code}`,
  deliveryLocation: `${data.delivery.postalCode} ${data.delivery.city}, ${data.delivery.country.code}`,
  pickupTime: data.pickup.time,
  deliveryTime: data.delivery.time,
  weight: data.cargo.weight,
  palletCount: data.cargo.pallets
});

export const convertToFormData = (data: AIFormData): FormData => ({
  pickup: {
    country: { code: '', flag: '' }, // These need to be set separately
    postalCode: '',
    city: data.pickupLocation,
    time: data.pickupTime
  },
  delivery: {
    country: { code: '', flag: '' }, // These need to be set separately
    postalCode: '',
    city: data.deliveryLocation,
    time: data.deliveryTime
  },
  cargo: {
    pallets: data.palletCount,
    weight: data.weight
  }
});

// Helper type for converting AIResponse data to FormData
export const convertAIResponseToFormData = (response: AIResponse): AIFormData => ({
  pickupLocation: response.data?.pickupLocation || '',
  deliveryLocation: response.data?.deliveryLocation || '',
  pickupTime: response.data?.pickupTime || '',
  deliveryTime: response.data?.deliveryTime || '',
  weight: response.data?.weight ? parseFloat(response.data.weight) : 0,
  palletCount: response.data?.palletCount || 0
});