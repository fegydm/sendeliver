// File: src/apps/hauler/operations/operations.tsx
// Last change: Fixed imports to match correct file structure and naming convention

import React, { useState } from 'react';
import { FleetOperations } from './fleet/fleet';
import  TeamOperations  from './team/team';
import  SitesOperations  from './sites/sites';

type OperationsSubTab = 'fleet' | 'team' | 'locations';

const OperationsComponent: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<OperationsSubTab>('fleet');

  const renderContent = () => {
    switch (activeSubTab) {
      case 'fleet':
        return <FleetOperations />;
      case 'team':
        return <TeamOperations />;
      case 'locations':
        return <SitesOperations />;
      default:
        return null;
    }
  };

  return (
    <div className="operations">
      <nav className="operations__nav">
        <button 
          className={`operations__nav-item ${activeSubTab === 'fleet' ? 'operations__nav-item--active' : ''}`}
          onClick={() => setActiveSubTab('fleet')}
          type="button"
        >
          🚛 Vozidlá
        </button>
        <button 
          className={`operations__nav-item ${activeSubTab === 'team' ? 'operations__nav-item--active' : ''}`}
          onClick={() => setActiveSubTab('team')}
          type="button"
        >
          👥 Tím
        </button>
        <button 
          className={`operations__nav-item ${activeSubTab === 'locations' ? 'operations__nav-item--active' : ''}`}
          onClick={() => setActiveSubTab('locations')}
          type="button"
        >
          📍 Lokality
        </button>
      </nav>
      
      <main className="operations__content">
        {renderContent()}
      </main>
    </div>
  );
};

export { OperationsComponent };
export default OperationsComponent;