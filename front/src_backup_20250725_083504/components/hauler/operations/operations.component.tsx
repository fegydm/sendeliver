// File: src/components/hauler/operations/operations.component.tsx
// Účel: Hlavný kontajner pre kartu "Zdroje", ktorý prepína pod-karty (Vozidlá, Tím, Lokality).

import React, { useState } from 'react';
import FleetComponent from './fleet/fleet.component';
// import TeamComponent from './team/team.component';       // Budúci komponent
// import SitesComponent from './sites/sites.component';     // Budúci komponent
import './operations.component.css';

type SubTab = 'fleet' | 'team' | 'sites';

const OperationsComponent: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('fleet');

  const renderContent = () => {
    switch (activeSubTab) {
      case 'fleet':
        return <FleetComponent />;
      case 'team':
        return <div className="placeholder-content">Správa tímu (v príprave)</div>;
      case 'sites':
        return <div className="placeholder-content">Správa lokalít (v príprave)</div>;
      default:
        return null;
    }
  };

  return (
    <div className="operations">
      <div className="operations__nav">
        <button 
          className={`operations__nav-item ${activeSubTab === 'fleet' ? 'operations__nav-item--active' : ''}`}
          onClick={() => setActiveSubTab('fleet')}
        >
          Vozidlá
        </button>
        <button 
          className={`operations__nav-item ${activeSubTab === 'team' ? 'operations__nav-item--active' : ''}`}
          onClick={() => setActiveSubTab('team')}
        >
          Tím
        </button>
        <button 
          className={`operations__nav-item ${activeSubTab === 'sites' ? 'operations__nav-item--active' : ''}`}
          onClick={() => setActiveSubTab('sites')}
        >
          Lokality
        </button>
      </div>
      <div className="operations__content">
        {renderContent()}
      </div>
    </div>
  );
};

export default OperationsComponent;