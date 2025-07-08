// File: src/components/hauler/maps/ControlPanel.tsx
import React from 'react';
import { Vehicle } from '@/data/mockFleet';
import './ControlPanel.css'; // Nový CSS súbor

interface ControlPanelProps {
  vehicle: Vehicle; // Panel vždy dostane vybrané vozidlo
  onClose: () => void; // Funkcia na zatvorenie panela
}

const ControlPanel: React.FC<ControlPanelProps> = ({ vehicle, onClose }) => {
  return (
    <div className="control-panel">
      <div className="control-panel__header">
        <h3 className="control-panel__title">{vehicle.name} - {vehicle.plateNumber}</h3>
        <button className="control-panel__close-btn" onClick={onClose}>✖</button>
      </div>
      <div className="control-panel__content">
        <div className="control-panel__item">
          <span className="control-panel__label">Status:</span>
          <span className="control-panel__value">{vehicle.dashboardStatus}</span>
        </div>
        <div className="control-panel__item">
          <span className="control-panel__label">Rýchlosť:</span>
          <span className="control-panel__value">{vehicle.speed} km/h</span>
        </div>
        <div className="control-panel__item">
          <span className="control-panel__label">Vodič:</span>
          <span className="control-panel__value">{vehicle.assignedDriver || 'Nepriradený'}</span>
        </div>
        {/* TODO: Pridať ďalšie detaily a akčné tlačidlá (Zdieľať, Kontaktovať...) */}
      </div>
    </div>
  );
};

export default ControlPanel;