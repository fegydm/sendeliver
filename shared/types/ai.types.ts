// shared/types/ai.types.ts
export interface AIRequest {
  message: string;
  type: "sender" | "carrier";
  language?: string;
}

export interface AIResponse {
  content: string;
  data?: {
    pickupLocation?: string;
    deliveryLocation?: string;
    pickupTime?: string;
    deliveryTime?: string;
    weight?: number;
    palletCount?: number;
    additionalInfo?: {
      vehicleType?: string;
      requirements?: string[];
      price?: number;
      distance?: number;
      adr?: boolean;
      loadingType?: string;
      temperature?: {
        min?: number;
        max?: number;
        required?: boolean;
      };
    };
  };
}
