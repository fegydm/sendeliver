// File: src/components/hauler/analytics/analytics.component.tsx
// Účel: Kompletná verzia analytického panela s BEM triedami a všetkými pôvodnými grafmi.

import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, Area, AreaChart } from 'recharts';
import { mockPerformanceMetrics, mockRevenueData, mockDeliveriesData, mockDistanceData, mockRevenueByType, mockTopCustomers, mockVehicleUtilization, mockCostBreakdown } from '@/data/mockAnalyticsData';
import './analytics.component.css';

const CHART_COLORS = ["#4caf50", "#2196f3", "#ff9800", "#f44336", "#673ab7", "#3f51b5"];

const AnalyticsComponent: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [timeRange]);

  const formatNumber = (value: number, unit: string = '') => {
    if (unit === '€') return new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
    return `${new Intl.NumberFormat('sk-SK').format(value)}${unit ? ' ' + unit : ''}`;
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <span className="metric-card__trend metric-card__trend--positive">↑</span>;
    if (trend === 'down') return <span className="metric-card__trend metric-card__trend--negative">↓</span>;
    return <span className="metric-card__trend metric-card__trend--stable">→</span>;
  };

  const timeSeriesData = useMemo(() => {
    const dataMap: any = { revenue: mockRevenueData.data, deliveries: mockDeliveriesData.data, distance: mockDistanceData.data };
    return Object.keys(dataMap).reduce((acc, key) => {
        let data = dataMap[key];
        if (timeRange === 'week') data = data.slice(-7);
        if (timeRange === 'month') data = data.slice(-30);
        acc[key] = data;
        return acc;
    }, {} as any);
  }, [timeRange]);

  return (
    <div className="analytics">
      <div className="analytics__toolbar">
        <div className="analytics__toolbar-group">
          <h1 className="analytics__title">Analytika</h1>
        </div>
        <div className="analytics__toolbar-group">
          <div className="time-range">
            {(['week', 'month', 'year'] as const).map(range => (
              <button key={range} className={`time-range__button ${timeRange === range ? 'time-range__button--active' : ''}`} onClick={() => setTimeRange(range)}>
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="analytics__loader"><div className="spinner"></div></div>
      ) : (
        <div className="analytics__content">
          <div className="metrics-grid">
            {mockPerformanceMetrics.map(metric => (
              <div key={metric.id} className="metric-card">
                <div className="metric-card__header">
                  <h3 className="metric-card__title">{metric.name}</h3>
                  <div className={`metric-card__change ${metric.change >= 0 ? 'metric-card__change--positive' : 'metric-card__change--negative'}`}>
                    {getTrendIcon(metric.trend)}
                    <span>{metric.change.toFixed(1)}%</span>
                  </div>
                </div>
                <p className="metric-card__value">{formatNumber(metric.value, metric.unit)}</p>
              </div>
            ))}
          </div>

          <div className="chart-grid chart-grid--two-columns">
            <div className="chart-card">
              <h3 className="chart-card__title">Vývoj Príjmov (€)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={timeSeriesData.revenue}>
                  <Tooltip formatter={(value: number) => formatNumber(value, '€')} />
                  <Area type="monotone" dataKey="value" stroke="#4caf50" fill="#4caf50" fillOpacity={0.1} name="Príjmy"/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-card">
              <h3 className="chart-card__title">Počet Prepráv</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={timeSeriesData.deliveries}>
                  <Tooltip formatter={(value: number) => formatNumber(value, 'ks')} />
                  <Bar dataKey="value" fill="#2196f3" name="Počet preprav" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="chart-grid chart-grid--three-columns">
            <div className="chart-card">
              <h3 className="chart-card__title">Príjmy podľa Typu</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={mockRevenueByType} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {mockRevenueByType.map((entry, index) => <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatNumber(value, '€')} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-card">
              <h3 className="chart-card__title">Rozdelenie Nákladov</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={mockCostBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} label>
                    {mockCostBreakdown.map((entry, index) => <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatNumber(value, '€')} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-card">
              <h3 className="chart-card__title">Prejdená Vzdialenosť (km)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={timeSeriesData.distance}>
                   <Tooltip formatter={(value: number) => formatNumber(value, 'km')} />
                   <Line type="monotone" dataKey="value" stroke="#ff9800" strokeWidth={2} name="Vzdialenosť" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="table-grid">
            <div className="table-card">
              <h3 className="table-card__title">TOP Zákazníci</h3>
              <table className="data-table">
                <thead>
                  <tr><th>Zákazník</th><th>Prepravy</th><th>Príjem</th></tr>
                </thead>
                <tbody>
                  {mockTopCustomers.map(c => (
                    <tr key={c.id}><td>{c.name}</td><td>{c.deliveries}</td><td>{formatNumber(c.revenue, '€')}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
             <div className="table-card">
              <h3 className="table-card__title">Využitie Vozidiel</h3>
              <table className="data-table">
                <thead>
                  <tr><th>Vozidlo</th><th>Využitie</th></tr>
                </thead>
                <tbody>
                  {mockVehicleUtilization.map(v => (
                    <tr key={v.id}>
                      <td>{v.name}</td>
                      <td>
                        <div className="utilization-bar">
                          <div className="utilization-bar__fill" style={{ width: `${v.utilization}%` }}>{v.utilization}%</div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsComponent;