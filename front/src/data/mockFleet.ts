// File: front/src/data/mockFleet.ts
// Last change: Added updated colors and complete vehicle data structure

import { mockPeople, getTripsForPerson } from './mockPeople';

// Define filter categories
const DYNAMIC_ACTIVITIES = ['moving', 'waiting', 'break'] as const;
const DYNAMIC_DIRECTIONS = ['outbound', 'inbound', 'transit'] as const;
const STATIC_TYPES = ['standby', 'depot', 'service'] as const;
const DELAYS = ['ontime', 'delayed', 'critical'] as const;

// Define types
type DynamicActivity = typeof DYNAMIC_ACTIVITIES[number];
type DynamicDirection = typeof DYNAMIC_DIRECTIONS[number];
type StaticType = typeof STATIC_TYPES[number];
type Delay = typeof DELAYS[number];

interface DynamicStatus {
  category: 'dynamic';
  direction: DynamicDirection;
  activity: DynamicActivity;
  delay: Delay;
}

interface StaticStatus {
  category: 'static';
  type: StaticType;
  delay: Delay;
}

type Status = DynamicStatus | StaticStatus;

interface Vehicle {
  id: string;
  name: string;
  type: string;
  dashboardStatus: string;
  speed: number;
  currentLocation?: string;
  location?: string;
  start?: string;
  destination?: string;
  nearestParking?: string;
  image: string;
  brand: string;
  plateNumber: string;
  manufactureYear: number;
  capacity: string;
  capacityFree: string;
  odometerKm: number;
  availability: string;
  assignedDriver?: string;
  assignedDispatcher?: string;
  notes: string;
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

// Updated status colors with your preferences
const statusColors: Record<DynamicDirection | DynamicActivity | StaticType, string> = {
  // Direction (3)
  outbound: "#2389ff",    // Blue
  inbound: "#1fbac7",     // Turquoise  
  transit: "#7a63ff",     // Purple
  
  // Activity/Speed (3)
  moving: "#d726ff",      // Magenta
  waiting: "#64748b",     // Gray-blue (UPDATED)
  break: "#1e3a8a",       // Dark blue - parking sign color (UPDATED)
  
  // Static (3)
  standby: "#b5bd00",     // Yellow-green (kept original)
  depot: "#8B4513",       // Brown (UPDATED)
  service: "#e91e40",     // Red-magenta
};

const delayColors: Record<Delay, string> = {
  ontime: "#4CAF50",      // Green
  delayed: "#FF9800",     // Orange  
  critical: "#F44336",    // Red
};

// 10 vehicles with full status format covering all 9 filters
const mockVehicles: Vehicle[] = [
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
    location: "Bratislava",
    start: "location4",
    currentLocation: "location32",
    destination: "location13",
    nearestParking: "parking3",
    dashboardStatus: "dynamic.outbound.moving.ontime",
    speed: 80,
    image: "/vehicles/van1.jpg",
  },
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
    start: "location21",
    currentLocation: "location5", 
    destination: "location2",
    nearestParking: "parking7",
    dashboardStatus: "dynamic.inbound.moving.delayed",
    speed: 85,
    image: "/vehicles/truck2.jpg",
  },
  {
    id: "3",
    name: "DAF XF Euro 6",
    type: "truck",
    plateNumber: "TT-333TT",
    brand: "DAF",
    manufactureYear: 2020,
    capacity: "24t",
    capacityFree: "0t",
    odometerKm: 388900,
    availability: "busy",
    notes: "Transit DE → CZ - on time",
    assignedDriver: "3",
    assignedDispatcher: "7",
    location: "Munich",
    start: "location14",
    currentLocation: "location15",
    destination: "location6", 
    nearestParking: "parking4",
    dashboardStatus: "dynamic.transit.moving.ontime",
    speed: 90,
    image: "/vehicles/truck3.jpg",
  },
  {
    id: "4",
    name: "Volvo FH16",
    type: "truck",
    plateNumber: "ZA-789ZZ", 
    brand: "Volvo",
    manufactureYear: 2021,
    capacity: "24t",
    capacityFree: "24t",
    odometerKm: 210000,
    availability: "busy",
    notes: "Second moving vehicle - delayed",
    assignedDriver: "3",
    assignedDispatcher: "7",
    location: "Košice",
    start: "location16",
    currentLocation: "location17",
    destination: "location18",
    nearestParking: "parking6",
    dashboardStatus: "dynamic.outbound.moving.delayed",
    speed: 75,
    image: "/vehicles/truck1.jpg",
  },
  {
    id: "5",
    name: "Renault Master",
    type: "van",
    plateNumber: "KE-987TT",
    brand: "Renault",
    manufactureYear: 2020,
    capacity: "1.3t",
    capacityFree: "0t",
    odometerKm: 99100,
    availability: "busy",
    notes: "Waiting for documents - delayed",
    assignedDriver: "2",
    assignedDispatcher: "8",
    location: "Montabaur",
    start: "location4",
    currentLocation: "location10",
    destination: "location11",
    nearestParking: "parking5",
    dashboardStatus: "dynamic.outbound.waiting.delayed",
    speed: 0,
    image: "/vehicles/van3.jpg",
  },
  {
    id: "6",
    name: "DAF Zaragoza",
    type: "truck",
    plateNumber: "ZA-999AA",
    brand: "DAF",
    manufactureYear: 2021,
    capacity: "24t",
    capacityFree: "3t",
    odometerKm: 198300,
    availability: "busy",
    notes: "Spain → CZ, driver on break - on time",
    assignedDriver: "2",
    assignedDispatcher: "8",
    location: "Rest Area A6",
    start: "location25",
    currentLocation: "parking1",
    destination: "location30",
    nearestParking: "parking1",
    dashboardStatus: "dynamic.inbound.break.ontime",
    speed: 0,
    image: "/vehicles/truck5.jpg",
  },
  {
    id: "7",
    name: "Trailer Low-bed",
    type: "trailer",
    plateNumber: "TR-456CD",
    brand: "Schmitz", 
    manufactureYear: 2019,
    capacity: "18t",
    capacityFree: "18t",
    odometerKm: 0,
    availability: "available",
    notes: "Waiting for load in Dortmund - on time",
    assignedDispatcher: "8",
    location: "Dortmund",
    dashboardStatus: "static.standby.ontime",
    speed: 0,
    image: "/vehicles/trailer2.jpg",
  },
  {
    id: "8",
    name: "Iveco Daily",
    type: "van",
    plateNumber: "PN-456YY",
    brand: "Iveco",
    manufactureYear: 2021,
    capacity: "1.2t",
    capacityFree: "1.2t",
    odometerKm: 43300,
    availability: "available",
    notes: "Parked in depot - on time",
    assignedDriver: "4",
    assignedDispatcher: "7",
    location: "Žilina Depot",
    dashboardStatus: "static.depot.ontime",
    speed: 0,
    image: "/vehicles/van2.jpg",
  },
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
    location: "Service Trnava",
    dashboardStatus: "static.service.delayed",
    speed: 0,
    image: "/vehicles/truck4.jpg",
  },
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
    availability: "busy",
    notes: "Transit vehicle - delayed",
    assignedDriver: "5",
    assignedDispatcher: "8",
    location: "Vienna",
    start: "location28",
    currentLocation: "location29", 
    destination: "location30",
    nearestParking: "parking8",
    dashboardStatus: "dynamic.transit.moving.delayed",
    speed: 70,
    image: "/vehicles/truck6.jpg",
  },
];

// Helper function to parse status for filtering
function parseStatus(status: string): Status {
  const parts = status.split('.');
  if (parts[0] === 'dynamic') {
    return {
      category: 'dynamic',
      direction: parts[1] as DynamicDirection,
      activity: parts[2] as DynamicActivity,
      delay: parts[3] as Delay,
    };
  }
  return {
    category: 'static',
    type: parts[1] as StaticType,
    delay: parts[2] as Delay,
  };
}

// Color helper functions
function getDirectionColor(status: string): string {
  const parsed = parseStatus(status);
  if (parsed.category === 'dynamic') {
    return statusColors[parsed.direction] || '#808080';
  }
  return statusColors[parsed.type] || '#808080';
}

function getDelayColor(status: string): string {
  const parsed = parseStatus(status);
  return delayColors[parsed.delay] || '#808080';
}

function getTripsForVehicle(vehicleId: string): Trip[] {
  const assignedPeople = mockPeople.filter(person => person.vehicle === vehicleId);
  const trips: Trip[] = [];
  assignedPeople.forEach(person => {
    const personTrips = getTripsForPerson(person.id);
    // Map mockPeople.Trip to mockFleet.Trip format
    const mappedTrips = personTrips.map(trip => ({
      ...trip,
      // personId already exists, no need to change
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
  return services.filter(() => Math.random() > 0.4); // Random selection for demo
}

// Export everything needed
export {
  DYNAMIC_ACTIVITIES,
  DYNAMIC_DIRECTIONS,
  STATIC_TYPES,
  DELAYS,
  mockVehicles,
  parseStatus,
  statusColors,
  delayColors,
  getDirectionColor,
  getDelayColor,
  getTripsForVehicle,
  getServicesForVehicle,
};

export type { Vehicle, Trip, Service };