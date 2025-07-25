// .front/src/utils/transformAIResponse.ts

export interface TransportRequest {
  pickupLocation: {
    address: string;
    city: string;
    country: string;
    postalCode: string;
  };
}

export function transformAIResponseToTransportRequest(aiData: any): TransportRequest {
  return {
    pickupLocation: {
      address: "",
      city: aiData.pickupLocation || "",
      country: "",
      postalCode: "",
    },
  };
}
