// File: src/components/hauler/maps/ControlPanel.tsx
import React from 'react';
import { Vehicle } from '@/data/mockFleet';
import './ControlPanel.css';

interface ControlPanelProps {
  vehicle: Vehicle;
  onClose: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ vehicle, onClose }) => {
  return (
    <div className="control-panel">
      <div className="control-panel__header">
        <h3 className="control-panel__title">{vehicle.name}</h3>
        <span className="control-panel__plate">{vehicle.plateNumber}</span>
        <button className="control-panel__close" onClick={onClose} title="Zatvoriť">✖</button>
      </div>
      <div className="control-panel__content">
        <div className="control-panel__group">
          <div className="info-item">
            <span className="info-item__label">Stav</span>
            <span className="info-item__value">{vehicle.dashboardStatus}</span>
          </div>
          <div className="info-item">
            <span className="info-item__label">Rýchlosť</span>
            <span className="info-item__value">{vehicle.speed} km/h</span>
          </div>
        </div>
        <div className="control-panel__group">
          <div className="info-item">
            <span className="info-item__label">Vodič</span>
            <span className="info-item__value">{vehicle.assignedDriver || 'Nepriradený'}</span>
          </div>
          <div className="info-item">
            <span className="info-item__label">Destinácia</span>
            <span className="info-item__value">{vehicle.destination || 'Nezadaná'}</span>
          </div>
        </div>
      </div>
      <div className="control-panel__actions">
        <button className="button">Zobraziť Detail</button>
        <button className="button">Poslať Správu</button>
        <button className="button button--primary">🔗 Zdieľať Sledovanie</button>
      </div>
    </div>
  );
};

export default ControlPanel;