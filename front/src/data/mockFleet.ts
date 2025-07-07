// File: front/src/data/mockFleet.ts
// Last change: Complete mockFleet with corrected routes and locations

import { mockPeople, getTripsForPerson } from './mockPeople';

// Basic types only
interface Vehicle {
  id: string;
  name: string;
  type: string;
  image: string;
  brand: string;
  plateNumber: string;
  manufactureYear: number;
  capacity: string;
  capacityFree: string;
  odometerKm: number;
  notes: string;

  // Vlastnosť z vašej pochybnosti, pridávame ju pre flexibilitu
  status?: string; 

  // Vlastnosť, ktorú hlásil TypeScript ako chýbajúcu
  driver?: string;

  // Prevádzkové stavy (vylepšené typy)
  availability: 'available' | 'busy' | 'service';
  dashboardStatus: string; 
  speed: number;

  // GPS a lokalizačné dáta
  location?: string;
  currentLocation?: string;
  gpsLocation?: { latitude: number; longitude: number };
  start?: string;
  destination?: string;
  nearestParking?: string;
  
  // Priradenia
  assignedDriver?: string;
  assignedDispatcher?: string;
}

interface Trip {
  id: string;
  date: string;
  vehicle: string;
  destination: string;
  status: string;
  distance: number;
  duration: number;
  personId: string;  
}

interface Service {
  id: string;
  date: string;
  type: string;
  status: string;
}

// Complete vehicle data - 10 vehicles (6 dynamic + 4 static)
const mockVehicles: Vehicle[] = [
  // ===== DYNAMIC VEHICLES (6) =====
  
  // OUTBOUND 1: Žilina → Wroclaw → Poznań (moving, ontime)
  {
    id: "1",
    name: "Sprinter 311", 
    type: "van",
    plateNumber: "BA-123XX",
    brand: "Mercedes",
    manufactureYear: 2019,
    capacity: "1.5t",
    capacityFree: "0t",
    odometerKm: 148200,
    availability: "busy",
    notes: "Export to Poland - on time",
    assignedDriver: "1",
    assignedDispatcher: "7",
    location: "Žilina",
    start: "location4", // Žilina
    currentLocation: "location12", // Wroclaw  
    destination: "location13", // Poznań
    nearestParking: "parking3",
    dashboardStatus: "dynamic.outbound.moving.ontime",
    speed: 80,
    image: "/vehicles/van1.jpg",
  },

  // INBOUND 1: Berlin → Brno → Trnava (moving, delayed)
  {
    id: "2",
    name: "Scania R500",
    type: "truck", 
    plateNumber: "NR-890CC",
    brand: "Scania",
    manufactureYear: 2022,
    capacity: "18t",
    capacityFree: "6t",
    odometerKm: 67500,
    availability: "busy",
    notes: "Return load DE → SK - delayed",
    assignedDriver: "6",
    assignedDispatcher: "8",
    location: "Berlin",
    start: "location21", // Berlin
    currentLocation: "location5", // Brno
    destination: "location2", // Trnava
    nearestParking: "parking7",
    dashboardStatus: "dynamic.inbound.moving.delayed",
    speed: 85,
    image: "/vehicles/truck2.jpg",
  },

  // TRANSIT 1: Stockholm → Bremen → Amsterdam (waiting, ontime)
  {
    id: "3",
    name: "Iveco Daily",
    type: "van",
    plateNumber: "ZA-456BB",
    brand: "Iveco",
    manufactureYear: 2020,
    capacity: "2.5t",
    capacityFree: "1t",
    odometerKm: 98700,
    availability: "busy",
    notes: "Transit route - waiting at border",
    assignedDriver: "2",
    assignedDispatcher: "7",
    location: "Stockholm",
    start: "location16", // Stockholm
    currentLocation: "location17", // Bremen
    destination: "location18", // Amsterdam
    nearestParking: "parking6",
    dashboardStatus: "dynamic.transit.waiting.ontime",
    speed: 0,
    image: "/vehicles/van2.jpg",
  },

  // OUTBOUND 2: Žilina → Montabaur → Köln (break, ontime)  
  {
    id: "4",
    name: "Volvo FH16",
    type: "truck",
    plateNumber: "TT-789DD",
    brand: "Volvo",
    manufactureYear: 2021,
    capacity: "25t",
    capacityFree: "10t",
    odometerKm: 125400,
    availability: "busy",
    notes: "Outbound - driver break",
    assignedDriver: "3",
    assignedDispatcher: "8",
    location: "Žilina",
    start: "location4", // Žilina
    currentLocation: "location10", // Montabaur
    destination: "location11", // Köln
    nearestParking: "parking5",
    dashboardStatus: "dynamic.outbound.break.ontime",
    speed: 0,
    image: "/vehicles/truck3.jpg",
  },

  // INBOUND 2: Zaragoza → Heilbronn Parking → Ostrava (waiting, delayed)
  {
    id: "5",
    name: "Mercedes Actros",
    type: "truck",
    plateNumber: "KE-321EE",
    brand: "Mercedes",
    manufactureYear: 2023,
    capacity: "22t",
    capacityFree: "0t",
    odometerKm: 45600,
    availability: "busy",
    notes: "Inbound - waiting for loading",
    assignedDriver: "4",
    assignedDispatcher: "7",
    location: "Zaragoza",
    start: "location25", // Zaragoza
    currentLocation: "parking1", // Heilbronn Parking
    destination: "location30", // Ostrava
    nearestParking: "parking1",
    dashboardStatus: "dynamic.inbound.waiting.delayed",
    speed: 0,
    image: "/vehicles/truck4.jpg",
  },

  // TRANSIT 2: Wels → Plzeň → Praha (moving, delayed)
  {
    id: "6",
    name: "DAF XF",
    type: "truck",
    plateNumber: "PO-654FF",
    brand: "DAF",
    manufactureYear: 2020,
    capacity: "20t",
    capacityFree: "8t",
    odometerKm: 178900,
    availability: "busy",
    notes: "Transit - moving through Austria",
    assignedDriver: "5",
    assignedDispatcher: "8",
    location: "Wels",
    start: "location20", // Wels (namiesto Innsbruck)
    currentLocation: "location15", // Plzeň
    destination: "location6", // Praha
    nearestParking: "parking4",
    dashboardStatus: "dynamic.transit.moving.delayed",
    speed: 75,
    image: "/vehicles/truck5.jpg",
  },

  // ===== STATIC VEHICLES (4) =====

  // STANDBY 1: Dortmund (ontime)
  {
    id: "7",
    name: "Ford Transit",
    type: "van",
    plateNumber: "LC-987GG",
    brand: "Ford",
    manufactureYear: 2019,
    capacity: "1.2t",
    capacityFree: "1.2t",
    odometerKm: 156700,
    availability: "available",
    notes: "Ready for dispatch",
    assignedDispatcher: "7",
    location: "location9", // Standby Dortmund
    dashboardStatus: "static.standby.ontime",
    speed: 0,
    image: "/vehicles/van3.jpg",
  },

  // DEPOT: Žilina (delayed)
  {
    id: "8",
    name: "Renault Master",
    type: "van",
    plateNumber: "TN-147HH",
    brand: "Renault",
    manufactureYear: 2022,
    capacity: "1.8t",
    capacityFree: "1.8t",
    odometerKm: 23400,
    availability: "available",
    notes: "Parked at depot - delayed maintenance",
    location: "location4", // Výrobný závod Žilina
    dashboardStatus: "static.depot.delayed",
    speed: 0,
    image: "/vehicles/van4.jpg",
  },

  // SERVICE: Košice (delayed) - pripravené na GPS
  {
    id: "9",
    name: "MAN TGX Service",
    type: "truck",
    plateNumber: "BA-652AA",
    brand: "MAN",
    manufactureYear: 2018,
    capacity: "24t",
    capacityFree: "24t",
    odometerKm: 512300,
    availability: "service",
    notes: "Brake repair - delayed",
    assignedDriver: "1",
    assignedDispatcher: "7",
    location: "location3", // Obchodné centrum Košice
    dashboardStatus: "static.service.delayed",
    speed: 0,
    image: "/vehicles/truck4.jpg",
  },

  // STANDBY 2: Bratislava (delayed)
  {
    id: "10",
    name: "Mercedes Transit",
    type: "truck",
    plateNumber: "BB-111BB",
    brand: "Mercedes",
    manufactureYear: 2023,
    capacity: "20t",
    capacityFree: "5t",
    odometerKm: 89000,
    availability: "available",
    notes: "Moved to standby - delayed dispatch",
    assignedDispatcher: "8",
    location: "location1", // Hlavný sklad Bratislava
    dashboardStatus: "static.standby.delayed",
    speed: 0,
    image: "/vehicles/truck6.jpg",
  },
];

// Helper functions for getting related data
function getTripsForVehicle(vehicleId: string): Trip[] {
  const assignedPeople = mockPeople.filter(person => person.vehicle === vehicleId);
  const trips: Trip[] = [];
  assignedPeople.forEach(person => {
    const personTrips = getTripsForPerson(person.id);
    const mappedTrips = personTrips.map(trip => ({
      ...trip,
    }));
    trips.push(...mappedTrips);
  });
  return trips;
}

function getServicesForVehicle(vehicleId: string): Service[] {
  const services: Service[] = [
    { id: `${vehicleId}-s1`, date: "2024-01-10", type: "Oil change", status: "Completed" },
    { id: `${vehicleId}-s2`, date: "2024-01-25", type: "Brake check", status: "Scheduled" },
    { id: `${vehicleId}-s3`, date: "2024-02-05", type: "Tire rotation", status: "Pending" },
  ];
  return services.filter(() => Math.random() > 0.4);
}

export {
  mockVehicles,
  getTripsForVehicle,
  getServicesForVehicle,
};

export type { Vehicle, Trip, Service };