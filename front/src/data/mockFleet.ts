// File: front/src/data/mockFleet.ts
// Last change: Added dashboardStatus to each vehicle for dashboard overrides

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
  dashboardStatus?: "export" | "import" | "ready" | "base";
}

export interface Trip {
  id: string;
  vehicleId: string;
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
  },
];

export const mockTrips: Trip[] = [
  { id: "1", vehicleId: "1", date: "2023-04-21", driver: "Karol Veľký", destination: "Praha", status: "Ukončená", distance: 350, fuelConsumption: 32 },
  { id: "2", vehicleId: "1", date: "2023-04-15", driver: "Ján Novák", destination: "Praha", status: "Ukončená", distance: 350, fuelConsumption: 30 },
  { id: "3", vehicleId: "1", date: "2023-04-10", driver: "Peter Malý", destination: "Viedeň", status: "Ukončená", distance: 80, fuelConsumption: 8 },
  { id: "4", vehicleId: "1", date: "2023-04-01", driver: "Tomáš Horký", destination: "Budapešť", status: "Ukončená", distance: 200, fuelConsumption: 20 },
  { id: "5", vehicleId: "2", date: "2023-04-20", driver: "Michal Dlhý", destination: "Brno", status: "Ukončená", distance: 130, fuelConsumption: 12 },
  { id: "6", vehicleId: "2", date: "2023-04-12", driver: "Jakub Rýchly", destination: "Ostrava", status: "Ukončená", distance: 170, fuelConsumption: 15 },
  { id: "7", vehicleId: "3", date: "2023-03-25", driver: "Roman Silný", destination: "Berlín", status: "Ukončená", distance: 580, fuelConsumption: 170 },
  { id: "8", vehicleId: "3", date: "2023-03-15", driver: "Roman Silný", destination: "Varšava", status: "Ukončená", distance: 650, fuelConsumption: 190 },
  { id: "9", vehicleId: "4", date: "2023-04-20", driver: "Matej Ostrý", destination: "Žilina", status: "Ukončená", distance: 80, fuelConsumption: 25 },
  { id: "10", vehicleId: "4", date: "2023-04-15", driver: "Matej Ostrý", destination: "Banská Bystrica", status: "Ukončená", distance: 110, fuelConsumption: 32 },
  { id: "11", vehicleId: "5", date: "2023-04-10", driver: "David Šikovný", destination: "Košice", status: "Ukončená", distance: 250, fuelConsumption: 22 },
  { id: "12", vehicleId: "5", date: "2023-04-05", driver: "David Šikovný", destination: "Prešov", status: "Ukončená", distance: 270, fuelConsumption: 24 },
  { id: "13", vehicleId: "6", date: "2023-04-18", driver: "Patrik Múdry", destination: "Mnichov", status: "Ukončená", distance: 450, fuelConsumption: 120 },
  { id: "14", vehicleId: "6", date: "2023-04-05", driver: "Patrik Múdry", destination: "Frankfurt", status: "Ukončená", distance: 680, fuelConsumption: 180 }
];

export const mockServices: Service[] = [
  { id: "1", vehicleId: "1", date: "2023-03-25", type: "Pravidelný servis", status: "Hotový", cost: 350, description: "Výmena oleja, filtrov" },
  { id: "2", vehicleId: "1", date: "2023-01-10", type: "Technická kontrola", status: "Hotový", cost: 120, description: "Pravidelná STK" },
  { id: "3", vehicleId: "2", date: "2023-03-15", type: "Pravidelný servis", status: "Hotový", cost: 320, description: "Výmena oleja, kontrola bŕzd" },
  { id: "4", vehicleId: "2", date: "2023-02-05", type: "Oprava", status: "Hotový", cost: 580, description: "Výmena alternátora" },
  { id: "5", vehicleId: "3", date: "2023-04-01", type: "Servis", status: "V procese", cost: 1200, description: "Generálna oprava motora" },
  { id: "6", vehicleId: "3", date: "2023-02-15", type: "Pravidelný servis", status: "Hotový", cost: 450, description: "Výmena oleja, filtrov, kontrola hydrauliky" },
  { id: "7", vehicleId: "4", date: "2023-02-20", type: "Technická kontrola", status: "Hotový", cost: 150, description: "STK + emisná kontrola" },
  { id: "8", vehicleId: "4", date: "2023-01-05", type: "Pravidelný servis", status: "Hotový", cost: 420, description: "Výmena oleja, kontrola hydrauliky sklápača" },
  { id: "9", vehicleId: "5", date: "2023-03-10", type: "Oprava", status: "Hotový", cost: 280, description: "Oprava elektroinštalácie" },
  { id: "10", vehicleId: "5", date: "2023-01-20", type: "Pravidelný servis",	status: "Hotový", cost: 310, description: "Výmena oleja, filtrov" },
  { id: "11", vehicleId: "6", date: "2023-03-15", type: "Pravidelný servis", status: "Hotový", cost: 520,	description: "Kompletný servis - olej, filtre, brzdy" },
  { id: "12", vehicleId: "6", date: "2023-02-01", type: "Technická kontrola",	status: "Hotový", cost: 130, description: "STK + emisná kontrola" }
];

// Helper functions for data retrieval
export const getTripsForVehicle = (vehicleId: string): Trip[] => {
  return mockTrips.filter(trip => trip.vehicleId === vehicleId);
};

export const getServicesForVehicle = (vehicleId: string): Service[] => {
  return mockServices.filter(service => service.vehicleId === vehicleId);
};
