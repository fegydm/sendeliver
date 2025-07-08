// File: front/src/components/hauler/dashboard/dashboard.component.tsx
// Účel: Nový "Morning Coffee" dashboard s akčnými widgetmi.

import React from "react";
import "./dashboard.component.css"; // Upravená cesta k CSS

interface DashboardComponentProps {
  setActiveTab: (tabId: string) => void;
}

const DashboardComponent: React.FC<DashboardComponentProps> = ({ setActiveTab }) => {
  // TODO: Načítať reálne dáta pre widgety z backendu/WebSocketu
  const priorityAlerts = [
    { id: 1, type: "sos", vehicle: "TT-789EF", driver: "Eva Malá", text: 'Hlásenie "SOS"' },
    { id: 2, type: "delay", vehicle: "KE-123AB", driver: "Peter Novák", text: "Meškanie (35 min)" },
    { id: 3, type: "service", vehicle: "DAF XF", driver: "Ján Kováč", text: "Blíži sa servisná prehliadka" },
  ];

  const handleShowOnMap = (vehicleId: string) => {
    // TODO: Implementovať logiku na poslanie ID vozidla do mapového komponentu
    setActiveTab("maps");
  };
  
  const handleManageVehicle = (vehicleId: string) => {
    // TODO: Implementovať logiku na poslanie ID vozidla do komponentu Voz. Parku
    setActiveTab("fleet");
  };

  const handleOpenControlPanel = (vehicleId: string) => {
    // TODO: Implementovať logiku na otvorenie Ovládacieho Panela (modálneho okna)
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
                <span className={`alert-item__icon alert-item__icon--${alert.type}`}>{alert.type === 'sos' ? '🆘' : alert.type === 'delay' ? '🔴' : '🟠'}</span>
                <div className="alert-item__text">
                  <strong>{alert.vehicle}</strong> - {alert.text}
                </div>
                <div className="alert-item__actions">
                  <button onClick={() => handleOpenControlPanel(alert.vehicle)}>Panel</button>
                  <button onClick={() => handleShowOnMap(alert.vehicle)}>Mapa</button>
                  {alert.type === 'service' && <button onClick={() => handleManageVehicle(alert.vehicle)}>Spravovať</button>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="widget">
          <h2 className="widget__title">📥 Nevybavené Úlohy (2)</h2>
          <div className="widget__content">
            <p>📄 Nové dokumenty na schválenie: (1) <button>Zobraziť</button></p>
            <p>💬 Nové správy vyžadujúce odpoveď: (1) <button>Odpovedať</button></p>
          </div>
        </div>

        <div className="widget">
          <h2 className="widget__title">📈 Exchange: Nové Ponuky (5)</h2>
          <div className="widget__content">
             <p>Preprava paliet: Bratislava → Mníchov <button onClick={() => setActiveTab('exchange')}>Detail</button></p>
             <p>Preprava ocele: Košice → Katowice <button onClick={() => setActiveTab('exchange')}>Detail</button></p>
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

export default DashboardComponent;