
// File: front/src/data/mockFleet.ts
// Last change: Added type annotations for parseStatus and statusColors to fix TS7006 and TS7053, renamed speed to activity for filters


 function getTripsForVehicle(vehicleId: string): any[] {
   // Placeholder: Return empty array for trips; implement actual logic as needed
   return [];
 }

  function getServicesForVehicle(vehicleId: string): any[] {
   // Placeholder: Return empty array for services; implement actual logic as needed
   return [];
 }

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

const mockVehicles: Vehicle[] = [
  {
    id: "uuid-001",
    name: "Truck A",
    type: "truck",
    dashboardStatus: "dynamic.outbound.moving.ontime",
    speed: 60,
    currentLocation: "loc1",
    start: "loc2",
    destination: "dest1",
    image: "/vehicles/truck.jpg",
    brand: "Volvo",
    plateNumber: "BA123CD",
    manufactureYear: 2020,
    capacity: "20t",
    capacityFree: "5t",
    odometerKm: 150000,
    availability: "busy",
    assignedDriver: "Ján Novák",
    assignedDispatcher: "Peter Kováč",
    notes: "Regular maintenance scheduled",
  },
  {
    id: "uuid-002",
    name: "Van B",
    type: "van",
    dashboardStatus: "dynamic.outbound.break.ontime",
    speed: 0,
    currentLocation: "loc3",
    start: "loc1",
    destination: "dest2",
    image: "/vehicles/van.jpg",
    brand: "Mercedes",
    plateNumber: "KE456EF",
    manufactureYear: 2019,
    capacity: "3t",
    capacityFree: "1t",
    odometerKm: 80000,
    availability: "busy",
    assignedDriver: "Anna Kováčová",
    notes: "Driver on break",
  },
  {
    id: "uuid-003",
    name: "Truck C",
    type: "truck",
    dashboardStatus: "dynamic.inbound.moving.ontime",
    speed: 50,
    currentLocation: "loc4",
    start: "dest1",
    destination: "loc1",
    image: "/vehicles/truck.jpg",
    brand: "MAN",
    plateNumber: "TT789GH",
    manufactureYear: 2021,
    capacity: "18t",
    capacityFree: "4t",
    odometerKm: 120000,
    availability: "busy",
    assignedDriver: "Martin Hruška",
    notes: "",
  },
  {
    id: "uuid-004",
    name: "Van D",
    type: "van",
    dashboardStatus: "static.standby.ontime",
    speed: 0,
    currentLocation: "loc1",
    image: "/vehicles/van.jpg",
    brand: "Ford",
    plateNumber: "ZA012IJ",
    manufactureYear: 2018,
    capacity: "2.5t",
    capacityFree: "2.5t",
    odometerKm: 95000,
    availability: "available",
    notes: "Ready for assignment",
  },
  {
    id: "uuid-005",
    name: "Trailer E",
    type: "trailer",
    dashboardStatus: "static.depot.ontime",
    speed: 0,
    currentLocation: "loc5",
    image: "/vehicles/trailer.jpg",
    brand: "Schmitz",
    plateNumber: "NR345KL",
    manufactureYear: 2020,
    capacity: "25t",
    capacityFree: "25t",
    odometerKm: 50000,
    availability: "available",
    notes: "In depot",
  },
];

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

const statusColors: Record<DynamicDirection | DynamicActivity | StaticType, string> = {
  outbound: '#2389ff',
  inbound: '#ff8c00',
  transit: '#00cc00',
  moving: '#00cc00',
  waiting: '#ff8c00',
  break: '#ff0000',
  standby: '#808080',
  depot: '#4b0082',
  service: '#ff4500',
};

const delayColors: Record<Delay, string> = {
  ontime: '#00cc00',
  delayed: '#ff8c00',
  critical: '#ff0000',
};

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
    
}
export type { Vehicle }