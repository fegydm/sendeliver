// File: ./front/src/data/mockAnalyticsData.ts
// Last change: Created mock data for analytics dashboard

// Typy pre analytické dáta
export interface PerformanceMetric {
    id: string;
    name: string;
    value: number;
    unit: string;
    change: number; // percentuálna zmena oproti predchádzajúcemu obdobiu
    trend: 'up' | 'down' | 'stable';
    goal?: number;
  }
  
  export interface TimeSeriesDataPoint {
    date: string;
    value: number;
  }
  
  export interface TimeSeriesData {
    id: string;
    name: string;
    data: TimeSeriesDataPoint[];
    unit: string;
    color?: string;
  }
  
  export interface PieChartData {
    id: string;
    name: string;
    value: number;
    color?: string;
  }
  
  export interface BarChartData {
    key: string;
    value: number;
    unit: string;
    color?: string;
  }
  
  export interface BarChartSeries {
    id: string;
    name: string;
    data: BarChartData[];
  }
  
  export interface TableRow {
    [key: string]: any;
  }
  
  // Vytvorenie mock dát pre kľúčové metriky
  export const mockPerformanceMetrics: PerformanceMetric[] = [
    {
      id: 'deliveries',
      name: 'Celkový počet prepráv',
      value: 248,
      unit: 'ks',
      change: 12.4,
      trend: 'up',
      goal: 300
    },
    {
      id: 'distance',
      name: 'Prejdené kilometre',
      value: 54289,
      unit: 'km',
      change: 8.2,
      trend: 'up'
    },
    {
      id: 'revenue',
      name: 'Celkové príjmy',
      value: 27840,
      unit: '€',
      change: 15.7,
      trend: 'up',
      goal: 30000
    },
    {
      id: 'fuel',
      name: 'Náklady na palivo',
      value: 9620,
      unit: '€',
      change: 3.2,
      trend: 'up'
    },
    {
      id: 'utilization',
      name: 'Využitie vozidiel',
      value: 78.4,
      unit: '%',
      change: 5.3,
      trend: 'up',
      goal: 85
    },
    {
      id: 'ontime',
      name: 'Dodávky načas',
      value: 94.2,
      unit: '%',
      change: 2.1,
      trend: 'up',
      goal: 98
    },
    {
      id: 'emissions',
      name: 'CO2 emisie',
      value: 32.6,
      unit: 't',
      change: -4.5,
      trend: 'down'
    },
    {
      id: 'costs',
      name: 'Prevádzkové náklady',
      value: 18750,
      unit: '€',
      change: 1.8,
      trend: 'up'
    }
  ];
  
  // Vytvorenie mock dát pre časové rady
  const generateTimeSeriesData = (name: string, unit: string, scale: number, volatility: number, trend: number, days: number, color?: string): TimeSeriesData => {
    const data: TimeSeriesDataPoint[] = [];
    let currentValue = scale;
    
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      
      // Pridanie trendu a volatility
      currentValue = Math.max(0, currentValue * (1 + (Math.random() * volatility * 2 - volatility) + trend));
      
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(currentValue * 100) / 100
      });
    }
    
    return {
      id: name.toLowerCase().replace(/\s/g, '_'),
      name,
      data,
      unit,
      color
    };
  };
  
  export const mockRevenueData = generateTimeSeriesData('Príjmy', '€', 800, 0.03, 0.005, 30, '#4caf50');
  export const mockDeliveriesData = generateTimeSeriesData('Počet prepráv', 'ks', 8, 0.05, 0.002, 30, '#2196f3');
  export const mockDistanceData = generateTimeSeriesData('Prejdené kilometre', 'km', 1800, 0.04, 0.001, 30, '#ff9800');
  export const mockFuelData = generateTimeSeriesData('Spotreba paliva', 'l', 500, 0.02, 0.001, 30, '#f44336');
  
  // Vytvorenie porovnávacích dát minulý mesiac vs. aktuálny
  export const mockComparisonData: BarChartSeries[] = [
    {
      id: 'current',
      name: 'Aktuálny mesiac',
      data: [
        { key: 'Príjmy', value: 27840, unit: '€', color: '#4caf50' },
        { key: 'Náklady', value: 18750, unit: '€', color: '#f44336' },
        { key: 'Prepravy', value: 248, unit: 'ks', color: '#2196f3' },
        { key: 'Kilometre', value: 54289, unit: 'km', color: '#ff9800' }
      ]
    },
    {
      id: 'previous',
      name: 'Predchádzajúci mesiac',
      data: [
        { key: 'Príjmy', value: 24060, unit: '€', color: '#81c784' },
        { key: 'Náklady', value: 18415, unit: '€', color: '#e57373' },
        { key: 'Prepravy', value: 221, unit: 'ks', color: '#64b5f6' },
        { key: 'Kilometre', value: 50175, unit: 'km', color: '#ffb74d' }
      ]
    }
  ];
  
  // Vytvorenie dát pre rozdelenie príjmov podľa typu prepravy
  export const mockRevenueByType: PieChartData[] = [
    { id: 'type1', name: 'Medzinárodné prepravy', value: 15200, color: '#3f51b5' },
    { id: 'type2', name: 'Vnútroštátne prepravy', value: 8640, color: '#2196f3' },
    { id: 'type3', name: 'Mestské rozvážky', value: 4000, color: '#03a9f4' }
  ];
  
  // Vytvorenie dát pre rozdelenie prepráv podľa regiónu
  export const mockDeliveriesByRegion: PieChartData[] = [
    { id: 'region1', name: 'Západné Slovensko', value: 85, color: '#4caf50' },
    { id: 'region2', name: 'Stredné Slovensko', value: 63, color: '#8bc34a' },
    { id: 'region3', name: 'Východné Slovensko', value: 42, color: '#cddc39' },
    { id: 'region4', name: 'Česká republika', value: 36, color: '#ffc107' },
    { id: 'region5', name: 'Nemecko', value: 22, color: '#ff9800' }
  ];
  
  // Vytvorenie dát pre top 5 zákazníkov
  export const mockTopCustomers: TableRow[] = [
    { id: 1, name: 'EuroLogistics s.r.o.', deliveries: 42, revenue: 6240, growth: 18.3 },
    { id: 2, name: 'Slovenská distribučná, a.s.', deliveries: 38, revenue: 4850, growth: 12.7 },
    { id: 3, name: 'FreshFood Delivery', deliveries: 29, revenue: 3650, growth: 9.4 },
    { id: 4, name: 'GlobalTech Industries', deliveries: 25, revenue: 3120, growth: 7.8 },
    { id: 5, name: 'Nábytok Komfort', deliveries: 20, revenue: 2790, growth: 5.2 }
  ];
  
  // Vytvorenie dát pre využitie vozidiel
  export const mockVehicleUtilization: TableRow[] = [
    { id: 'v1', name: 'Mercedes Actros - BA463ZK', trips: 26, distance: 8450, utilization: 92, status: 'active' },
    { id: 'v2', name: 'Volvo FH - BA951TR', trips: 24, distance: 9240, utilization: 88, status: 'active' },
    { id: 'v3', name: 'MAN TGX - BA712SK', trips: 22, distance: 7650, utilization: 87, status: 'active' },
    { id: 'v4', name: 'Iveco Daily - BA128OP', trips: 35, distance: 4320, utilization: 85, status: 'active' },
    { id: 'v5', name: 'Scania R450 - BA369TK', trips: 18, distance: 7950, utilization: 83, status: 'service' },
    { id: 'v6', name: 'Mercedes Sprinter - BA741BR', trips: 32, distance: 3420, utilization: 80, status: 'active' },
    { id: 'v7', name: 'Renault T - BA289IJ', trips: 16, distance: 5840, utilization: 79, status: 'active' },
    { id: 'v8', name: 'DAF XF - BA537PR', trips: 17, distance: 6120, utilization: 76, status: 'active' },
    { id: 'v9', name: 'Ford Transit - BA624GH', trips: 28, distance: 1890, utilization: 72, status: 'active' },
    { id: 'v10', name: 'Iveco Stralis - BA175TS', trips: 10, distance: 3760, utilization: 63, status: 'inactive' }
  ];
  
  // Vytvorenie dát pre náklady podľa kategórie
  export const mockCostBreakdown: PieChartData[] = [
    { id: 'cost1', name: 'Palivo', value: 9620, color: '#f44336' },
    { id: 'cost2', name: 'Mzdy vodičov', value: 5840, color: '#e91e63' },
    { id: 'cost3', name: 'Údržba vozidiel', value: 1860, color: '#9c27b0' },
    { id: 'cost4', name: 'Poistenie', value: 980, color: '#673ab7' },
    { id: 'cost5', name: 'Administratíva', value: 450, color: '#3f51b5' }
  ];
  
  // Vytvorenie dát pre emisie CO2 za posledných 6 mesiacov
  export const mockEmissionsData: TimeSeriesData = {
    id: 'emissions',
    name: 'CO2 Emisie',
    data: [
      { date: '2024-12-01', value: 34.2 },
      { date: '2025-01-01', value: 35.1 },
      { date: '2025-02-01', value: 33.9 },
      { date: '2025-03-01', value: 34.5 },
      { date: '2025-04-01', value: 33.5 },
      { date: '2025-05-01', value: 32.6 }
    ],
    unit: 't',
    color: '#607d8b'
  };