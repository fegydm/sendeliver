// File: front/src/data/mockFleet.ts
// Last change: Added trailerIds and associatedTractorId to Vehicle interface and mock data

export interface Vehicle {
  id: string;
  name: string;
  type: string;
  status: string;
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
  dashboardStatus?: "export" | "import" | "ready" | "base";
  odometerKm: number;
  capacityFree: string;
  availability: string;
  // For coupling
  trailerIds?: string[];           // for tractors: list of attached trailers
  associatedTractorId?: string;    // for trailers: attached tractor
}

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

export const mockVehicles: Vehicle[] = [
  {
    id: "1",
    name: "Dodávka plachta titrol",
    type: "van",
    status: "available",
    image: "/vehicles/van1.jpg",
    brand: "Mercedes",
    plateNumber: "BA123XX",
    manufactureYear: 2019,
    capacity: "1.5t",
    notes: "Vhodná na menšie náklady, dosah celá EU",
    lastService: "2023-03-15",
    nextService: "2023-07-15",
    driver: "Ján Novák",
    location: "Bratislava",
    dashboardStatus: "export",
    odometerKm: 124500,
    capacityFree: "0.7t",
    availability: "available",
    // no coupling for simple vans
  },
  {
    id: "2",
    name: "Trailer XYZ",
    type: "trailer",
    status: "available",
    image: "/vehicles/trailer1.jpg",
    brand: "Krone",
    plateNumber: "TR123AB",
    manufactureYear: 2018,
    capacity: "24t",
    notes: "Standardný náves",
    lastService: "2023-02-20",
    nextService: "2023-06-20",
    driver: undefined,
    location: "",
    dashboardStatus: "base",
    odometerKm: 0,
    capacityFree: "24t",
    availability: "available",
    associatedTractorId: "3",
  },
  {
    id: "3",
    name: "Ťahač biely",
    type: "tractor",
    status: "service",
    image: "/vehicles/truck1.jpg",
    brand: "Volvo",
    plateNumber: "ZA789ZZ",
    manufactureYear: 2021,
    capacity: "24t",
    notes: "Dlhé trasy, vhodný na medzinárodnú prepravu",
    lastService: "2023-04-01",
    nextService: "2023-04-15",
    driver: "Roman Silný",
    location: "Žilina",
    dashboardStatus: "base",
    odometerKm: 210000,
    capacityFree: "12t",
    availability: "service",
    trailerIds: ["2"],
  },
  {
    id: "4",
    name: "Trailer ABC",
    type: "trailer",
    status: "available",
    image: "/vehicles/trailer2.jpg",
    brand: "Schmitz",
    plateNumber: "TR456CD",
    manufactureYear: 2019,
    capacity: "18t",
    notes: "Low-bed náves",
    lastService: "2023-03-10",
    nextService: "2023-07-10",
    driver: undefined,
    location: "",
    dashboardStatus: "base",
    odometerKm: 0,
    capacityFree: "18t",
    availability: "available",
    associatedTractorId: "3",
  },
  {
    id: "5",
    name: "Scania R500",
    type: "tractor",
    status: "available",
    image: "/vehicles/truck2.jpg",
    brand: "Scania",
    plateNumber: "NR890CC",
    manufactureYear: 2022,
    capacity: "18t",
    notes: "Nové vozidlo, vhodné na dlhé trasy",
    lastService: "2023-03-15",
    nextService: "2023-07-15",
    driver: "Patrik Múdry",
    location: "Nitra",
    dashboardStatus: "import",
    odometerKm: 45000,
    capacityFree: "10t",
    availability: "busy",
    trailerIds: [],  // currently no attached trailers
  },
];

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
