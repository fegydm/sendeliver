// File: front/src/data/mockWebCardsData.ts
// Účel: Mock dáta a typová definícia pre Webové Vizitky.

export interface WebCard {
  id: number;
  name: string;
  domain: string;
  subDomain?: string;
  status: "Aktívna" | "Neaktívna" | "Čaká na schválenie";
  views: number;
  color: string;
  modules: string[];
  createdAt: string;
  customDomain?: string;
}

export const mockWebCards: WebCard[] = [
  {
    id: 1,
    name: "Hlavná stránka",
    domain: "johntransport.sendeliver.com",
    status: "Aktívna",
    views: 245,
    color: "#4caf50",
    modules: ["Úvod", "Flotila", "Kontakt", "Voľné vozidlá"],
    createdAt: "2023-04-01",
  },
  {
    id: 2,
    name: "Promo stránka",
    domain: "johntransport.sendeliver.com",
    subDomain: "akcia",
    status: "Aktívna",
    views: 120,
    color: "#ff9800",
    modules: ["Úvod", "Služby", "Novinky"],
    createdAt: "2023-04-15",
    customDomain: "promo.johntransport.com",
  },
  {
    id: 3,
    name: "Náborová kampaň",
    domain: "johntransport.sendeliver.com",
    subDomain: "kariera",
    status: "Neaktívna",
    views: 88,
    color: "#f44336",
    modules: ["Kariéra", "O nás", "Kontakt"],
    createdAt: "2023-03-10",
  },
    {
    id: 4,
    name: "Nová vizitka (čaká)",
    domain: "novyprepravca.sendeliver.com",
    status: "Čaká na schválenie",
    views: 0,
    color: "#607d8b",
    modules: ["Úvod", "Kontakt"],
    createdAt: "2023-05-01",
  },
];

export const AVAILABLE_MODULES = [
  "Úvod",
  "Flotila",
  "Poslanie",
  "Kontakt",
  "Voľné vozidlá",
  "Služby",
  "O nás",
  "Referencie",
  "Novinky",
  "Kariéra",
];