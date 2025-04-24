// File: ./front/src/data/mockPeople.ts
// Last change: Created mock data for people management

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  status: string;
  image: string;
  email: string;
  phone: string;
  birthDate: string;
  licenseNumber?: string;
  licenseExpiry?: string;
  licenseType?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  country?: string;
  joinDate: string;
  vehicle?: string;
  notes?: string;
}

export interface Trip {
  id: string;
  personId: string;
  date: string;
  vehicle: string;
  destination: string;
  status: string;
  distance: number;
  duration: number;
}

export interface Document {
  id: string;
  personId: string;
  date: string;
  type: string;
  number: string;
  validUntil: string;
  file?: string;
  description: string;
}

export const mockPeople: Person[] = [
  { 
    id: "1", 
    firstName: "Ján", 
    lastName: "Novák", 
    position: "Vodič", 
    status: "Aktívny", 
    image: "/people/driver1.jpg", 
    email: "jan.novak@sendeliver.com",
    phone: "+421 903 123 456",
    birthDate: "1985-06-12",
    licenseNumber: "SK12345678",
    licenseExpiry: "2026-06-11",
    licenseType: "C+E",
    address: "Hlavná 123",
    city: "Bratislava",
    zipCode: "82105",
    country: "Slovensko",
    joinDate: "2020-03-15",
    vehicle: "Dodávka plachta titrol",
    notes: "Skúsený vodič s výbornými referenciami"
  },
  { 
    id: "2", 
    firstName: "Peter", 
    lastName: "Malý", 
    position: "Vodič", 
    status: "Aktívny", 
    image: "/people/driver2.jpg", 
    email: "peter.maly@sendeliver.com",
    phone: "+421 905 234 567",
    birthDate: "1990-11-23",
    licenseNumber: "SK87654321",
    licenseExpiry: "2025-11-22",
    licenseType: "B",
    address: "Železničná 45",
    city: "Košice",
    zipCode: "04001",
    country: "Slovensko",
    joinDate: "2021-05-10",
    vehicle: "Dodávka skriňa biela",
    notes: "Preferuje trasy do Českej republiky a Poľska"
  },
  { 
    id: "3", 
    firstName: "Roman", 
    lastName: "Silný", 
    position: "Vodič", 
    status: "Dovolenka", 
    image: "/people/driver3.jpg", 
    email: "roman.silny@sendeliver.com",
    phone: "+421 908 345 678",
    birthDate: "1978-03-04",
    licenseNumber: "SK23456789",
    licenseExpiry: "2024-03-03",
    licenseType: "C+E",
    address: "Mierová 78",
    city: "Žilina",
    zipCode: "01001",
    country: "Slovensko",
    joinDate: "2019-08-20",
    vehicle: "Ťahač biely",
    notes: "Špecialista na medzinárodnú prepravu"
  },
  { 
    id: "4", 
    firstName: "Matej", 
    lastName: "Ostrý", 
    position: "Vodič", 
    status: "Aktívny", 
    image: "/people/driver4.jpg", 
    email: "matej.ostry@sendeliver.com",
    phone: "+421 904 456 789",
    birthDate: "1992-07-17",
    licenseNumber: "SK34567890",
    licenseExpiry: "2027-07-16",
    licenseType: "C",
    address: "Kvetná 12",
    city: "Trenčín",
    zipCode: "91101",
    country: "Slovensko",
    joinDate: "2022-01-05",
    vehicle: "Sklápač modrý",
    notes: "Nový vodič, predtým pracoval v stavebníctve"
  },
  { 
    id: "5", 
    firstName: "David", 
    lastName: "Šikovný", 
    position: "Vodič", 
    status: "PN", 
    image: "/people/driver5.jpg", 
    email: "david.sikovny@sendeliver.com",
    phone: "+421 907 567 890",
    birthDate: "1983-12-30",
    licenseNumber: "SK45678901",
    licenseExpiry: "2025-12-29",
    licenseType: "B",
    address: "Slnečná 34",
    city: "Prešov",
    zipCode: "08001",
    country: "Slovensko",
    joinDate: "2020-11-11",
    vehicle: "Dodávka korba",
    notes: "Práceneschopný do 30.4.2023"
  },
  { 
    id: "6", 
    firstName: "Patrik", 
    lastName: "Múdry", 
    position: "Vodič", 
    status: "Aktívny", 
    image: "/people/driver6.jpg", 
    email: "patrik.mudry@sendeliver.com",
    phone: "+421 902 678 901",
    birthDate: "1988-05-05",
    licenseNumber: "SK56789012",
    licenseExpiry: "2026-05-04",
    licenseType: "C+E",
    address: "Športová 56",
    city: "Nitra",
    zipCode: "94901",
    country: "Slovensko",
    joinDate: "2019-06-01",
    vehicle: "Auto plachta",
    notes: "Zaškolený na ADR prepravu"
  },
  { 
    id: "7", 
    firstName: "Mária", 
    lastName: "Kovárová", 
    position: "Dispečer", 
    status: "Aktívny", 
    image: "/people/staff1.jpg", 
    email: "maria.kovarova@sendeliver.com",
    phone: "+421 906 789 012",
    birthDate: "1991-09-18",
    address: "Poľná 22",
    city: "Bratislava",
    zipCode: "82108",
    country: "Slovensko",
    joinDate: "2020-02-15",
    notes: "Dispečer pre západné Slovensko"
  },
  { 
    id: "8", 
    firstName: "Tomáš", 
    lastName: "Rýchly", 
    position: "Manažér", 
    status: "Aktívny", 
    image: "/people/staff2.jpg", 
    email: "tomas.rychly@sendeliver.com",
    phone: "+421 901 890 123",
    birthDate: "1980-02-25",
    address: "Veterná 44",
    city: "Bratislava",
    zipCode: "84105",
    country: "Slovensko",
    joinDate: "2018-05-01",
    notes: "Zodpovedný za medzinárodnú prepravu"
  }
];

export const mockTrips: Trip[] = [
  { id: "1", personId: "1", date: "2023-04-21", vehicle: "Dodávka plachta titrol", destination: "Praha", status: "Ukončená", distance: 350, duration: 4.5 },
  { id: "2", personId: "1", date: "2023-04-15", vehicle: "Dodávka plachta titrol", destination: "Praha", status: "Ukončená", distance: 350, duration: 4.2 },
  { id: "3", personId: "1", date: "2023-04-10", vehicle: "Dodávka plachta titrol", destination: "Viedeň", status: "Ukončená", distance: 80, duration: 1.5 },
  { id: "4", personId: "1", date: "2023-04-01", vehicle: "Dodávka plachta titrol", destination: "Budapešť", status: "Ukončená", distance: 200, duration: 3.0 },
  
  { id: "5", personId: "2", date: "2023-04-20", vehicle: "Dodávka skriňa biela", destination: "Brno", status: "Ukončená", distance: 130, duration: 2.0 },
  { id: "6", personId: "2", date: "2023-04-12", vehicle: "Dodávka skriňa biela", destination: "Ostrava", status: "Ukončená", distance: 170, duration: 2.5 },
  
  { id: "7", personId: "3", date: "2023-03-25", vehicle: "Ťahač biely", destination: "Berlín", status: "Ukončená", distance: 580, duration: 7.5 },
  { id: "8", personId: "3", date: "2023-03-15", vehicle: "Ťahač biely", destination: "Varšava", status: "Ukončená", distance: 650, duration: 8.0 },
  
  { id: "9", personId: "4", date: "2023-04-20", vehicle: "Sklápač modrý", destination: "Žilina", status: "Ukončená", distance: 80, duration: 1.2 },
  { id: "10", personId: "4", date: "2023-04-15", vehicle: "Sklápač modrý", destination: "Banská Bystrica", status: "Ukončená", distance: 110, duration: 1.8 },
  
  { id: "11", personId: "5", date: "2023-04-10", vehicle: "Dodávka korba", destination: "Košice", status: "Ukončená", distance: 250, duration: 3.5 },
  { id: "12", personId: "5", date: "2023-04-05", vehicle: "Dodávka korba", destination: "Prešov", status: "Ukončená", distance: 270, duration: 3.8 },
  
  { id: "13", personId: "6", date: "2023-04-18", vehicle: "Auto plachta", destination: "Mnichov", status: "Ukončená", distance: 450, duration: 5.2 },
  { id: "14", personId: "6", date: "2023-04-05", vehicle: "Auto plachta", destination: "Frankfurt", status: "Ukončená", distance: 680, duration: 7.8 }
];

export const mockDocuments: Document[] = [
  { id: "1", personId: "1", date: "2021-06-11", type: "Vodičský preukaz", number: "SK12345678", validUntil: "2026-06-11", description: "Vodičský preukaz kategórie C+E" },
  { id: "2", personId: "1", date: "2022-10-15", type: "Zdravotná prehliadka", number: "ZP-2022-123", validUntil: "2024-10-15", description: "Pravidelná zdravotná prehliadka" },
  
  { id: "3", personId: "2", date: "2020-11-22", type: "Vodičský preukaz", number: "SK87654321", validUntil: "2025-11-22", description: "Vodičský preukaz kategórie B" },
  { id: "4", personId: "2", date: "2022-09-05", type: "Zdravotná prehliadka", number: "ZP-2022-234", validUntil: "2024-09-05", description: "Pravidelná zdravotná prehliadka" },
  
  { id: "5", personId: "3", date: "2019-03-03", type: "Vodičský preukaz", number: "SK23456789", validUntil: "2024-03-03", description: "Vodičský preukaz kategórie C+E" },
  { id: "6", personId: "3", date: "2022-11-11", type: "ADR školenie", number: "ADR-2022-111", validUntil: "2024-11-11", description: "Školenie pre prepravu nebezpečných látok" },
  { id: "7", personId: "3", date: "2022-08-10", type: "Zdravotná prehliadka", number: "ZP-2022-345", validUntil: "2024-08-10", description: "Pravidelná zdravotná prehliadka" },
  
  { id: "8", personId: "4", date: "2022-07-16", type: "Vodičský preukaz", number: "SK34567890", validUntil: "2027-07-16", description: "Vodičský preukaz kategórie C" },
  { id: "9", personId: "4", date: "2022-07-20", type: "Zdravotná prehliadka", number: "ZP-2022-456", validUntil: "2024-07-20", description: "Pravidelná zdravotná prehliadka" },
  
  { id: "10", personId: "5", date: "2020-12-29", type: "Vodičský preukaz", number: "SK45678901", validUntil: "2025-12-29", description: "Vodičský preukaz kategórie B" },
  { id: "11", personId: "5", date: "2022-06-15", type: "Zdravotná prehliadka", number: "ZP-2022-567", validUntil: "2024-06-15", description: "Pravidelná zdravotná prehliadka" },
  
  { id: "12", personId: "6", date: "2021-05-04", type: "Vodičský preukaz", number: "SK56789012", validUntil: "2026-05-04", description: "Vodičský preukaz kategórie C+E" },
  { id: "13", personId: "6", date: "2023-01-10", type: "ADR školenie", number: "ADR-2023-010", validUntil: "2025-01-10", description: "Školenie pre prepravu nebezpečných látok" },
  { id: "14", personId: "6", date: "2022-05-15", type: "Zdravotná prehliadka", number: "ZP-2022-678", validUntil: "2024-05-15", description: "Pravidelná zdravotná prehliadka" }
];

// Pomocné funkcie pre filtrovanie údajov
export const getTripsForPerson = (personId: string): Trip[] => {
  return mockTrips.filter(trip => trip.personId === personId);
};

export const getDocumentsForPerson = (personId: string): Document[] => {
  return mockDocuments.filter(doc => doc.personId === personId);
};