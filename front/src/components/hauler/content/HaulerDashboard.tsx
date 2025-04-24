// File: ./front/src/components/hauler/content/HaulerDashboard.tsx
// Last change: Fixed SVG attributes from kebab-case to camelCase for React compatibility

import React, { useEffect, useState } from "react";
import "./dashboard.cards.css";

interface DashboardProps {
  // Props can be extended as needed
}

interface VehicleStats {
  export: number;
  import: number;
  ready: number;
  parking: number;
}

const HaulerDashboard: React.FC<DashboardProps> = () => {
  const [stats, setStats] = useState<VehicleStats>({
    export: 2,
    import: 5,
    ready: 4,
    parking: 6
  });

  // Later, you would fetch these stats from your API
  useEffect(() => {
    // Example API call
    // const fetchStats = async () => {
    //   const response = await fetch('/api/vehicles/stats');
    //   const data = await response.json();
    //   setStats(data);
    // };
    // fetchStats();
  }, []);

  // Calculate percentages for the pie chart
  const total = stats.export + stats.import + stats.ready + stats.parking;
  const exportPercentage = ((stats.export / total) * 100).toFixed(1);
  const importPercentage = ((stats.import / total) * 100).toFixed(1);
  const readyPercentage = ((stats.ready / total) * 100).toFixed(1);
  const parkingPercentage = ((stats.parking / total) * 100).toFixed(1);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>PREHĽAD O VOZIDLÁCH</h1>
        <p className="dashboard-subheader">(exportných, importných, pripravených na nasadenie, parkujúcich)</p>
      </div>
      
      <div className="dashboard-content">
        <div className="dashboard-stats">
          <div className="dashboard-stat-row">
            <div className="dashboard-stat-card export">
              <h2>EXPORT</h2>
              <div className="stat-value export-value">{stats.export}</div>
            </div>
            
            <div className="dashboard-stat-card import">
              <h2>IMPORT</h2>
              <div className="stat-value import-value">{stats.import}</div>
            </div>
          </div>
          
          <div className="dashboard-stat-row">
            <div className="dashboard-stat-card ready">
              <h2>READY</h2>
              <div className="stat-value ready-value">{stats.ready}</div>
            </div>
            
            <div className="dashboard-stat-card parking">
              <h2>PARKING</h2>
              <div className="stat-value parking-value">{stats.parking}</div>
            </div>
          </div>
        </div>
        
        <div className="dashboard-chart">
          <svg viewBox="0 0 100 100" className="pie-chart">
            {/* Create pie chart sections with calculated percentages */}
            {/* This is a simplified version; in a real implementation, you'd calculate actual segment paths */}
            <circle className="pie-segment export-segment" cx="50" cy="50" r="40" 
                    strokeDasharray={`${exportPercentage} 100`} />
            <circle className="pie-segment import-segment" cx="50" cy="50" r="40" 
                    strokeDasharray={`${importPercentage} 100`} 
                    strokeDashoffset={`-${exportPercentage}`} />
            <circle className="pie-segment ready-segment" cx="50" cy="50" r="40" 
                    strokeDasharray={`${readyPercentage} 100`} 
                    strokeDashoffset={`-${Number(exportPercentage) + Number(importPercentage)}`} />
            <circle className="pie-segment parking-segment" cx="50" cy="50" r="40" 
                    strokeDasharray={`${parkingPercentage} 100`} 
                    strokeDashoffset={`-${Number(exportPercentage) + Number(importPercentage) + Number(readyPercentage)}`} />
          </svg>
          
          <div className="chart-legend">
            <div className="legend-item">
              <div className="legend-color export-color"></div>
              <div className="legend-text">Export: {exportPercentage}%</div>
            </div>
            <div className="legend-item">
              <div className="legend-color import-color"></div>
              <div className="legend-text">Import: {importPercentage}%</div>
            </div>
            <div className="legend-item">
              <div className="legend-color ready-color"></div>
              <div className="legend-text">Ready: {readyPercentage}%</div>
            </div>
            <div className="legend-item">
              <div className="legend-color parking-color"></div>
              <div className="legend-text">Parking: {parkingPercentage}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HaulerDashboard;