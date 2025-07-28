// File: src/apps/hauler/dashboard/dashboard.tsx
// Last change: Migrated from dashboard.component.tsx with updated CSS import

import React from "react";
import "./dashboard.css";

interface DashboardComponentProps {
  setActiveTab: (tabId: string) => void;
}

const DashboardComponent: React.FC<DashboardComponentProps> = ({ setActiveTab }) => {
  // TODO: Load real data from backend/WebSocket
  const priorityAlerts = [
    { id: 1, type: "sos", vehicle: "TT-789EF", driver: "Eva Malá", text: 'Hlásenie "SOS"' },
    { id: 2, type: "delay", vehicle: "KE-123AB", driver: "Peter Novák", text: "Meškanie (35 min)" },
    { id: 3, type: "service", vehicle: "DAF XF", driver: "Ján Kováč", text: "Blíži sa servisná prehliadka" },
  ];

  const handleShowOnMap = (vehicleId: string) => {
    // TODO: Implement logic to send vehicle ID to map component
    setActiveTab("mapa");
  };
  
  const handleManageVehicle = (vehicleId: string) => {
    // TODO: Implement logic to send vehicle ID to fleet component
    setActiveTab("zdroje");
  };

  const handleOpenControlPanel = (vehicleId: string) => {
    // TODO: Implement control panel modal logic
    alert(`TODO: Otvoriť Ovládací Panel pre ${vehicleId}`);
  };

  return (
    <div className="widget-dashboard">
      <h1 className="widget-dashboard__title">Dashboard</h1>
      <div className="widget-dashboard__grid">
        <div className="widget">
          <h2 className="widget__title">⚠️ Prioritné Udalosti ({priorityAlerts.length})</h2>
          <div className="widget__content">
            {priorityAlerts.map(alert => (
              <div key={alert.id} className="alert-item">
                <span className={`alert-item__icon alert-item__icon--${alert.type}`}>
                  {alert.type === 'sos' ? '🆘' : alert.type === 'delay' ? '🔴' : '🟠'}
                </span>
                <div className="alert-item__text">
                  <strong>{alert.vehicle}</strong> - {alert.text}
                </div>
                <div className="alert-item__actions">
                  <button 
                    type="button"
                    onClick={() => handleOpenControlPanel(alert.vehicle)}
                  >
                    Detail
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleShowOnMap(alert.vehicle)}
                  >
                    Mapa
                  </button>
                  {alert.type === 'service' && (
                    <button 
                      type="button"
                      onClick={() => handleManageVehicle(alert.vehicle)}
                    >
                      Spravovať
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="widget">
          <h2 className="widget__title">📥 Nevybavené Úlohy (2)</h2>
          <div className="widget__content">
            <p>
              📄 Nové dokumenty na schválenie: (1) 
              <button type="button">Zobraziť</button>
            </p>
            <p>
              💬 Nové správy vyžadujúce odpoveď: (1) 
              <button type="button">Odpovedať</button>
            </p>
          </div>
        </div>

        <div className="widget">
          <h2 className="widget__title">📈 Exchange: Nové Ponuky (5)</h2>
          <div className="widget__content">
             <p>
               Preprava paliet: Bratislava → Mníchov 
               <button 
                 type="button"
                 onClick={() => setActiveTab('burza')}
               >
                 Detail
               </button>
             </p>
             <p>
               Preprava ocele: Košice → Katowice 
               <button 
                 type="button"
                 onClick={() => setActiveTab('burza')}
               >
                 Detail
               </button>
             </p>
          </div>
        </div>
        
        <div className="widget">
          <h2 className="widget__title">📊 Súhrn Flotily (Live)</h2>
          <div className="widget__content">
            <p>V pohybe: 15</p>
            <p>Pauza: 5</p>
            <p>Problém: 1</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export { DashboardComponent };
export default DashboardComponent;