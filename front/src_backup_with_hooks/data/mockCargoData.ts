// File: front/src/data/mockCargoData.ts
// Last change: Created simplified cargo mock data for hauler result table

export interface CargoResultData {
  id: string;
  pickup: string;           // "Bratislava, SK"
  destination: string;      // "Wien, AT"
  distance: number;         // km
  cargoType: string;        // "Electronics", "Food", "Machinery"
  weight: number;           // kg
  price: number;            // EUR
  deadline: string;         // "2025-07-25"
  client: string;           // Company name
  status: 'available' | 'bidding' | 'urgent';
  vehicleType: string;      // "artic", "rigid", "box"
  pallets?: number;         // Optional pallet count
  postedTime: string;       // "2 hours ago"
}

export const CARGO_MOCK_DATA: CargoResultData[] = [
  {
    id: "CARGO_001",
    pickup: "Bratislava, SK",
    destination: "Wien, AT", 
    distance: 65,
    cargoType: "Electronics",
    weight: 2500,
    price: 450,
    deadline: "2025-07-25",
    client: "Samsung Slovakia",
    status: "available",
    vehicleType: "artic",
    pallets: 15,
    postedTime: "2 hours ago"
  },
  {
    id: "CARGO_002", 
    pickup: "Košice, SK",
    destination: "Kraków, PL",
    distance: 95,
    cargoType: "Food Products",
    weight: 1800,
    price: 380,
    deadline: "2025-07-24",
    client: "Tesco Distribution",
    status: "urgent",
    vehicleType: "rigid",
    pallets: 12,
    postedTime: "30 min ago"
  },
  {
    id: "CARGO_003",
    pickup: "Žilina, SK", 
    destination: "Praha, CZ",
    distance: 350,
    cargoType: "Machinery Parts",
    weight: 4200,
    price: 680,
    deadline: "2025-07-26",
    client: "Škoda Auto",
    status: "available", 
    vehicleType: "artic",
    pallets: 8,
    postedTime: "1 hour ago"
  },
  {
    id: "CARGO_004",
    pickup: "Martin, SK",
    destination: "Budapest, HU", 
    distance: 180,
    cargoType: "Textiles",
    weight: 900,
    price: 320,
    deadline: "2025-07-25",
    client: "H&M Slovakia",
    status: "bidding",
    vehicleType: "box",
    pallets: 6,
    postedTime: "4 hours ago" 
  },
  {
    id: "CARGO_005",
    pickup: "Banská Bystrica, SK",
    destination: "Ljubljana, SI",
    distance: 420,
    cargoType: "Medical Supplies", 
    weight: 600,
    price: 580,
    deadline: "2025-07-24",
    client: "Pfizer CEE",
    status: "urgent",
    vehicleType: "box",
    pallets: 4,
    postedTime: "45 min ago"
  },
  {
    id: "CARGO_006", 
    pickup: "Trenčín, SK",
    destination: "Brno, CZ",
    distance: 125,
    cargoType: "Automotive Parts",
    weight: 3100,
    price: 420,
    deadline: "2025-07-26", 
    client: "Continental Slovakia",
    status: "available",
    vehicleType: "rigid",
    pallets: 10,
    postedTime: "3 hours ago"
  }
];

// Generate placeholder cargo data for development
const generatePlaceholderCargo = (): CargoResultData => {
  const routes = [
    { pickup: "Bratislava, SK", destination: "Wien, AT", distance: 65 },
    { pickup: "Košice, SK", destination: "Debrecen, HU", distance: 85 },
    { pickup: "Žilina, SK", destination: "Ostrava, CZ", distance: 95 },
  ];
  
  const cargoTypes = ["Electronics", "Food Products", "Machinery", "Textiles", "Medical"];
  const clients = ["Samsung", "Tesco", "Škoda", "H&M", "Pfizer"];
  const vehicleTypes = ["artic", "rigid", "box"];
  const statuses: ('available' | 'bidding' | 'urgent')[] = ["available", "bidding", "urgent"];
  
  const route = routes[Math.floor(Math.random() * routes.length)];
  const cargoType = cargoTypes[Math.floor(Math.random() * cargoTypes.length)];
  
  return {
    id: `CARGO_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    pickup: route.pickup,
    destination: route.destination,
    distance: route.distance,
    cargoType,
    weight: Math.floor(Math.random() * 4000) + 500,
    price: Math.floor(Math.random() * 600) + 200,
    deadline: "2025-07-25",
    client: clients[Math.floor(Math.random() * clients.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    vehicleType: vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)],
    pallets: Math.floor(Math.random() * 20) + 4,
    postedTime: `${Math.floor(Math.random() * 6) + 1} hours ago`
  };
};

// Export placeholder data for when no real data is available
export const PLACEHOLDER_CARGO_DATA: CargoResultData[] = Array(3)
  .fill(null)
  .map(() => generatePlaceholderCargo());