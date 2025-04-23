// File: ./front/src/components/hauler/content/HaulerBilling.tsx
// Last change: Initial implementation of hauler billing component

import React from "react";
import "./hauler.cards.css";

const HaulerBilling: React.FC = () => {
  const invoices = [
    { id: "INV-2023-001", date: "2023-04-01", client: "ABC Logistics", amount: "1250.50 €", status: "Zaplatená" },
    { id: "INV-2023-002", date: "2023-04-15", client: "TransEurope s.r.o.", amount: "2340.00 €", status: "Čaká na úhradu" },
    { id: "INV-2023-003", date: "2023-04-22", client: "Global Shipping Ltd.", amount: "890.75 €", status: "Čaká na úhradu" },
  ];
  
  return (
    <div className="hauler-card">
      <div className="billing-container">
        <h2>Fakturácia</h2>
        <div className="billing-summary">
          <div className="billing-summary-card">
            <div className="summary-title">Mesačný obrat</div>
            <div className="summary-value">4481.25 €</div>
          </div>
          <div className="billing-summary-card">
            <div className="summary-title">Čaká na úhradu</div>
            <div className="summary-value">3230.75 €</div>
          </div>
          <div className="billing-summary-card">
            <div className="summary-title">Zaplatené</div>
            <div className="summary-value">1250.50 €</div>
          </div>
        </div>
        <div className="billing-actions">
          <button className="billing-action-button">+ Nová faktúra</button>
        </div>
        <div className="billing-table">
          <div className="billing-header">
            <div className="billing-cell">Číslo faktúry</div>
            <div className="billing-cell">Dátum</div>
            <div className="billing-cell">Klient</div>
            <div className="billing-cell">Suma</div>
            <div className="billing-cell">Stav</div>
            <div className="billing-cell">Akcie</div>
          </div>
          {invoices.map(invoice => (
            <div key={invoice.id} className="billing-row">
              <div className="billing-cell">{invoice.id}</div>
              <div className="billing-cell">{invoice.date}</div>
              <div className="billing-cell">{invoice.client}</div>
              <div className="billing-cell">{invoice.amount}</div>
              <div className="billing-cell">{invoice.status}</div>
              <div className="billing-cell">
                <button className="billing-action">Zobraziť</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HaulerBilling;