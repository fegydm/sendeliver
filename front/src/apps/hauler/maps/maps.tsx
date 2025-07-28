// File: src/apps/hauler/maps/maps.tsx  
// Last change: Temporary mock implementation to fix build

import React from 'react';
// import { useAuth } from '@/contexts/AuthContext';  // Temporarily disabled due to AuthContext issues
import './maps.css';

const MapsComponent: React.FC = () => {
  // Temporary mock data until AuthContext is fixed
  const user = { name: 'Test User' };
  const isAuthenticated = true;

  // TODO: Replace with real map implementation
  const handleViewDetails = (vehicleId: string) => {
    alert(`TODO: Zobraziť detaily vozidla ${vehicleId}`);
  };

  if (!isAuthenticated) {
    return (
      <div className="maps">
        <div className="maps__error">
          Prístup k mape vyžaduje prihlásenie.
        </div>
      </div>
    );
  }

  return (
    <div className="maps">
      <header className="maps__header">
        <h1 className="maps__title">Mapa Flotily</h1>
        <div className="maps__user-info">
          Prihlásený: {user?.name || 'Neznámy používateľ'}
        </div>
      </header>

      <main className="maps__content">
        {/* TODO: Integrate real map component (Mapbox, Google Maps, etc.) */}
        <div className="maps__placeholder">
          <h2>Mapa bude tu</h2>
          <p>Integrácia s mapovým API v príprave...</p>
          
          {/* Mock vehicle markers */}
          <div className="maps__mock-vehicles">
            <h3>Simulované vozidlá na mape:</h3>
            <div className="maps__vehicle-list">
              <div className="maps__vehicle-marker">
                📍 TT-789EF - Bratislava centrum
                <button 
                  type="button"
                  onClick={() => handleViewDetails('TT-789EF')}
                  className="maps__vehicle-button"
                >
                  Detail
                </button>
              </div>
              <div className="maps__vehicle-marker">
                📍 KE-123AB - Košice východ  
                <button 
                  type="button"
                  onClick={() => handleViewDetails('KE-123AB')}
                  className="maps__vehicle-button"
                >
                  Detail
                </button>
              </div>
              <div className="maps__vehicle-marker">
                📍 ZA-456CD - Žilina sever
                <button 
                  type="button"
                  onClick={() => handleViewDetails('ZA-456CD')}
                  className="maps__vehicle-button"
                >
                  Detail
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <aside className="maps__controls">
        <h3 className="maps__controls-title">Ovládanie</h3>
        <div className="maps__control-group">
          <button type="button" className="maps__control-button">
            🔍 Zoom na flotilu
          </button>
          <button type="button" className="maps__control-button">
            🎯 Nájsť vozidlo
          </button>
          <button type="button" className="maps__control-button">
            📏 Merať vzdialenosť
          </button>
          <button type="button" className="maps__control-button">
            🛣️ Plánovanie trás
          </button>
        </div>
        
        <div className="maps__filters">
          <h4 className="maps__filters-title">Filtre</h4>
          <label className="maps__filter-item">
            <input type="checkbox" defaultChecked />
            Vozidlá v pohybe
          </label>
          <label className="maps__filter-item">
            <input type="checkbox" defaultChecked />
            Vozidlá na pauze
          </label>
          <label className="maps__filter-item">
            <input type="checkbox" />
            Vozidlá mimo prevádzky
          </label>
        </div>
      </aside>
    </div>
  );
};

export { MapsComponent };
export default MapsComponent;