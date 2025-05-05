// File: front/src/data/mockFleet.ts
// Last change: Added odometerKm, capacityFree, availability to Vehicle interface and mock data

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
  odometerKm: number;        // current odometer reading in kilometers
  capacityFree: string;      // free capacity remaining (e.g. "0.5t")
  availability: string;      // availability status (e.g. "available", "busy")
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
    type: "Dodávka",
    status: "Pripravená",
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
  },
  {
    id: "2",
    name: "Dodávka skriňa biela",
    type: "Dodávka",
    status: "Na trase",
    image: "/vehicles/van2.jpg",
    brand: "Peugeot",
    plateNumber: "KE456YY",
    manufactureYear: 2020,
    capacity: "1.2t",
    notes: "Chladiarenská úprava, vhodná pre potraviny",
    lastService: "2023-04-10",
    nextService: "2023-08-10",
    driver: "Peter Malý",
    location: "Košice",
    dashboardStatus: "import",
    odometerKm: 98500,
    capacityFree: "0.4t",
    availability: "busy",
  },
  {
    id: "3",
    name: "Ťahač biely",
    type: "Ťahač",
    status: "Servis",
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
  },
  {
    id: "4",
    name: "Sklápač modrý",
    type: "Sklápač",
    status: "Pripravená",
    image: "/vehicles/dumper1.jpg",
    brand: "MAN",
    plateNumber: "TN234AA",
    manufactureYear: 2018,
    capacity: "15t",
    notes: "Stavebný materiál, štrk, piesok",
    lastService: "2023-02-20",
    nextService: "2023-06-20",
    driver: "Matej Ostrý",
    location: "Trenčín",
    dashboardStatus: "ready",
    odometerKm: 156000,
    capacityFree: "8t",
    availability: "available",
  },
  {
    id: "5",
    name: "Dodávka korba",
    type: "Dodávka",
    status: "Parkovisko",
    image: "/vehicles/van3.jpg",
    brand: "Fiat",
    plateNumber: "PO567BB",
    manufactureYear: 2017,
    capacity: "1.1t",
    notes: "Vhodná na prepravu materiálu, otvorená korba",
    lastService: "2023-03-10",
    nextService: "2023-07-10",
    driver: "David Šikovný",
    location: "Prešov",
    dashboardStatus: "base",
    odometerKm: 178000,
    capacityFree: "0.9t",
    availability: "available",
  },
  {
    id: "6",
    name: "Auto plachta",
    type: "Nákladné",
    status: "Na trase",
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
  },
];

export const mockTrips: Trip[] = [
  { id: 1, vehicleId: 1, date: "2023-04-21", driver: "Karol Veľký", destination: "Praha", status: "Ukončená", distance: 350, fuelConsumption: 32 },
  { id: 2, vehicleId: 1, date: "2023-04-15", driver: "Ján Novák", destination: "Praha", status: "Ukončená", distance: 350, fuelConsumption: 30 },
  // ... other trips ...
];

export const mockServices: Service[] = [
  { id: "1", vehicleId: "1", date: "2023-03-25", type: "Pravidelný servis", status: "Hotový", cost: 350, description: "Výmena oleja, filtrov" },
  { id: "2", vehicleId: "1", date: "2023-01-10", type: "Technická kontrola", status: "Hotový", cost: 120, description: "Pravidelná STK" },
  // ... other services ...
];

// Helper functions for data retrieval
export const getTripsForVehicle = (vehicleId: string): Trip[] =>
  mockTrips.filter(trip => trip.vehicleId === Number(vehicleId));

export const getServicesForVehicle = (vehicleId: string): Service[] =>
  mockServices.filter(service => service.vehicleId === vehicleId);
