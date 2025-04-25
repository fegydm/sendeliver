// File: ./front/src/data/mockExchangeData.ts
// Last change: Created initial mock data structure for exchange offers

import { faker } from '@faker-js/faker/locale/sk';

// Nastavenie slovenských/stredoeurópskych lokácií
const citiesSK = ['Bratislava', 'Košice', 'Žilina', 'Banská Bystrica', 'Prešov', 'Nitra', 'Trnava', 'Trenčín', 'Martin', 'Poprad'];
const citiesCZ = ['Praha', 'Brno', 'Ostrava', 'Plzeň', 'Liberec', 'Olomouc', 'České Budejovice', 'Hradec Králové', 'Pardubice', 'Zlín'];
const citiesHU = ['Budapešť', 'Debrecín', 'Segedín', 'Miskolc', 'Pécs', 'Győr', 'Nyíregyháza', 'Kecskemét', 'Székesfehérvár'];
const citiesAT = ['Viedeň', 'Graz', 'Linz', 'Salzburg', 'Innsbruck', 'Klagenfurt', 'Villach', 'Wels', 'Sankt Pölten'];
const citiesPL = ['Varšava', 'Krakov', 'Lodž', 'Vroclav', 'Poznaň', 'Gdaňsk', 'Katovice', 'Lublin', 'Bialystok'];
const citiesDE = ['Berlín', 'Mníchov', 'Hamburg', 'Kolín', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Lipsko', 'Hannover', 'Norimberg'];

// Kombinácie krajín a ich miest
const locations = [
  ...citiesSK.map(city => ({ city, country: 'SK' })),
  ...citiesCZ.map(city => ({ city, country: 'CZ' })),
  ...citiesHU.map(city => ({ city, country: 'HU' })),
  ...citiesAT.map(city => ({ city, country: 'AT' })),
  ...citiesPL.map(city => ({ city, country: 'PL' })),
  ...citiesDE.map(city => ({ city, country: 'DE' }))
];

// Typy nákladov
const cargoTypes = [
  'Paletizovaný tovar',
  'Balíky',
  'Kusový tovar',
  'Nadrozmerný náklad',
  'Chladený tovar',
  'Potraviny',
  'Stavebný materiál',
  'Elektronika',
  'Textil',
  'Nábytok',
  'Strojné zariadenia',
  'Osobné veci',
  'Automobily',
  'Chemikálie',
  'Rýchloskaziteľný tovar'
];

// Špecifické požiadavky
const specificRequirements = [
  'Teplotný režim: -20°C až +5°C',
  'GPS monitoring počas prepravy',
  'Hydraulická plošina',
  'Bočné otváranie',
  'ADR preprava',
  'Dvojpodlažné nakladanie',
  'Poistenie nákladu nad štandard',
  'Zákazník vyžaduje fixáciu nákladu',
  'Náklad vyžaduje ochranu pred zrážkami',
  'Je potrebné zavolať 1 hodinu pred nakládkou',
  'Dostupná rampa pre nákladku',
  'Nakládka len v pracovných hodinách (8:00-16:00)',
  'Potrebné vlastné paletovacie vozíky',
  'Prepravu nie je možné preložiť na inú spoločnosť'
];

// Typy vozidiel
const vehicleTypes = [
  'Dodávka (do 3,5t)',
  'Nákladné vozidlo (do 7,5t)',
  'Nákladné vozidlo (do 12t)',
  'Nákladné vozidlo s prívesom',
  'Ťahač s návesom',
  'Chladiarenské vozidlo',
  'Valník s plachtou',
  'Sklápač',
  'Cisterna',
  'Špeciál - nadrozmerná preprava'
];

// Vytvorenie náhodných firemných názvov a kontaktov
const generateCompanyInfo = () => {
  const companyPrefix = ['Trans', 'Logistic', 'Cargo', 'Express', 'Shipping', 'Delivery', 'Transport', 'Freight', 'Global', 'Euro', 'Fast', 'Sprint'];
  const companySuffix = ['Ex', 'Lines', 'Group', 'Systems', 'Solutions', 'Services', 'Logistics', 'Trans', 'Way', 'Link', 'Connect', 'Direct'];
  const companyMiddle = ['', '', '', 'SK', 'EU', 'Plus', 'Pro', '24', 'Max', 'Top'];

  const randomPrefix = companyPrefix[Math.floor(Math.random() * companyPrefix.length)];
  const randomMiddle = companyMiddle[Math.floor(Math.random() * companyMiddle.length)];
  const randomSuffix = companySuffix[Math.floor(Math.random() * companySuffix.length)];

  const companyName = `${randomPrefix}${randomMiddle}${randomSuffix}`;
  const contactPerson = `${faker.person.firstName()} ${faker.person.lastName()}`;
  const contactPhone = faker.helpers.replaceSymbols('+421 9## ### ###');
  const contactEmail = faker.internet.email({ firstName: contactPerson.split(' ')[0], lastName: contactPerson.split(' ')[1], provider: 'shippingcompany.com' }).toLowerCase();

  return {
    companyName,
    contactPerson,
    contactPhone,
    contactEmail
  };
};

// Rozhranie pre ponuku prepravy
export interface ExchangeOffer {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  pickupLocation: {
    city: string;
    country: string;
    postalCode?: string;
    address?: string;
  };
  deliveryLocation: {
    city: string;
    country: string;
    postalCode?: string;
    address?: string;
  };
  pickupTime: {
    date: Date;
    timeWindow?: {
      from: string;
      to: string;
    };
  };
  deliveryTime: {
    date: Date;
    timeWindow?: {
      from: string;
      to: string;
    };
  };
  cargo: {
    type: string;
    quantity: number;
    weight: number; // v kg
    volume?: number; // v m3
    pallets?: number;
    dimensions?: {
      length: number; // v cm
      width: number; // v cm
      height: number; // v cm
    };
  };
  vehicleType: string[];
  price?: {
    amount: number;
    currency: string;
  };
  specificRequirements?: string[];
  status: 'new' | 'viewed' | 'accepted' | 'rejected' | 'expired';
  company: {
    name: string;
    contactPerson: string;
    phone: string;
    email: string;
  };
}

// Generovanie náhodného dátumu v budúcnosti (1-7 dní)
const getFutureDate = (minDays = 1, maxDays = 7) => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + minDays + Math.floor(Math.random() * (maxDays - minDays)));
  return futureDate;
};

// Generovanie náhodného časového okna
const getTimeWindow = () => {
  const startHours = 7 + Math.floor(Math.random() * 10); // 7:00 - 17:00
  const endHours = startHours + 1 + Math.floor(Math.random() * 3); // +1-3 hodiny

  return {
    from: `${String(startHours).padStart(2, '0')}:00`,
    to: `${String(endHours).padStart(2, '0')}:00`
  };
};

// Generovanie náhodnej ceny
const generatePrice = () => {
  // 70% šanca, že cena bude stanovená
  if (Math.random() < 0.7) {
    return {
      amount: 200 + Math.floor(Math.random() * 800), // 200 - 1000 EUR
      currency: 'EUR'
    };
  }
  return undefined;
};

// Generovanie náhodných špecifických požiadaviek
const generateRequirements = () => {
  if (Math.random() < 0.7) { // 70% šanca, že budú špecifické požiadavky
    const count = Math.floor(Math.random() * 3) + 1; // 1-3 požiadavky
    const requirements: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const randomReq = specificRequirements[Math.floor(Math.random() * specificRequirements.length)];
      if (!requirements.includes(randomReq)) {
        requirements.push(randomReq);
      }
    }
    
    return requirements;
  }
  return undefined;
};

// Generovanie náhodnej ponuky prepravy
export const generateRandomOffer = (): ExchangeOffer => {
  // Náhodný výber lokalít tak, aby boli rôzne
  const pickupIndex = Math.floor(Math.random() * locations.length);
  let deliveryIndex;
  do {
    deliveryIndex = Math.floor(Math.random() * locations.length);
  } while (pickupIndex === deliveryIndex);

  const pickupLocation = locations[pickupIndex];
  const deliveryLocation = locations[deliveryIndex];

  // Náhodný výber dátumov tak, aby dátum dodania bol po dátume vyzdvihnutia
  const pickupDate = getFutureDate(1, 5);
  const deliveryDate = new Date(pickupDate);
  deliveryDate.setDate(pickupDate.getDate() + 1 + Math.floor(Math.random() * 3)); // 1-3 dni po vyzdvihnutí

  // Náhodný výber typu vozidla (1-2 typy)
  const vehicleTypeCount = Math.random() < 0.7 ? 1 : 2;
  const selectedVehicleTypes: string[] = [];
  
  for (let i = 0; i < vehicleTypeCount; i++) {
    const randomType = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
    if (!selectedVehicleTypes.includes(randomType)) {
      selectedVehicleTypes.push(randomType);
    }
  }

  // Firemné údaje
  const company = generateCompanyInfo();

  return {
    id: faker.string.uuid(),
    createdAt: new Date(),
    updatedAt: new Date(),
    pickupLocation: {
      city: pickupLocation.city,
      country: pickupLocation.country,
      postalCode: faker.location.zipCode(),
    },
    deliveryLocation: {
      city: deliveryLocation.city,
      country: deliveryLocation.country,
      postalCode: faker.location.zipCode(),
    },
    pickupTime: {
      date: pickupDate,
      timeWindow: getTimeWindow()
    },
    deliveryTime: {
      date: deliveryDate,
      timeWindow: getTimeWindow()
    },
    cargo: {
      type: cargoTypes[Math.floor(Math.random() * cargoTypes.length)],
      quantity: 1 + Math.floor(Math.random() * 10), // 1-10 jednotiek
      weight: 100 + Math.floor(Math.random() * 15000), // 100-15100 kg
      volume: Math.random() < 0.7 ? Math.floor(Math.random() * 50) + 1 : undefined, // 1-50 m3
      pallets: Math.random() < 0.8 ? Math.floor(Math.random() * 33) + 1 : undefined, // 1-33 paliet
    },
    vehicleType: selectedVehicleTypes,
    price: generatePrice(),
    specificRequirements: generateRequirements(),
    status: 'new',
    company: {
      name: company.companyName,
      contactPerson: company.contactPerson,
      phone: company.contactPhone,
      email: company.contactEmail
    }
  };
};

// Počiatočný mock dataset s ponukami
export const generateInitialOffers = (count: number = 25): ExchangeOffer[] => {
  const offers: ExchangeOffer[] = [];
  
  for (let i = 0; i < count; i++) {
    const offer = generateRandomOffer();
    
    // Upravíme dátumy, aby vyzerali ako by boli vytvorené postupne v minulosti
    offer.createdAt = new Date(Date.now() - (count - i) * 1000 * 60 * 15); // každých 15 minút do minulosti
    offer.updatedAt = new Date(offer.createdAt);
    
    // Nastavíme rôzne stavy pre existujúce ponuky
    if (i < count * 0.6) { // 60% ponúk bude mať stav "new"
      offer.status = 'new';
    } else if (i < count * 0.8) { // 20% bude "viewed"
      offer.status = 'viewed';
    } else if (i < count * 0.9) { // 10% bude "accepted"
      offer.status = 'accepted';
    } else { // 10% bude "rejected"
      offer.status = 'rejected';
    }
    
    offers.push(offer);
  }
  
  // Zoradíme podľa dátumu vytvorenia od najnovších po najstaršie
  return offers.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

export const mockExchangeOffers = generateInitialOffers(25);