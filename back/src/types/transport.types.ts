// back/src/types/transport.types.ts
export interface Location {
  address: string;
  city: string;
  country: string;
  postalCode: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface TransportRequest {
  pickupLocation: Location;
  deliveryLocation: Location;
  pickupTime: Date;
  deliveryTime: Date;
  cargo: {
    weight: number;
    palletCount: number;
    type: string;
    description?: string;
  };
  requirements: {
    vehicleType: string;
    adr?: boolean;
    temperature?: {
      min: number;
      max: number;
    };
    liftgate?: boolean;
    trackingRequired?: boolean;
  };
}

export interface Price {
  amount: number;
  currency: string;
  vatIncluded: boolean;
}
