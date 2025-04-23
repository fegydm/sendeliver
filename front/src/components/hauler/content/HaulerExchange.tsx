// File: ./front/src/components/hauler/content/HaulerExchange.tsx
// Last change: Initial implementation of hauler exchange component

import React from "react";
import "./hauler.cards.css";

const HaulerExchange: React.FC = () => {
  const exchangeItems = [
    { id: 1, type: "Náklad", from: "Bratislava", to: "Praha", date: "2023-05-01", price: "350 €", status: "Aktívne" },
    { id: 2, type: "Náklad", from: "Viedeň", to: "Budapešť", date: "2023-05-03", price: "280 €", status: "Aktívne" },
    { id: 3, type: "Vozidlo", location: "Košice", availability: "2023-05-10", price: "1.2 €/km", status: "Aktívne" },
  ];
  
  return (
    <div className="hauler-card">
      <div className="exchange-container">
        <h2>Burza prepráv</h2>
        <div className="exchange-tabs">
          <button className="exchange-tab active">Všetky</button>
          <button className="exchange-tab">Náklady</button>
          <button className="exchange-tab">Vozidlá</button>
        </div>
        <div className="exchange-list">
          {exchangeItems.map(item => (
            <div key={item.id} className="exchange-item">
              <div className="exchange-item-header">
                <div className="exchange-item-type">{item.type}</div>
                <div className="exchange-item-status">{item.status}</div>
              </div>
              <div className="exchange-item-details">
                {item.type === "Náklad" ? (
                  <>
                    <div className="exchange-item-route">{item.from} → {item.to}</div>
                    <div className="exchange-item-date">Dátum: {item.date}</div>
                  </>
                ) : (
                  <>
                    <div className="exchange-item-location">Lokalita: {item.location}</div>
                    <div className="exchange-item-availability">Dostupné od: {item.availability}</div>
                  </>
                )}
                <div className="exchange-item-price">{item.price}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HaulerExchange;