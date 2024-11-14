// shared/enums/transport.enum.ts
export enum VehicleType {
  VAN = "VAN",
  TRUCK_3_5T = "TRUCK_3_5T",
  TRUCK_7_5T = "TRUCK_7_5T",
  TRUCK_12T = "TRUCK_12T",
  SEMI_TRAILER = "SEMI_TRAILER",
  MEGA_TRAILER = "MEGA_TRAILER",
}

export enum CargoType {
  GENERAL = "GENERAL",
  PALLETS = "PALLETS",
  BULK = "BULK",
  DANGEROUS = "DANGEROUS",
  REFRIGERATED = "REFRIGERATED",
}

export enum TransportStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ASSIGNED = "ASSIGNED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum LoadingType {
  SIDE = "SIDE",
  BACK = "BACK",
  TOP = "TOP",
  CRANE = "CRANE",
}
