// File: front/src/components/hauler/content/VehicleDetailModal.tsx
// Last change: Fixed TS2339 by replacing speed with activity in status formatting

import React from 'react';
import { Vehicle, parseStatus, getDirectionColor, getDelayColor, statusColors, delayColors } from '@/data/mockFleet';
import { mockPeople } from '@/data/mockPeople';
import './vehicle-detail-modal.css';

interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  country?: string;
  city?: string;
  type?: string;
}

interface VehicleDetailModalProps {
  vehicle: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
  locations: Location[];
}

// Calculate distance between two points
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

const VehicleDetailModal: React.FC<VehicleDetailModalProps> = ({
  vehicle,
  isOpen,
  onClose,
  locations
}) => {
  if (!isOpen || !vehicle) return null;
  
  // Parse status for color and display
  const parsed = parseStatus(vehicle.dashboardStatus);
  const directionColor = getDirectionColor(vehicle.dashboardStatus);
  const delayColor = getDelayColor(vehicle.dashboardStatus);
  
  // Format dashboard status for display
  const formatDashboardStatus = (status: string): string => {
    if (parsed.category === "dynamic") {
      const direction = parsed.direction === "outbound" ? "Odchod" : 
                       parsed.direction === "inbound" ? "Príchod" : "Tranzit";
      const activity = parsed.activity === "moving" ? "V pohybe" : 
                      parsed.activity === "waiting" ? "Čaká" : "Prestávka";
      const delay = parsed.delay === "ontime" ? "Včas" : 
                   parsed.delay === "delayed" ? "Meškanie" : "Kritické";
      return `${direction} - ${activity} (${delay})`;
    } else {
      const type = parsed.type === "standby" ? "Pohotovosť" : 
                  parsed.type === "depot" ? "Depo" : "Servis";
      const delay = parsed.delay === "ontime" ? "Včas" : "Meškanie";
      return `${type} (${delay})`;
    }
  };
  
  // Get location data
  const currentLocation = vehicle.currentLocation 
    ? locations.find(loc => loc.id === vehicle.currentLocation) 
    : null;
    
  const startLocation = vehicle.start 
    ? locations.find(loc => loc.id === vehicle.start) 
    : null;
    
  const destinationLocation = vehicle.destination 
    ? locations.find(loc => loc.id === vehicle.destination) 
    : null;
  
  // Calculate ETA if we have necessary data
  let eta: string = 'N/A';
  let remainingDistance: string = 'N/A';
  if (currentLocation && destinationLocation && vehicle.speed && vehicle.speed > 0) {
    const distance = calculateDistance(
      currentLocation.latitude, 
      currentLocation.longitude, 
      destinationLocation.latitude, 
      destinationLocation.longitude
    );
    
    const timeInHours = distance / vehicle.speed;
    const now = new Date();
    const etaTime = new Date(now.getTime() + timeInHours * 60 * 60 * 1000);
    
    eta = etaTime.toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' });
    remainingDistance = `${distance.toFixed(1)} km`;
  }
  
  // Get driver name
  const driverName = vehicle.assignedDriver 
    ? mockPeople.find(p => p.id === vehicle.assignedDriver)?.firstName + ' ' + 
      mockPeople.find(p => p.id === vehicle.assignedDriver)?.lastName
    : 'Nepriradený';
  
  return (
    <div className="vehicle-modal-overlay" onClick={onClose}>
      <div className="vehicle-modal-content" onClick={e => e.stopPropagation()}>
        <div className="vehicle-modal-header" style={{ backgroundColor: delayColor }}>
          <h2>{vehicle.name}</h2>
          <span className="vehicle-status">{formatDashboardStatus(vehicle.dashboardStatus)}</span>
          <button className="vehicle-modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="vehicle-modal-body">
          <div className="vehicle-info-section">
            <div className="vehicle-info-row">
              <span className="info-label">ŠPZ:</span>
              <span className="info-value">{vehicle.plateNumber}</span>
              
              <span className="info-label">Vodič:</span>
              <span className="info-value">{driverName}</span>
            </div>
            
            <div className="vehicle-info-row">
              <span className="info-label">Typ:</span>
              <span className="info-value">{vehicle.type}</span>
              
              <span className="info-label">Rýchlosť:</span>
              <span className="info-value">{vehicle.speed ? `${vehicle.speed} km/h` : 'Stojí'}</span>
            </div>

            <div className="vehicle-info-row">
              <span className="info-label">Kapacita:</span>
              <span className="info-value">{vehicle.capacity}</span>
              
              <span className="info-label">Voľná kapacita:</span>
              <span className="info-value">{vehicle.capacityFree}</span>
            </div>

            <div className="vehicle-info-row">
              <span className="info-label">Tachometer:</span>
              <span className="info-value">{vehicle.odometerKm.toLocaleString()} km</span>
              
              <span className="info-label">Dostupnosť:</span>
              <span className="info-value" style={{ color: vehicle.availability === 'available' ? '#4CAF50' : '#FF9800' }}>
                {vehicle.availability === 'available' ? 'Dostupné' : 
                 vehicle.availability === 'busy' ? 'Obsadené' : 'Servis'}
              </span>
            </div>
          </div>
          
          <div className="vehicle-route-section">
            {startLocation && (
              <div className="route-point">
                <div className="route-marker start" style={{ backgroundColor: directionColor }}></div>
                <div className="route-details">
                  <div className="route-label">Štart</div>
                  <div className="route-location">{startLocation.name}</div>
                </div>
              </div>
            )}
            
            {currentLocation && (
              <div className="route-point current">
                <div className="route-marker current" style={{ backgroundColor: directionColor }}></div>
                <div className="route-details">
                  <div className="route-label">Aktuálna poloha</div>
                  <div className="route-location">{currentLocation.name}</div>
                </div>
              </div>
            )}
            
            {destinationLocation && (
              <div className="route-point">
                <div className="route-marker destination" style={{ backgroundColor: directionColor }}></div>
                <div className="route-details">
                  <div className="route-label">Cieľ</div>
                  <div className="route-location">{destinationLocation.name}</div>
                </div>
              </div>
            )}
            
            {currentLocation && destinationLocation && (
              <div className="route-summary">
                <div className="summary-item">
                  <span className="summary-label">ETA:</span>
                  <span className="summary-value">{eta}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Zostáva:</span>
                  <span className="summary-value">{remainingDistance}</span>
                </div>
              </div>
            )}
          </div>

          {vehicle.notes && (
            <div className="vehicle-notes-section">
              <div className="section-title">Poznámky:</div>
              <div className="notes-content">{vehicle.notes}</div>
            </div>
          )}
        </div>
        
        <div className="vehicle-modal-footer">
          <button className="modal-button secondary" onClick={onClose}>Zavrieť</button>
          <button className="modal-button primary">Detaily</button>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailModal;