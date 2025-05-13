// File: front/src/data/mockFleet.ts
// Updated: 10 vehicles, new 6-status enum (outbound • inbound • transit • standby • depot • maintenance)

export type VehicleStatus =
  | "outbound"
  | "inbound"
  | "transit"
  | "standby"
  | "depot"
  | "maintenance";

export interface Vehicle {
  id: string;
  name: string;
  type: string;                // van | tractor | trailer | rigid | …
  status: string;              // technical/lease state: available | busy | service…
  image: string;
  brand: string;
  plateNumber: string;
  manufactureYear: number;
  capacity: string;
  notes?: string;
  lastService?: string;
  nextService?: string;
  driver?: string;
  location?: string;
  assignedDriver?: string;
  dashboardStatus: VehicleStatus;
  odometerKm: number;
  capacityFree: string;
  availability: string;
  trailerIds?: string[];
  associatedTractorId?: string;
  start?: string;
  currentLocation?: string; 
  destination?: string
}

/* ------------------------------------------------------------------ */
/* 10 demo vehicles – každý nový status minimálne raz                 */
/* ------------------------------------------------------------------ */

export const mockVehicles: Vehicle[] = [
  /** 1 ─ Outbound */
  {
    id: "1",
    name: "Sprinter 311",
    type: "van",
    status: "available",
    image: "/vehicles/van1.jpg",
    brand: "Mercedes",
    plateNumber: "BA-123XX",
    manufactureYear: 2019,
    capacity: "1.5 t",
    notes: "Export náklad – Mníchov",
    lastService: "2025-02-10",
    nextService: "2025-08-10",
    assignedDriver: "1", // Ján Novák
    location: "location5", // Wien
    start: "location1", // Hlavný sklad Bratislava
    currentLocation: "location5", // Wien
    destination: "location6", // Praha
    dashboardStatus: "outbound",
    odometerKm: 148200,
    capacityFree: "0 t",
    availability: "busy",
  },

  /** 2 ─ Inbound */
  {
    id: "2",
    name: "Scania R500",
    type: "tractor",
    status: "available",
    image: "/vehicles/truck2.jpg",
    brand: "Scania",
    plateNumber: "NR-890CC",
    manufactureYear: 2022,
    capacity: "18 t",
    notes: "Vezie spätný náklad FR → SK",
    lastService: "2025-01-12",
    nextService: "2025-07-12",
    assignedDriver: "6", // Patrik Múdry
    location: "location6", // Praha
    start: "location5", // Wien
    currentLocation: "location6", // Praha
    destination: "location8", // Centrála SenDeliver
    dashboardStatus: "inbound",
    odometerKm: 67500,
    capacityFree: "6 t",
    availability: "busy",
  },

  /** 3 ─ Transit */
  {
    id: "3",
    name: "DAF XF Euro 6",
    type: "tractor",
    status: "available",
    image: "/vehicles/truck3.jpg",
    brand: "DAF",
    plateNumber: "TT-333TT",
    manufactureYear: 2020,
    capacity: "24 t",
    notes: "Transit IT → DE",
    lastService: "2024-12-01",
    nextService: "2025-05-30",
    assignedDriver: "3", // Roman Silný
    location: "location5", // Wien (simuluje Frankfurt)
    start: "location3", // Košice
    currentLocation: "location5", // Wien
    destination: "location6", // Praha
    dashboardStatus: "transit",
    odometerKm: 388900,
    capacityFree: "0 t",
    availability: "busy",
  },

  /** 4 ─ Standby */
  {
    id: "4",
    name: "Trailer Low-bed",
    type: "trailer",
    status: "available",
    image: "/vehicles/trailer2.jpg",
    brand: "Schmitz",
    plateNumber: "TR-456CD",
    manufactureYear: 2019,
    capacity: "18 t",
    notes: "Čaká na load v Antverpách",
    lastService: "2025-01-18",
    nextService: "2025-07-18",
    assignedDriver: undefined,
    location: "location5", // Wien (simuluje Brusel)
    dashboardStatus: "standby",
    odometerKm: 0,
    capacityFree: "18 t",
    availability: "available",
  },

  /** 5 ─ Depot */
  {
    id: "5",
    name: "Iveco Daily",
    type: "van",
    status: "available",
    image: "/vehicles/van2.jpg",
    brand: "Iveco",
    plateNumber: "PN-456YY",
    manufactureYear: 2021,
    capacity: "1.2 t",
    notes: "Parkuje v Žiline",
    assignedDriver: "4", // Matej Ostrý
    location: "location4", // Žilina
    dashboardStatus: "depot",
    odometerKm: 43300,
    capacityFree: "1.2 t",
    availability: "available",
  },

  /** 6 ─ Maintenance */
  {
    id: "6",
    name: "Volvo FH16",
    type: "tractor",
    status: "service",
    image: "/vehicles/truck1.jpg",
    brand: "Volvo",
    plateNumber: "ZA-789ZZ",
    manufactureYear: 2021,
    capacity: "24 t",
    notes: "Výmena brzdových kotúčov",
    assignedDriver: "3", // Roman Silný
    location: "location8", // Centrála SenDeliver
    dashboardStatus: "maintenance",
    odometerKm: 210000,
    capacityFree: "24 t",
    availability: "service",
  },

  /** 7 ─ Outbound */
  {
    id: "7",
    name: "Renault Master",
    type: "van",
    status: "available",
    image: "/vehicles/van3.jpg",
    brand: "Renault",
    plateNumber: "KE-987TT",
    manufactureYear: 2020,
    capacity: "1.3 t",
    assignedDriver: "2", // Peter Malý
    location: "location5", // Wien
    start: "location8", // Centrála SenDeliver
    currentLocation: "location5", // Wien
    destination: "location6", // Praha
    dashboardStatus: "outbound",
    odometerKm: 99100,
    capacityFree: "0 t",
    availability: "busy",
  },

  /** 8 ─ Inbound */
  {
    id: "8",
    name: "Trailer Mega",
    type: "trailer",
    status: "available",
    image: "/vehicles/trailer3.jpg",
    brand: "Krone",
    plateNumber: "KR-852JK",
    manufactureYear: 2017,
    capacity: "26 t",
    assignedDriver: undefined,
    location: "location5", // Wien (simuluje Berlín)
    start: "location6", // Praha
    currentLocation: "location5", // Wien
    destination: "location8", // Centrála SenDeliver
    dashboardStatus: "inbound",
    odometerKm: 0,
    capacityFree: "6 t",
    availability: "busy",
  },

  /** 9 ─ Standby */
  {
    id: "9",
    name: "MAN TGX",
    type: "tractor",
    status: "available",
    image: "/vehicles/truck4.jpg",
    brand: "MAN",
    plateNumber: "BA-652AA",
    manufactureYear: 2018,
    capacity: "24 t",
    assignedDriver: "1", // Ján Novák
    location: "location7", // Odpočívadlo Trstín
    dashboardStatus: "standby",
    odometerKm: 512300,
    capacityFree: "24 t",
    availability: "available",
  },

  /** 10 ─ Depot */
  {
    id: "10",
    name: "Flatbed Trailer",
    type: "trailer",
    status: "available",
    image: "/vehicles/placeholder.jpg",
    brand: "Schwarzmüller",
    plateNumber: "TT-741CZ",
    manufactureYear: 2016,
    capacity: "20 t",
    assignedDriver: undefined,
    location: "location2", // Trnava
    dashboardStatus: "depot",
    odometerKm: 0,
    capacityFree: "20 t",
    availability: "available",
  },
];

// ... (rest of the file remains unchanged)

/* ------------------------------------------------------------------ */
/*  Trips / Services môžu zostať ako boli – nezávislé na dashboardStatus */
/* ------------------------------------------------------------------ */
export interface Trip {
  id: number;
  vehicleId: number;
  date: string;
  driver: string;
  destination: string;
  status: string;
  distance: number;
  fuelConsumption: number;
}

export interface Service {
  id: string;
  vehicleId: string;
  date: string;
  type: string;
  status: string;
  cost: number;
  description: string;
}



export const mockTrips: Trip[] = [
  { id: 1, vehicleId: 1, date: "2023-04-21", driver: "Karol Veľký", destination: "Praha", status: "completed", distance: 350, fuelConsumption: 32 },
  { id: 2, vehicleId: 1, date: "2023-04-15", driver: "Ján Novák", destination: "Praha", status: "completed", distance: 350, fuelConsumption: 30 },
];

export const mockServices: Service[] = [
  { id: "1", vehicleId: "1", date: "2023-03-25", type: "Pravidelný servis", status: "completed", cost: 350, description: "Výmena oleja, filtrov" },
  { id: "2", vehicleId: "1", date: "2023-01-10", type: "Technická kontrola", status: "completed", cost: 120, description: "Pravidelná STK" },
];

// Helper functions for data retrieval
export const getTripsForVehicle = (vehicleId: string): Trip[] =>
  mockTrips.filter(trip => trip.vehicleId === Number(vehicleId));

export const getServicesForVehicle = (vehicleId: string): Service[] =>
  mockServices.filter(service => service.vehicleId === vehicleId);