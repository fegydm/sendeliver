// File: front/src/data/mockFleet.ts
// Description: Mock vehicle data for fleet management – now with nearestParking property for each dynamic vehicle
// Last change: Added nearestParking to Vehicle, set correct parking for each dynamic vehicle

export enum VehicleStatus {
  Outbound = "outbound",
  Inbound = "inbound",
  Transit = "transit",
  Waiting = "waiting",
  Break = "break",
  Standby = "standby",
  Depot = "depot",
  Service = "service",
}

// Status constants for dashboards/filters/charts/maps
export const statusHex: Record<VehicleStatus, string> = {
  [VehicleStatus.Outbound]: "#2389ff",
  [VehicleStatus.Inbound]: "#1fbac7",
  [VehicleStatus.Transit]: "#7a63ff",
  [VehicleStatus.Waiting]: "#5958c8",
  [VehicleStatus.Break]: "#34495e",
  [VehicleStatus.Standby]: "#b5bd00",
  [VehicleStatus.Depot]: "#6b7684",
  [VehicleStatus.Service]: "#d726ff",
};

export const statusLabels: Record<VehicleStatus, string> = {
  [VehicleStatus.Outbound]: "Out bound",
  [VehicleStatus.Inbound]: "In bound",
  [VehicleStatus.Transit]: "Transit",
  [VehicleStatus.Waiting]: "Waiting",
  [VehicleStatus.Break]: "Break",
  [VehicleStatus.Standby]: "Standby",
  [VehicleStatus.Depot]: "Depot",
  [VehicleStatus.Service]: "Service",
};

// Status order for filters/sorting
export const STATUS_ORDER: VehicleStatus[] = [
  VehicleStatus.Outbound,
  VehicleStatus.Inbound,
  VehicleStatus.Transit,
  VehicleStatus.Waiting,
  VehicleStatus.Break,
  VehicleStatus.Standby,
  VehicleStatus.Depot,
  VehicleStatus.Service,
];

export interface Vehicle {
  id: string;
  name: string;
  type: string; // van | tractor | trailer | rigid | …
  status: string; // technical/lease state: available | busy | service…
  image: string;
  brand: string;
  plateNumber: string;
  manufactureYear: number;
  capacity: string;
  notes?: string;
  lastService?: string;
  nextService?: string;
  assignedDriver?: string; // Driver ID from mockPeople.ts
  assignedDispatcher?: string; // Dispatcher ID from mockPeople.ts
  location?: string; // Location ID from mockLocations.ts (for static statuses)
  start?: string; // Location ID from mockLocations.ts (for dynamic statuses)
  currentLocation?: string; // Location ID from mockLocations.ts (for dynamic statuses)
  destination?: string; // Location ID from mockLocations.ts (for dynamic statuses)
  nearestParking?: string; // Location ID from mockLocations.ts (for nearest parking)
  dashboardStatus: VehicleStatus;
  odometerKm: number;
  capacityFree: string;
  availability: string;
  trailerIds?: string[];
  associatedTractorId?: string;
  positionColor?: "G" | "O" | "R"; // Green (no delay), Orange (minor delay), Red (major delay)
  onBreak?: boolean; // For dynamic vehicles, true if driver is on break
}

export const mockVehicles: Vehicle[] = [
  /** 1 ─ Outbound: Žilina → Wroclaw → Poznaň */
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
    notes: "Export náklad – Poľsko",
    lastService: "2025-02-10",
    nextService: "2025-08-10",
    assignedDriver: "1", // Ján Novák
    assignedDispatcher: "7", // Mária Kovárová
    start: "location4", // Žilina
    currentLocation: "location12", // Wroclaw
    destination: "location13", // Poznaň
    nearestParking: "parking1",
    dashboardStatus: VehicleStatus.Outbound,
    odometerKm: 148200,
    capacityFree: "0 t",
    availability: "busy",
    positionColor: "G",
    onBreak: false,
  },

  /** 2 ─ Inbound: Berlín → Brno → Trnava */
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
    notes: "Spätný náklad DE → SK",
    lastService: "2025-01-12",
    nextService: "2025-07-12",
    assignedDriver: "6", // Patrik Múdry
    assignedDispatcher: "8", // Tomáš Rýchly
    start: "location21", // Berlín
    currentLocation: "location5", // Brno
    destination: "location2", // Trnava
    nearestParking: "parking2",
    dashboardStatus: VehicleStatus.Inbound,
    odometerKm: 67500,
    capacityFree: "6 t",
    availability: "busy",
    positionColor: "O",
    onBreak: false,
  },

  /** 3 ─ Transit: Mníchov → Plzeň → Praha */
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
    notes: "Transit DE → CZ",
    lastService: "2024-12-01",
    nextService: "2025-05-30",
    assignedDriver: "3", // Roman Silný
    assignedDispatcher: "7", // Mária Kovárová
    start: "location14", // Mníchov
    currentLocation: "location15", // Plzeň
    destination: "location6", // Praha
    nearestParking: "parking1",
    dashboardStatus: VehicleStatus.Transit,
    odometerKm: 388900,
    capacityFree: "0 t",
    availability: "busy",
    positionColor: "R",
    onBreak: false,
  },

  /** 4 ─ Standby: Dortmund */
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
    notes: "Čaká na load v Dortmunde",
    lastService: "2025-01-18",
    nextService: "2025-07-18",
    assignedDriver: undefined,
    assignedDispatcher: "8",
    location: "location9", // Dortmund
    dashboardStatus: VehicleStatus.Standby,
    odometerKm: 0,
    capacityFree: "18 t",
    availability: "available",
  },

  /** 5 ─ Depot: Žilina */
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
    assignedDriver: "4",
    assignedDispatcher: "7",
    location: "location4", // Žilina
    dashboardStatus: VehicleStatus.Depot,
    odometerKm: 43300,
    capacityFree: "1.2 t",
    availability: "available",
  },

  /** 6 ─ Maintenance: Bratislava */
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
    assignedDriver: "3",
    assignedDispatcher: "7",
    location: "location8", // Centrála SenDeliver (Bratislava)
    dashboardStatus: VehicleStatus.Service,
    odometerKm: 210000,
    capacityFree: "24 t",
    availability: "service",
  },

  /** 7 ─ Outbound: Žilina → Montabaur → Kolín */
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
    assignedDriver: "2",
    assignedDispatcher: "8",
    start: "location4", // Žilina
    currentLocation: "location10", // Montabaur
    destination: "location11", // Kolín
    nearestParking: "parking1",
    dashboardStatus: VehicleStatus.Outbound,
    odometerKm: 99100,
    capacityFree: "0 t",
    availability: "busy",
    positionColor: "G",
    onBreak: false,
  },

  /** 8 ─ Transit: Štokholm → Brémy → Amsterdam */
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
    assignedDispatcher: "8",
    start: "location16", // Štokholm
    currentLocation: "location17", // Brémy
    destination: "location18", // Amsterdam
    nearestParking: "parking1",
    dashboardStatus: VehicleStatus.Transit,
    odometerKm: 0,
    capacityFree: "6 t",
    availability: "busy",
    positionColor: "O",
    onBreak: false,
  },

  /** 9 ─ Standby: Trstín */
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
    assignedDriver: "1",
    assignedDispatcher: "7",
    location: "location7", // Odpočívadlo Trstín
    dashboardStatus: VehicleStatus.Standby,
    odometerKm: 512300,
    capacityFree: "24 t",
    availability: "available",
  },

  /** 10 ─ Depot: Trnava */
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
    assignedDispatcher: "7",
    location: "location2", // Trnava
    dashboardStatus: VehicleStatus.Depot,
    odometerKm: 0,
    capacityFree: "20 t",
    availability: "available",
  },

  /** 11 ─ Inbound s break: Zaragoza → Heilbronn (parking) → Ostrava */
  {
    id: "11",
    name: "DAF Zaragoza",
    type: "tractor",
    status: "available",
    image: "/vehicles/truck5.jpg",
    brand: "DAF",
    plateNumber: "ZA-999AA",
    manufactureYear: 2021,
    capacity: "24 t",
    notes: "Inbound Spain → CZ, driver on break",
    lastService: "2025-01-10",
    nextService: "2025-07-10",
    assignedDriver: "2",
    assignedDispatcher: "8",
    start: "location25", // Zaragoza
    currentLocation: "parking1", // Heilbronn Parking
    destination: "location30", // Ostrava
    nearestParking: "parking1",
    dashboardStatus: VehicleStatus.Inbound,
    odometerKm: 198300,
    capacityFree: "3 t",
    availability: "busy",
    positionColor: "G",
    onBreak: true,
  },
];

// Trips and Services (unchanged) ...
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
  { id: 1, vehicleId: 1, date: "2023-04-21", driver: "Ján Novák", destination: "location6", status: "completed", distance: 350, fuelConsumption: 32 },
  { id: 2, vehicleId: 1, date: "2023-04-15", driver: "Ján Novák", destination: "location6", status: "completed", distance: 350, fuelConsumption: 30 },
];

export const mockServices: Service[] = [
  { id: "1", vehicleId: "1", date: "2023-03-25", type: "Pravidelný servis", status: "completed", cost: 350, description: "Výmena oleja, filtrov" },
  { id: "2", vehicleId: "1", date: "2023-01-10", type: "Technická kontrola", status: "completed", cost: 120, description: "Pravidelná STK" },
];

// Helper functions ...
export const getTripsForVehicle = (vehicleId: string): Trip[] =>
  mockTrips.filter(trip => trip.vehicleId === Number(vehicleId));

export const getServicesForVehicle = (vehicleId: string): Service[] =>
  mockServices.filter(service => service.vehicleId === vehicleId);

export const getVehiclesByStatus = (status: VehicleStatus): Vehicle[] =>
  mockVehicles.filter(vehicle => vehicle.dashboardStatus === status);

export const getDynamicVehiclesByColor = (color: "G" | "O" | "R"): Vehicle[] =>
  mockVehicles.filter(
    vehicle =>
      [VehicleStatus.Outbound, VehicleStatus.Inbound, VehicleStatus.Transit].includes(vehicle.dashboardStatus) &&
      vehicle.positionColor === color
  );
