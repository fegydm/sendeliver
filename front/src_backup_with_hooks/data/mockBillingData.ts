// File: src/data/mockBillingData.ts
// Účel: Mock dáta a typové definície pre sekciu Fakturácia (Billing).

export interface Invoice {
  id: string;
  date: string;
  client: string;
  amount: number;
  status: 'Zaplatená' | 'Čaká na úhradu' | 'Po splatnosti';
  dueDate: string;
}

export interface TimeSeriesDataPoint {
  date: string;
  value: number;
}

export interface RevenueTrend {
  data: TimeSeriesDataPoint[];
  name: string;
  unit: string;
  color: string;
}

export interface StatusDistributionItem {
  name: 'Zaplatené' | 'Čaká na úhradu' | 'Po splatnosti';
  value: number;
}

export const mockInvoices: Invoice[] = [
  { id: "INV-2023-001", date: "2023-04-01", client: "ABC Logistics", amount: 1250.5, status: "Zaplatená", dueDate: "2023-04-10" },
  { id: "INV-2023-002", date: "2023-04-15", client: "TransEurope s.r.o.", amount: 2340.0, status: "Čaká na úhradu", dueDate: "2023-04-25" },
  { id: "INV-2023-003", date: "2023-04-22", client: "Global Shipping Ltd.", amount: 890.75, status: "Čaká na úhradu", dueDate: "2023-05-01" },
  { id: "INV-2023-004", date: "2023-03-20", client: "Cargo Solutions", amount: 1560.2, status: "Po splatnosti", dueDate: "2023-03-30" },
  { id: "INV-2023-005", date: "2023-05-02", client: "ABC Logistics", amount: 1800.0, status: "Čaká na úhradu", dueDate: "2023-05-12" },
];

export const mockRevenueTrend: RevenueTrend = {
  data: [
    { date: "2023-01", value: 5000 },
    { date: "2023-02", value: 4500 },
    { date: "2023-03", value: 6000 },
    { date: "2023-04", value: 4481.25 },
    { date: "2023-05", value: 7200 },
  ],
  name: "Mesačný obrat",
  unit: "€",
  color: "#4caf50",
};

export const mockStatusDistribution: StatusDistributionItem[] = [
  { name: "Zaplatené", value: 1250.5 },
  { name: "Čaká na úhradu", value: 3230.75 + 1800.0 },
  { name: "Po splatnosti", value: 1560.2 },
];