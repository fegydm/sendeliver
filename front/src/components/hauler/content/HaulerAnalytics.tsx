// File: ./front/src/components/hauler/content/HaulerAnalytics.tsx
// Last change: Initial implementation of hauler analytics component

import React from "react";
import "./hauler.cards.css";

const HaulerAnalytics: React.FC = () => {
  return (
    <div className="hauler-card">
      <div className="analytics-container">
        <h2>Analytika</h2>
        <div className="analytics-filters">
          <div className="filter-group">
            <label>Obdobie:</label>
            <select>
              <option>Posledných 7 dní</option>
              <option>Posledných 30 dní</option>
              <option>Tento mesiac</option>
              <option>Tento rok</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Zobraziť:</label>
            <select>
              <option>Všetky vozidlá</option>
              <option>Nákladné vozidlá</option>
              <option>Dodávky</option>
            </select>
          </div>
        </div>
        <div className="analytics-charts">
          <div className="chart-container">
            <h3>Najazdené kilometre</h3>
            <div className="chart-placeholder"></div>
          </div>
          <div className="chart-container">
            <h3>Spotreba paliva</h3>
            <div className="chart-placeholder"></div>
          </div>
          <div className="chart-container">
            <h3>Príjmy vs. náklady</h3>
            <div className="chart-placeholder"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HaulerAnalytics;