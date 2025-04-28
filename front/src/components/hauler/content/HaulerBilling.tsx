
// File: ./front/src/components/hauler/content/HaulerBilling.tsx
// Last change: Complete implementation of billing dashboard with visualizations and animations

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import "./hauler.cards.css";
import "./billing.css";

// Mock dáta pre fakturáciu
const mockInvoices = [
  { id: "INV-2023-001", date: "2023-04-01", client: "ABC Logistics", amount: 1250.50, status: "Zaplatená", dueDate: "2023-04-10" },
  { id: "INV-2023-002", date: "2023-04-15", client: "TransEurope s.r.o.", amount: 2340.00, status: "Čaká na úhradu", dueDate: "2023-04-25" },
  { id: "INV-2023-003", date: "2023-04-22", client: "Global Shipping Ltd.", amount: 890.75, status: "Čaká na úhradu", dueDate: "2023-05-01" },
  { id: "INV-2023-004", date: "2023-03-20", client: "Cargo Solutions", amount: 1560.20, status: "Po splatnosti", dueDate: "2023-03-30" },
];

// Mock dáta pre grafy
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

const mockStatusDistribution = [
  { name: "Zaplatené", value: 1250.50 },
  { name: "Čaká na úhradu", value: 3230.75 },
  { name: "Po splatnosti", value: 1560.20 },
];

const CHART_COLORS = ["#4caf50", "#ff9800", "#f44336"];

const HaulerBilling: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<keyof typeof mockInvoices[0]>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Simulácia načítania
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Formátovanie čísel
  const formatNumber = (value: number, unit: string): string => {
    return new Intl.NumberFormat("sk-SK", {
      style: unit === "€" ? "currency" : "decimal",
      currency: unit === "€" ? "EUR" : undefined,
      maximumFractionDigits: unit === "€" ? 2 : 0,
    }).format(value);
  };

  // Formátovanie dátumu
  const formatDate = (dateStr: string): string => {
    return new Intl.DateTimeFormat("sk-SK", { day: "numeric", month: "long", year: "numeric" }).format(new Date(dateStr));
  };

  // Filtrovanie a triedenie faktúr
  const filteredInvoices = useMemo(() => {
    let result = [...mockInvoices];
    
    // Filtrovanie podľa stavu
    if (filterStatus !== "all") {
      result = result.filter(invoice => invoice.status.toLowerCase() === filterStatus.toLowerCase());
    }

    // Filtrovanie podľa vyhľadávania
    if (searchTerm) {
      result = result.filter(invoice => 
        invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.client.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Triedenie
    result.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      if (sortBy === "amount") {
        // Explicitne skonvertujeme na number
        const aNum = Number(aValue);
        const bNum = Number(bValue);
        return sortOrder === "asc" ? aNum - bNum : bNum - aNum;
      }
      return sortOrder === "asc"
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });

    return result;
  }, [filterStatus, searchTerm, sortBy, sortOrder]);

  // Súhrnné metriky
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

  // Custom tooltip pre grafy
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

  // Animácia pre karty
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="hauler-card billing-container">
      <motion.div 
        className="billing-header"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2>Fakturácia</h2>
        <div className="billing-actions">
          <button 
            className="billing-action-button" 
            aria-label="Vytvoriť novú faktúru"
            onClick={() => alert("Vytvorenie novej faktúry (placeholder)")}
          >
            + Nová faktúra
          </button>
          <button 
            className="billing-action-button secondary" 
            aria-label="Exportovať faktúry"
            onClick={() => alert("Export do PDF (placeholder)")}
          >
            Export PDF
          </button>
        </div>
      </motion.div>

      {isLoading ? (
        <motion.div 
          className="billing-loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="spinner"></div>
          <p>Načítavam fakturačné údaje...</p>
        </motion.div>
      ) : (
        <AnimatePresence>
          <motion.div 
            className="billing-content"
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            {/* Súhrnné KPI karty */}
            <div className="billing-summary">
              <motion.div className="billing-summary-card" variants={cardVariants}>
                <div className="summary-title">Mesačný obrat</div>
                <div className="summary-value">{formatNumber(summary.totalTurnover, "€")}</div>
              </motion.div>
              <motion.div className="billing-summary-card" variants={cardVariants}>
                <div className="summary-title">Čaká na úhradu</div>
                <div className="summary-value">{formatNumber(summary.pending, "€")}</div>
              </motion.div>
              <motion.div className="billing-summary-card" variants={cardVariants}>
                <div className="summary-title">Zaplatené</div>
                <div className="summary-value">{formatNumber(summary.paid, "€")}</div>
              </motion.div>
              <motion.div className="billing-summary-card overdue" variants={cardVariants}>
                <div className="summary-title">Po splatnosti</div>
                <div className="summary-value">{formatNumber(summary.overdue, "€")}</div>
              </motion.div>
            </div>

            {/* Grafy */}
            <div className="billing-charts">
              <motion.div className="chart-card" variants={cardVariants}>
                <h3 className="chart-title">Trend obratu</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={mockRevenueTrend.data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="date" />
                    <YAxis tickFormatter={(value: number) => value >= 1000 ? `${(value/1000).toFixed(0)}k` : value.toString()} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke={mockRevenueTrend.color} 
                      name={mockRevenueTrend.name} 
                      unit={mockRevenueTrend.unit}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
              <motion.div className="chart-card" variants={cardVariants}>
                <h3 className="chart-title">Rozdelenie podľa stavu</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={mockStatusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }: { name: string; percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {mockStatusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatNumber(value, "€")} />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            {/* Filtrovanie a vyhľadávanie */}
            <motion.div className="billing-filters" variants={cardVariants}>
              <div className="filter-group">
                <label htmlFor="status-filter">Stav:</label>
                <select 
                  id="status-filter" 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  aria-label="Filtrovať podľa stavu"
                >
                  <option value="all">Všetky</option>
                  <option value="Zaplatená">Zaplatené</option>
                  <option value="Čaká na úhradu">Čaká na úhradu</option>
                  <option value="Po splatnosti">Po splatnosti</option>
                </select>
              </div>
              <div className="filter-group">
                <label htmlFor="search">Hľadať:</label>
                <input
                  id="search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Hľadať podľa ID alebo klienta"
                  aria-label="Vyhľadávanie faktúr"
                />
              </div>
            </motion.div>

            {/* Tabuľka faktúr */}
            <motion.div className="billing-table" variants={cardVariants}>
              <table>
                <thead>
                  <tr>
                    {["Číslo faktúry", "Dátum", "Klient", "Suma", "Stav", "Akcie"].map((header, index) => (
                      <th 
                        key={header}
                        scope="col"
                        onClick={() => {
                          const key = ["id", "date", "client", "amount", "status"][index] as keyof typeof mockInvoices[0];
                          if (key) {
                            setSortBy(key);
                            setSortOrder(sortBy === key && sortOrder === "asc" ? "desc" : "asc");
                          }
                        }}
                        className={sortBy === ["id", "date", "client", "amount", "status"][index] ? `sorted ${sortOrder}` : ""}
                      >
                        {header}
                        {sortBy === ["id", "date", "client", "amount", "status"][index] && (
                          <span className="sort-icon">{sortOrder === "asc" ? "↑" : "↓"}</span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map(invoice => (
                    <motion.tr 
                      key={invoice.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className={invoice.status === "Po splatnosti" ? "overdue" : ""}
                    >
                      <td>{invoice.id}</td>
                      <td>{formatDate(invoice.date)}</td>
                      <td>{invoice.client}</td>
                      <td>{formatNumber(invoice.amount, "€")}</td>
                      <td>
                        <span className={`status-badge status-${invoice.status.toLowerCase().replace(" ", "-")}`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="billing-action" 
                          onClick={() => alert(`Zobrazenie faktúry ${invoice.id} (placeholder)`)}
                          aria-label={`Zobraziť faktúru ${invoice.id}`}
                        >
                          Zobraziť
                        </button>
                        <button 
                          className="billing-action secondary" 
                          onClick={() => alert(`Stiahnutie PDF ${invoice.id} (placeholder)`)}
                          aria-label={`Stiahnuť PDF faktúry ${invoice.id}`}
                        >
                          PDF
                        </button>
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
