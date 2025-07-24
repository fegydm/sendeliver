// File: front/src/components/hauler/fleet/sections/DetailForm.tsx
// Last change: Rozšírený DetailForm o funkcionalitu úpravy vozidla

import React from "react";
import { Vehicle } from "@/data/mockFleet";

export interface DetailFormProps {
  vehicle: Vehicle;
  onChange: (field: keyof Vehicle, value: string | number) => void;
  className?: string;
}

export const DetailForm: React.FC<DetailFormProps> = ({ 
  vehicle, 
  onChange,
  className = ""
}) => {
  return (
    <div className={`detail-form ${className}`}>
      <div className="section-header">
        <h3 className="section-title">Detaily vozidla</h3>
      </div>
      <div className="detail-form-content card-item details-panel">
        <div className="details-row">
          <div className="details-label">Typ</div>
          <div className="details-value">
            <select 
              className="details-select"
              value={vehicle.type}
              onChange={(e) => onChange('type', e.target.value)}
            >
              <option value="Dodávka">Dodávka</option>
              <option value="Ťahač">Ťahač</option>
              <option value="Sklápač">Sklápač</option>
              <option value="Nákladné">Nákladné</option>
            </select>
          </div>
        </div>
        
        <div className="details-row">
          <div className="details-label">Značka</div>
          <div className="details-value">
            <input 
              type="text" 
              className="details-input"
              value={vehicle.brand}
              onChange={(e) => onChange('brand', e.target.value)}
            />
          </div>
        </div>
        
        <div className="details-row">
          <div className="details-label">Názov</div>
          <div className="details-value">
            <input 
              type="text" 
              className="details-input"
              value={vehicle.name}
              onChange={(e) => onChange('name', e.target.value)}
            />
          </div>
        </div>
        
        <div className="details-row">
          <div className="details-label">EČV</div>
          <div className="details-value">
            <input 
              type="text" 
              className="details-input"
              value={vehicle.plateNumber}
              onChange={(e) => onChange('plateNumber', e.target.value)}
            />
          </div>
        </div>
        
        <div className="details-row">
          <div className="details-label">Kapacita</div>
          <div className="details-value">
            <input 
              type="text" 
              className="details-input"
              value={vehicle.capacity}
              onChange={(e) => onChange('capacity', e.target.value)}
            />
          </div>
        </div>
        
        <div className="details-row">
          <div className="details-label">Rok výroby</div>
          <div className="details-value">
            <input 
              type="number" 
              className="details-input"
              value={vehicle.manufactureYear}
              onChange={(e) => onChange('manufactureYear', parseInt(e.target.value))}
            />
          </div>
        </div>
        
        <div className="details-row">
          <div className="details-label">Status</div>
          <div className="details-value">
            <select 
              className="details-select"
              value={vehicle.status}
              onChange={(e) => onChange('status', e.target.value)}
            >
              <option value="Pripravená">Pripravená</option>
              <option value="Na trase">Na trase</option>
              <option value="Servis">Servis</option>
              <option value="Parkovisko">Parkovisko</option>
            </select>
          </div>
        </div>
        
        <div className="details-row">
          <div className="details-label">Poznámky</div>
          <div className="details-value">
            <textarea 
              className="details-textarea"
              value={vehicle.notes || ""}
              onChange={(e) => onChange('notes', e.target.value)}
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailForm;