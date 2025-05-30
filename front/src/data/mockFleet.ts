// File: front/src/data/mockFleet.ts
// Last change: Added gpsLocation for vehicle with static.service status

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
  gpsLocation?: { latitude: number; longitude: number };
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
  standby: "#b5bd00",     // Yellow-green
  depot: "#8B4513",       // Brown
  service: "#e91e40",     // Red-magenta
};

const delayColors: Record<Delay, string> = {
  ontime: "#4CAF50",      // Green
  delayed: "#FF9800",     // Orange  
  critical: "#F44336",    // Red
};

// 10 vehicles with full status format covering all 9 filters
const mockVehicles: Vehicle[] = [
  // 6 dynamic vehicles
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
    availability: "available",
    notes: "Moved to standby",
    assignedDispatcher: "8",
    location: "Vienna",
    dashboardStatus: "static.standby.ontime",
    speed: 0,
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