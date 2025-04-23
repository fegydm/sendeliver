// File: ./front/src/components/hauler/content/HaulerLogbook.tsx
// Last change: Initial implementation of hauler logbook component

import React from "react";
import "./hauler.cards.css";

const HaulerLogbook: React.FC = () => {
  const logEntries = [
    { id: 1, date: "2023-04-15", driver: "Ján Novák", vehicle: "Dodávka plachta titrol", destination: "Praha", status: "Dokončená" },
    { id: 2, date: "2023-04-10", driver: "Peter Malý", vehicle: "Dodávka skriňa biela", destination: "Viedeň", status: "Dokončená" },
    { id: 3, date: "2023-04-20", driver: "Martin Veľký", vehicle: "Ťahač biely", destination: "Budapešť", status: "Prebieha" },
  ];
  
  return (
    <div className="hauler-card">
      <div className="logbook-container">
        <h2>Denník jázd</h2>
        <div className="logbook-table">
          <div className="logbook-header">
            <div className="logbook-cell">Dátum</div>
            <div className="logbook-cell">Vodič</div>
            <div className="logbook-cell">Vozidlo</div>
            <div className="logbook-cell">Destinácia</div>
            <div className="logbook-cell">Stav</div>
          </div>
          {logEntries.map(entry => (
            <div key={entry.id} className="logbook-row">
              <div className="logbook-cell">{entry.date}</div>
              <div className="logbook-cell">{entry.driver}</div>
              <div className="logbook-cell">{entry.vehicle}</div>
              <div className="logbook-cell">{entry.destination}</div>
              <div className="logbook-cell">{entry.status}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HaulerLogbook;