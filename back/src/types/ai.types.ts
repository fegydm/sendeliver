export interface AIRequest {
  message: string;
  type: "sender" | "carrier";
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
    quantity?: string;
    vehicleType?: string;
    cargoType?: string;
  };
}
