// File: ./front/src/components/hauler/content/HaulerAnalytics.tsx
// Last change: Complete implementation of analytics dashboard with data visualization

import React, { useState, useEffect } from "react";
import { 
  mockPerformanceMetrics, 
  mockRevenueData, 
  mockDeliveriesData, 
  mockDistanceData, 
  mockFuelData,
  mockComparisonData,
  mockRevenueByType,
  mockDeliveriesByRegion,
  mockTopCustomers,
  mockVehicleUtilization,
  mockCostBreakdown,
  mockEmissionsData
} from "../../../data/mockAnalyticsData";
import "./hauler.cards.css";
import "./analytics.css";

// Komponenty pre grafy
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  ResponsiveContainer,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  Cell,
  Area,
  AreaChart,
  ComposedChart
} from 'recharts';

const CHART_COLORS = [
  "#4caf50", "#2196f3", "#ff9800", "#f44336", 
  "#673ab7", "#3f51b5", "#009688", "#607d8b"
];

const HaulerAnalytics: React.FC = () => {
  // State pre časový rozsah
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'quarter' | 'year'>('month');
  const [isLoading, setIsLoading] = useState(true);
  const [comparisonMetric, setComparisonMetric] = useState<'revenue' | 'costs' | 'deliveries' | 'distance'>('revenue');
  
  // Aktuálny dátum pre zobrazenie
  const currentDate = new Date();
  const formattedDate = new Intl.DateTimeFormat('sk-SK', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(currentDate);
  
  // Naformátovanie čísla s jednotkou
  const formatNumber = (value: number, unit: string): string => {
    if (unit === '€') {
      return new Intl.NumberFormat('sk-SK', { 
        style: 'currency', 
        currency: 'EUR',
        maximumFractionDigits: 0 
      }).format(value);
    } else if (unit === '%') {
      return `${value}${unit}`;
    } else if (unit === 'km' && value > 1000) {
      return `${(value / 1000).toFixed(1)} tis. ${unit}`;
    } else {
      return `${new Intl.NumberFormat('sk-SK').format(value)} ${unit}`;
    }
  };
  
  // Formátovanie decimálnych čísel
  const formatDecimal = (value: number): string => {
    return new Intl.NumberFormat('sk-SK', { 
      maximumFractionDigits: 1,
      minimumFractionDigits: 1
    }).format(value);
  };
  
  // Simulácia načítania dát
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [timeRange]);
  
  // Získanie ikony pre trend
  const getTrendIcon = (trend: 'up' | 'down' | 'stable', change: number) => {
    const isPositive = change >= 0;
    
    if (trend === 'up') {
      return <span className={`trend-icon ${isPositive ? 'positive' : 'negative'}`}>↑</span>;
    } else if (trend === 'down') {
      return <span className={`trend-icon ${!isPositive ? 'positive' : 'negative'}`}>↓</span>;
    } else {
      return <span className="trend-icon stable">→</span>;
    }
  };
  
  // Filtrovanie dát podľa časového rozsahu
  const filterTimeSeriesData = (data: any) => {
    if (!data || !data.data) return data;
    
    const today = new Date();
    let filteredData = [...data.data];
    
    if (timeRange === 'day') {
      // Posledných 24 hodín (simulácia - posledný deň)
      filteredData = filteredData.slice(-1);
    } else if (timeRange === 'week') {
      // Posledných 7 dní
      filteredData = filteredData.slice(-7);
    } else if (timeRange === 'month') {
      // Posledných 30 dní (default)
      filteredData = filteredData.slice(-30);
    } else if (timeRange === 'quarter') {
      // Posledných 90 dní
      filteredData = filteredData.slice(-90);
    }
    // Pre year ostáva celý dataset
    
    return {
      ...data,
      data: filteredData
    };
  };
  
  // Príprava dát pre porovnávacie grafy
  const comparisonChartData = mockComparisonData[0].data.map((item, index) => {
    const previousData = mockComparisonData[1].data[index];
    return {
      name: item.key,
      current: item.value,
      previous: previousData.value,
      unit: item.unit
    };
  });
  
  // Príprava dát pre grafy časových radov
  const filteredRevenueData = filterTimeSeriesData(mockRevenueData);
  const filteredDeliveriesData = filterTimeSeriesData(mockDeliveriesData);
  const filteredDistanceData = filterTimeSeriesData(mockDistanceData);
  const filteredFuelData = filterTimeSeriesData(mockFuelData);
  
  // Pomocná funkcia pre formátovanie dátumu na osi X
  const formatXAxis = (dateStr: string) => {
    const date = new Date(dateStr);
    if (timeRange === 'week' || timeRange === 'month') {
      return date.getDate() + '.' + (date.getMonth() + 1) + '.';
    } else if (timeRange === 'quarter' || timeRange === 'year') {
      return (date.getMonth() + 1) + '/' + date.getFullYear().toString().substr(2);
    } else {
      return date.getHours() + ':00';
    }
  };
  
  // Pomocné formátovanie pre tooltip
  const customTooltipFormatter = (value: number, name: string, props: any) => {
    const unit = props.unit || props.payload?.unit || '';
    return [formatNumber(value, unit), name];
  };
  
  // Custom tooltip pre grafy časových radov
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{`Dátum: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {`${entry.name}: ${formatNumber(entry.value, entry.payload.unit || '')}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  // Rozdelenie metrík pre dashboard
  const topMetrics = mockPerformanceMetrics.slice(0, 4);
  const bottomMetrics = mockPerformanceMetrics.slice(4);

  return (
    <div className="analytics-container">
      {/* Horný toolbar */}
      <div className="analytics-toolbar">
        <div className="analytics-toolbar-left">
          <h1 className="analytics-title">Analytický Dashboard</h1>
          <span className="analytics-date">Aktuálne k {formattedDate}</span>
        </div>
        
        <div className="analytics-toolbar-right">
          <div className="time-range-selector">
            <button 
              className={`time-range-button ${timeRange === 'day' ? 'active' : ''}`}
              onClick={() => setTimeRange('day')}
            >
              Deň
            </button>
            <button 
              className={`time-range-button ${timeRange === 'week' ? 'active' : ''}`}
              onClick={() => setTimeRange('week')}
            >
              Týždeň
            </button>
            <button 
              className={`time-range-button ${timeRange === 'month' ? 'active' : ''}`}
              onClick={() => setTimeRange('month')}
            >
              Mesiac
            </button>
            <button 
              className={`time-range-button ${timeRange === 'quarter' ? 'active' : ''}`}
              onClick={() => setTimeRange('quarter')}
            >
              Kvartál
            </button>
            <button 
              className={`time-range-button ${timeRange === 'year' ? 'active' : ''}`}
              onClick={() => setTimeRange('year')}
            >
              Rok
            </button>
          </div>
          
          <button className="analytics-toolbar-button">
            <span className="icon">↓</span>
            Export
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="analytics-loading-spinner">
          <div className="spinner"></div>
          <p>Načítavam analytické dáta...</p>
        </div>
      ) : (
        <div className="analytics-content">
          {/* KPI metriky - horný rad */}
          <div className="metrics-container top-metrics">
            {topMetrics.map(metric => (
              <div key={metric.id} className="metric-card">
                <div className="metric-header">
                  <h3 className="metric-title">{metric.name}</h3>
                  <div className="metric-change">
                    {getTrendIcon(metric.trend, metric.change)}
                    <span className={`change-value ${metric.change >= 0 ? 'positive' : 'negative'}`}>
                      {metric.change >= 0 ? '+' : ''}{formatDecimal(metric.change)}%
                    </span>
                  </div>
                </div>
                
                <div className="metric-value-container">
                  <span className="metric-value">{formatNumber(metric.value, metric.unit)}</span>
                  
                  {metric.goal && (
                    <div className="metric-goal">
                      <div className="goal-progress-bar">
                        <div 
                          className="goal-progress-fill"
                          style={{ width: `${Math.min(100, (metric.value / metric.goal) * 100)}%` }}
                        ></div>
                      </div>
                      <span className="goal-text">Cieľ: {formatNumber(metric.goal, metric.unit)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Hlavné grafy */}
          <div className="main-charts-container">
            {/* Príjmy - čiarový graf */}
            <div className="chart-card large">
              <div className="chart-header">
                <h3 className="chart-title">Príjmy ({mockRevenueData.unit})</h3>
              </div>
              <div className="chart-content">
                <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={filteredRevenueData.data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
  <XAxis dataKey="date" tickFormatter={formatXAxis} />
  <YAxis 
    tickFormatter={(value: number) => {
      if (value >= 1000) return `${(value/1000).toFixed(0)}k`;
      return value.toString();
    }}
  />
  <Tooltip content={<CustomTooltip />} />
  <Area 
    type="monotone" 
    dataKey="value" 
    stroke={mockRevenueData.color} 
    fill={mockRevenueData.color} 
    fillOpacity={0.2}
    name={mockRevenueData.name} 
    unit={mockRevenueData.unit}
  />
</AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Prepravy - stĺpcový graf */}
            <div className="chart-card medium">
              <div className="chart-header">
                <h3 className="chart-title">Prepravy ({mockDeliveriesData.unit})</h3>
              </div>
              <div className="chart-content">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={filteredDeliveriesData.data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="date" tickFormatter={formatXAxis} />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="value" 
                      name={mockDeliveriesData.name} 
                      unit={mockDeliveriesData.unit}
                      fill={mockDeliveriesData.color} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* Sekundárne grafy - rada 3 grafov */}
          <div className="secondary-charts-container">
            {/* Koláčový graf rozdelenia príjmov */}
            <div className="chart-card medium">
              <div className="chart-header">
                <h3 className="chart-title">Príjmy podľa typu prepravy</h3>
              </div>
              <div className="chart-content">
                <ResponsiveContainer width="100%" height={250}>
                <PieChart>
  <Pie
    data={mockRevenueByType}
    cx="50%"
    cy="50%"
    labelLine={false}
    outerRadius={80}
    dataKey="value"
    nameKey="name"
    label={({ name, percent }: { name: string; percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
  >
    {mockRevenueByType.map((entry, index) => (
      <Cell key={`cell-${index}`} fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]} />
    ))}
  </Pie>
  <Tooltip formatter={(value: number) => formatNumber(value, '€')} />
</PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Mesačné porovnanie */}
            <div className="chart-card medium">
              <div className="chart-header">
                <h3 className="chart-title">Porovnanie s predchádzajúcim mesiacom</h3>
                <div className="chart-controls">
                  <select 
                    value={comparisonMetric}
                    onChange={(e) => setComparisonMetric(e.target.value as any)}
                    className="metric-selector"
                  >
                    <option value="revenue">Príjmy</option>
                    <option value="costs">Náklady</option>
                    <option value="deliveries">Prepravy</option>
                    <option value="distance">Kilometre</option>
                  </select>
                </div>
              </div>
              <div className="chart-content">
              <ResponsiveContainer width="100%" height={250}>
  <BarChart data={comparisonChartData.filter(item => item.name.toLowerCase().includes(comparisonMetric))} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
    <XAxis dataKey="name" />
    <YAxis tickFormatter={(value: number) => {
      if (value >= 1000) return `${(value/1000).toFixed(0)}k`;
      return value.toString();
    }} />
    <Tooltip formatter={customTooltipFormatter} />
    <Legend />
    <Bar dataKey="current" name="Aktuálny mesiac" fill="#4caf50" />
    <Bar dataKey="previous" name="Predchádzajúci mesiac" fill="#9e9e9e" />
  </BarChart>
</ResponsiveContainer>
              </div>
            </div>
            
            {/* Prepravy podľa regiónu */}
            <div className="chart-card medium">
              <div className="chart-header">
                <h3 className="chart-title">Prepravy podľa regiónu</h3>
              </div>
              <div className="chart-content">
                <ResponsiveContainer width="100%" height={250}>
                <PieChart>
  <Pie
    data={mockDeliveriesByRegion}
    cx="50%"
    cy="50%"
    labelLine={false}
    outerRadius={80}
    dataKey="value"
    nameKey="name"
    label={({ name, percent }: { name: string; percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
  >
    {mockDeliveriesByRegion.map((entry, index) => (
      <Cell key={`cell-${index}`} fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]} />
    ))}
  </Pie>
  <Tooltip formatter={(value: number) => formatNumber(value, 'ks')} />
</PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* KPI metriky - druhý rad */}
          <div className="metrics-container bottom-metrics">
            {bottomMetrics.map(metric => (
              <div key={metric.id} className="metric-card">
                <div className="metric-header">
                  <h3 className="metric-title">{metric.name}</h3>
                  <div className="metric-change">
                    {getTrendIcon(metric.trend, metric.change)}
                    <span className={`change-value ${metric.change >= 0 ? 'positive' : 'negative'}`}>
                      {metric.change >= 0 ? '+' : ''}{formatDecimal(metric.change)}%
                    </span>
                  </div>
                </div>
                
                <div className="metric-value-container">
                  <span className="metric-value">{formatNumber(metric.value, metric.unit)}</span>
                  
                  {metric.goal && (
                    <div className="metric-goal">
                      <div className="goal-progress-bar">
                        <div 
                          className="goal-progress-fill"
                          style={{ width: `${Math.min(100, (metric.value / metric.goal) * 100)}%` }}
                        ></div>
                      </div>
                      <span className="goal-text">Cieľ: {formatNumber(metric.goal, metric.unit)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Dodatočné štatistiky */}
          <div className="additional-stats-container">
            {/* Tabuľka s top zákazníkmi */}
            <div className="stats-card">
              <div className="stats-header">
                <h3 className="stats-title">TOP 5 zákazníkov</h3>
              </div>
              <div className="stats-content">
                <table className="stats-table customers-table">
                  <thead>
                    <tr>
                      <th>Zákazník</th>
                      <th>Prepravy</th>
                      <th>Príjem (€)</th>
                      <th>Rast (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockTopCustomers.map(customer => (
                      <tr key={customer.id}>
                        <td>{customer.name}</td>
                        <td>{customer.deliveries}</td>
                        <td>{customer.revenue.toLocaleString('sk-SK')}</td>
                        <td className={customer.growth >= 0 ? 'positive' : 'negative'}>
                          {customer.growth >= 0 ? '+' : ''}{customer.growth}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Vozový park a využitie */}
            <div className="stats-card">
              <div className="stats-header">
                <h3 className="stats-title">Využitie vozového parku</h3>
              </div>
              <div className="stats-content">
                <table className="stats-table vehicles-table">
                  <thead>
                    <tr>
                      <th>Vozidlo</th>
                      <th>Jazdy</th>
                      <th>Kilometre</th>
                      <th>Využitie (%)</th>
                      <th>Stav</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockVehicleUtilization.slice(0, 5).map(vehicle => (
                      <tr key={vehicle.id}>
                        <td>{vehicle.name}</td>
                        <td>{vehicle.trips}</td>
                        <td>{vehicle.distance.toLocaleString('sk-SK')}</td>
                        <td>
                          <div className="utilization-bar">
                            <div 
                              className="utilization-fill"
                              style={{ width: `${vehicle.utilization}%` }}
                            ></div>
                            <span className="utilization-text">{vehicle.utilization}%</span>
                          </div>
                        </td>
                        <td>
                          <span className={`vehicle-status status-${vehicle.status}`}>
                            {vehicle.status === 'active' ? 'Aktívne' : 
                             vehicle.status === 'service' ? 'Servis' : 'Neaktívne'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          {/* Spodný rad grafov */}
          <div className="bottom-charts-container">
            {/* Graf prejdených kilometrov */}
            <div className="chart-card medium">
              <div className="chart-header">
                <h3 className="chart-title">Prejdené kilometre</h3>
              </div>
              <div className="chart-content">
              <ResponsiveContainer width="100%" height={250}>
  <LineChart data={filteredDistanceData.data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
    <XAxis dataKey="date" tickFormatter={formatXAxis} />
    <YAxis 
      tickFormatter={(value: number) => {
        if (value >= 1000) return `${(value/1000).toFixed(0)}k`;
        return value.toString();
      }}
    />
    <Tooltip content={<CustomTooltip />} />
    <Line 
      type="monotone" 
      dataKey="value" 
      stroke={mockDistanceData.color} 
      name={mockDistanceData.name} 
      unit={mockDistanceData.unit}
      dot={false}
    />
  </LineChart>
</ResponsiveContainer>
              </div>
            </div>
            
            {/* Koláčový graf rozdelenia nákladov */}
            <div className="chart-card medium">
              <div className="chart-header">
                <h3 className="chart-title">Rozdelenie nákladov</h3>
              </div>
              <div className="chart-content">
              <ResponsiveContainer width="100%" height={250}>
  <PieChart>
    <Pie
      data={mockCostBreakdown}
      cx="50%"
      cy="50%"
      labelLine={false}
      outerRadius={80}
      dataKey="value"
      nameKey="name"
      label={({ name, percent }: { name: string; percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
    >
      {mockCostBreakdown.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]} />
      ))}
    </Pie>
    <Tooltip formatter={(value: number) => formatNumber(value, '€')} />
  </PieChart>
</ResponsiveContainer>
              </div>
            </div>
            
            {/* Graf emisií CO2 */}
            <div className="chart-card medium">
              <div className="chart-header">
                <h3 className="chart-title">CO2 Emisie</h3>
              </div>
              <div className="chart-content">
                <ResponsiveContainer width="100%" height={250}>
                  <ComposedChart data={mockEmissionsData.data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => formatNumber(value, 't')} />
                    <Bar dataKey="value" fill={mockEmissionsData.color} name="CO2 Emisie" unit="t" />
                    <Line type="monotone" dataKey="value" stroke="#455a64" name="Trend" unit="t" dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HaulerAnalytics;