// File: front/src/components/hauler/content/HaulerBilling.tsx
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from "recharts";
import "./hauler.cards.css";
import "./billing.css";

// Mock data for billing
const mockInvoices = [
  { id: "INV-2023-001", date: "2023-04-01", client: "ABC Logistics", amount: 1250.5, status: "Zaplatená", dueDate: "2023-04-10" },
  { id: "INV-2023-002", date: "2023-04-15", client: "TransEurope s.r.o.", amount: 2340.0, status: "Čaká na úhradu", dueDate: "2023-04-25" },
  { id: "INV-2023-003", date: "2023-04-22", client: "Global Shipping Ltd.", amount: 890.75, status: "Čaká na úhradu", dueDate: "2023-05-01" },
  { id: "INV-2023-004", date: "2023-03-20", client: "Cargo Solutions", amount: 1560.2, status: "Po splatnosti", dueDate: "2023-03-30" },
];

// Revenue trend data
const mockRevenueTrend = {
  data: [
    { date: "2023-01", value: 5000 },
    { date: "2023-02", value: 4500 },
    { date: "2023-03", value: 6000 },
    { date: "2023-04", value: 4481.25 },
  ],
  name: "Mesačný obrat",
  unit: "€",
  color: "#4caf50",
};

// Status distribution for pie chart
const mockStatusDistribution = [
  { name: "Zaplatené", value: 1250.5 },
  { name: "Čaká na úhradu", value: 3230.75 },
  { name: "Po splatnosti", value: 1560.2 },
];

const CHART_COLORS = ["#4caf50", "#ff9800", "#f44336"];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const HaulerBilling: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<keyof typeof mockInvoices[0]>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const formatNumber = (value: number, unit: string): string => {
    return new Intl.NumberFormat("sk-SK", {
      style: unit === "€" ? "currency" : "decimal",
      currency: unit === "€" ? "EUR" : undefined,
      maximumFractionDigits: unit === "€" ? 2 : 0,
    }).format(value);
  };

  const formatDate = (dateStr: string): string => {
    return new Intl.DateTimeFormat("sk-SK", { day: "numeric", month: "long", year: "numeric" }).format(new Date(dateStr));
  };

// Define type for Pie label props
interface PieLabelProps {
  name: string;
  percent: number;
}


  const filteredInvoices = useMemo(() => {
    let result = [...mockInvoices];
    if (filterStatus !== "all") {
      result = result.filter(inv => inv.status.toLowerCase() === filterStatus.toLowerCase());
    }
    if (searchTerm) {
      result = result.filter(inv =>
        inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.client.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    result.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (sortBy === "amount") {
        const diff = Number(aVal) - Number(bVal);
        return sortOrder === "asc" ? diff : -diff;
      }
      return sortOrder === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
    return result;
  }, [filterStatus, searchTerm, sortBy, sortOrder]);

  const summary = useMemo(() => ({
    totalTurnover: mockInvoices.reduce((sum, inv) => sum + inv.amount, 0),
    pending: mockInvoices
      .filter(inv => inv.status === "Čaká na úhradu")
      .reduce((sum, inv) => sum + inv.amount, 0),
    paid: mockInvoices
      .filter(inv => inv.status === "Zaplatená")
      .reduce((sum, inv) => sum + inv.amount, 0),
    overdue: mockInvoices
      .filter(inv => inv.status === "Po splatnosti")
      .reduce((sum, inv) => sum + inv.amount, 0),
  }), []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{`Dátum: ${label}`}</p>
          {payload.map((entry: any, idx: number) => (
            <p key={idx} style={{ color: entry.color }}>
              {`${entry.name}: ${formatNumber(entry.value, entry.payload.unit || '')}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="hauler-card billing-container">
      {/* Header with actions */}
      <motion.div
        className="billing-header"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2>Fakturácia</h2>
        <div className="billing-actions">
          <button onClick={() => alert("Nová faktúra")}>+ Nová faktúra</button>
          <button className="secondary" onClick={() => alert("Export PDF")}>Export PDF</button>
        </div>
      </motion.div>

      {isLoading ? (
        <motion.div className="billing-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="spinner"></div>
          <p>Načítavam fakturačné údaje...</p>
        </motion.div>
      ) : (
        <AnimatePresence>
          <motion.div className="billing-content" initial="hidden" animate="visible" variants={cardVariants}>
            {/* Summary cards */}
            <div className="billing-summary">
              <motion.div className="billing-summary-card" variants={cardVariants}>
                <div className="summary-title">Celkový obrat</div>
                <div className="summary-value">{formatNumber(summary.totalTurnover, '€')}</div>
              </motion.div>
              <motion.div className="billing-summary-card" variants={cardVariants}>
                <div className="summary-title">Čaká na úhradu</div>
                <div className="summary-value">{formatNumber(summary.pending, '€')}</div>
              </motion.div>
              <motion.div className="billing-summary-card" variants={cardVariants}>
                <div className="summary-title">Zaplatené</div>
                <div className="summary-value">{formatNumber(summary.paid, '€')}</div>
              </motion.div>
              <motion.div className="billing-summary-card overdue" variants={cardVariants}>
                <div className="summary-title">Po splatnosti</div>
                <div className="summary-value">{formatNumber(summary.overdue, '€')}</div>
              </motion.div>
            </div>

            {/* Charts */}
            <div className="billing-charts">
              <motion.div className="chart-card" variants={cardVariants}>
                <h3>Trend obratu</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={mockRevenueTrend.data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="date" />
                    <YAxis tickFormatter={(v: number) => (v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v))} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="value" stroke={mockRevenueTrend.color} name={mockRevenueTrend.name} unit={mockRevenueTrend.unit} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
              <motion.div className="chart-card" variants={cardVariants}>
                <h3>Rozdelenie podľa stavu</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                  // Use typed label function
<Pie
  data={mockStatusDistribution}
  cx="50%"
  cy="50%"
  labelLine={false}
  outerRadius={80}
  dataKey="value"
  nameKey="name"
  label={({ name, percent }: PieLabelProps) => `${name}: ${(percent * 100).toFixed(0)}%`}
/>
                    <RechartsTooltip formatter={(v: number) => formatNumber(v, '€')} />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            {/* Filters */}
            <motion.div className="billing-filters" variants={cardVariants}>
              <div className="filter-group">
                <label htmlFor="status-filter">Stav:</label>
                <select id="status-filter" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                  <option value="all">Všetky</option>
                  <option value="Zaplatená">Zaplatené</option>
                  <option value="Čaká na úhradu">Čaká na úhradu</option>
                  <option value="Po splatnosti">Po splatnosti</option>
                </select>
              </div>
              <div className="filter-group">
                <label htmlFor="search">Hľadať:</label>
                <input id="search" type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Hľadať podľa ID alebo klienta" />
              </div>
            </motion.div>

            {/* Invoice table */}
            <motion.div className="billing-table" variants={cardVariants}>
              <table>
                <thead>
                  <tr>
                    {['Faktúra', 'Dátum', 'Klient', 'Suma', 'Stav', 'Akcie'].map((h, idx) => {
                      const key = ['id','date','client','amount','status'][idx] as keyof typeof mockInvoices[0];
                      return (
                        <th key={h} onClick={() => { setSortBy(key); setSortOrder(sortBy===key && sortOrder==='asc' ? 'desc':'asc'); }} className={sortBy===key?sortOrder:''}>
                          {h}{sortBy===key && <span className="sort-icon">{sortOrder==='asc'?'↑':'↓'}</span>}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map(inv => (
                    // @ts-ignore
                    <motion.tr key={inv.id} initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.3}} className={inv.status==='Po splatnosti'?'overdue':''}>
                      <td>{inv.id}</td>
                      <td>{formatDate(inv.date)}</td>
                      <td>{inv.client}</td>
                      <td>{formatNumber(inv.amount,'€')}</td>
                      <td><span className={`status-${inv.status.replace(/\s+/g,'-').toLowerCase()}`}>{inv.status}</span></td>
                      <td>
                        <button onClick={()=>alert(`Zobraziť ${inv.id}`)}>Zobraziť</button>
                        <button onClick={()=>alert(`PDF ${inv.id}`)} className="secondary">PDF</button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default HaulerBilling;
