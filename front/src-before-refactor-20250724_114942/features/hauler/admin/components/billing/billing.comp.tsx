// File: src/features/hauler/admin/components/billing/billing.comp.tsx
// Účel: Pod-sekcia pre správu fakturácie, ktorá importuje dáta z externého súboru.

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { Invoice, mockInvoices, mockRevenueTrend, mockStatusDistribution } from '@/data/mockBillingData';
import './billing.comp.css';

const CHART_COLORS = ["#4caf50", "#ff9800", "#f44336"];

const BillingComponent: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // TODO: V budúcnosti nahradiť API volaním
    setTimeout(() => {
      setInvoices(mockInvoices);
      setIsLoading(false);
    }, 500);
  }, []);

  const formatCurrency = (value: number) => new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR' }).format(value);

  const filteredInvoices = useMemo(() =>
    filterStatus === "all"
      ? invoices
      : invoices.filter(inv => inv.status === filterStatus),
    [invoices, filterStatus]
  );

  const summary = useMemo(() => ({
    total: invoices.reduce((sum, inv) => sum + inv.amount, 0),
    pending: invoices.filter(i => i.status === 'Čaká na úhradu').reduce((sum, inv) => sum + inv.amount, 0),
    overdue: invoices.filter(i => i.status === 'Po splatnosti').reduce((sum, inv) => sum + inv.amount, 0),
  }), [invoices]);

  if (isLoading) {
    return <div className="billing__loader"><div className="spinner"></div></div>;
  }

  return (
    <div className="billing">
      <div className="billing__header">
        <h1 className="billing__title">Fakturácia a Platby</h1>
        <button className="button button--primary">+ Nová Faktúra</button>
      </div>

      <motion.div className="billing__summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="summary-card">
          <h3 className="summary-card__title">Celkový Obrat</h3>
          <p className="summary-card__value">{formatCurrency(summary.total)}</p>
        </div>
        <div className="summary-card">
          <h3 className="summary-card__title">Čaká na Úhradu</h3>
          <p className="summary-card__value">{formatCurrency(summary.pending)}</p>
        </div>
        <div className="summary-card summary-card--overdue">
          <h3 className="summary-card__title">Po Splatnosti</h3>
          <p className="summary-card__value">{formatCurrency(summary.overdue)}</p>
        </div>
      </motion.div>
      
      <motion.div className="billing__charts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <div className="chart-card">
          <h3 className="chart-card__title">Trend Obratu</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={mockRevenueTrend.data}><Tooltip contentStyle={{ borderRadius: '8px' }} formatter={(value: number) => formatCurrency(value)}/><Line type="monotone" dataKey="value" stroke="#4caf50" strokeWidth={2} dot={{ r: 4 }} /></>
          </>
        </div>
        <div className="chart-card">
          <h3 className="chart-card__title">Stav Faktúr</h3>
           <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={mockStatusDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  labelLine={false}
                  label={({ percent }: { percent: number }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {mockStatusDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                </>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
              </>
          </>
        </div>
      </motion.div>

      <motion.div className="billing__table-wrapper" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <div className="table-card__header">
          <h3 className="table-card__title">Zoznam Faktúr</h3>
          <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">Všetky</option>
            <option value="Zaplatená">Zaplatené</option>
            <option value="Čaká na úhradu">Čaká na úhradu</option>
            <option value="Po splatnosti">Po splatnosti</option>
          </select>
        </div>
        <table className="data-table">
          <thead>
            <tr><th>Faktúra</th><th>Dátum</th><th>Klient</th><th>Suma</th><th>Stav</th></tr>
          </thead>
          <tbody>
            {filteredInvoices.map(inv => (
              <tr key={inv.id} className={`data-table__row--${inv.status === 'Po splatnosti' ? 'overdue' : 'default'}`}>
                <td>{inv.id}</td>
                <td>{new Date(inv.date).toLocaleDateString('sk-SK')}</td>
                <td>{inv.client}</td>
                <td>{formatCurrency(inv.amount)}</td>
                <td><span className={`status-badge status-badge--${inv.status.replace(/ /g, '-').toLowerCase()}`}>{inv.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}

export default BillingComponent;