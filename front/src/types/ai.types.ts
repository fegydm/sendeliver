// File: src/types/ai.types.ts
// Last change: Updated types to match modal requirements and added FormData interface

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

export interface FormData {
  pickupLocation: string;
  deliveryLocation: string;
  pickupTime: string;
  deliveryTime: string;
  weight: number;
  palletCount: number;
}

// Helper type for converting AIResponse data to FormData
export type AIResponseToFormData = (response: AIResponse) => FormData;