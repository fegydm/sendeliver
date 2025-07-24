// File: front/src/components/hauler/content/VehicleDetailModal.tsx
// Last change: Fixed layout with small header, basic info, elevation, SCD, then 3 columns NCS

import React, { useState } from 'react';
import { Vehicle } from '@/data/mockFleet';
import { mockPeople } from '@/data/mockPeople';
import { parseStatus, getDirectionColor, getDelayColor } from './map-utils';
import WebRTCTestIntegration from '../../hauler/content/WebRTCTestIntegration';
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

// Mock elevation data for route profile
const mockElevationData = [
  { distance: 0, elevation: 200, time: "08:00", event: "start" },
  { distance: 50, elevation: 150, time: "09:15", event: null },
  { distance: 120, elevation: 300, time: "10:45", event: "break" },
  { distance: 180, elevation: 250, time: "12:30", event: "fuel" },
  { distance: 220, elevation: 180, time: "13:45", event: "current" },
  { distance: 280, elevation: 120, time: "15:00", event: null },
  { distance: 350, elevation: 80, time: "16:30", event: "destination" },
];

// Mock cargo data
const mockCargoData = {
  weight: "12.5t",
  type: "Electronics",
  temperature: null,
  hazardous: false,
};

const VehicleDetailModal: React.FC<VehicleDetailModalProps> = ({
  vehicle,
  isOpen,
  onClose,
  locations
}) => {
  const [activeCommTab, setActiveCommTab] = useState<'chat' | 'yesno' | 'voice' | 'video'>('chat');
  const [chatMessage, setChatMessage] = useState('');
  const [streamEnabled, setStreamEnabled] = useState(true);
  const [isWebRTCTestOpen, setIsWebRTCTestOpen] = useState(false);

  if (!isOpen || !vehicle) return null;
  
  // Parse status for colors and display
  const parsed = parseStatus(vehicle.dashboardStatus);
  const directionColor = getDirectionColor(vehicle.dashboardStatus);
  const delayColor = getDelayColor(vehicle.dashboardStatus);
  
  // Get locations
  const currentLocation = vehicle.currentLocation 
    ? locations.find(loc => loc.id === vehicle.currentLocation) 
    : null;
  const startLocation = vehicle.start 
    ? locations.find(loc => loc.id === vehicle.start) 
    : null;
  const destinationLocation = vehicle.destination 
    ? locations.find(loc => loc.id === vehicle.destination) 
    : null;
  
  // Get driver info
  const driver = vehicle.assignedDriver 
    ? mockPeople.find(p => p.id === vehicle.assignedDriver)
    : null;
  
  // Mock times and delays
  const departureTime = "08:00";
  const currentTime = "13:45";
  const plannedArrival = "16:00";
  const estimatedArrival = "16:15";
  const delay = 15; // minutes

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

  const getCountryFlag = (location: Location | null) => {
    if (!location) return '';
    const countryCode = location.country?.toLowerCase() || 'sk';
    return `/flags/4x3/optimized/${countryCode}.svg`;
  };

  const renderElevationProfile = () => {
    const maxElevation = Math.max(...mockElevationData.map(d => d.elevation));
    const minElevation = Math.min(...mockElevationData.map(d => d.elevation));
    const elevationRange = maxElevation - minElevation;
    const totalDistance = Math.max(...mockElevationData.map(d => d.distance));
    const currentDistance = mockElevationData.find(d => d.event === 'current')?.distance || 220;
    const progressPercent = (currentDistance / totalDistance) * 100;
    
    // Hybrid approach: Use relative if range is small, absolute if large
    const useRelative = elevationRange < 100;
    const baseElevation = useRelative ? minElevation : 0;
    const maxDisplayElevation = useRelative ? maxElevation : maxElevation;
    
    // Generate 50 equal-width columns with smaller margins
    const columnCount = 50;
    const chartWidth = 480; // Increased from 390 for wider chart
    const startX = 2; // Reduced from 5 for maximum width
    const columnWidth = chartWidth / columnCount; // Available width divided by columns
    
    return (
      <div className="elevation-profile">
        <div className="elevation-header">
          <h3>Profil trasy</h3>
          <div className="elevation-stats">
            <span>{minElevation}-{maxElevation}m n.m.</span>
            <span>Vzdialenosť: {totalDistance}km</span>
            <span>Progress: {Math.round(progressPercent)}%</span>
          </div>
        </div>
        <div className="elevation-chart">
          <svg width="100%" height="100" viewBox="0 0 485 100">
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#e0e0e0" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="80%" fill="url(#grid)" />
            
            {/* 50 equal-width elevation columns */}
            {Array.from({ length: columnCount }, (_, i) => {
              const x = startX + i * columnWidth;
              const distanceAtColumn = (i / (columnCount - 1)) * totalDistance;
              
              // Find closest elevation data point or interpolate
              let elevation = minElevation; // default
              for (let j = 0; j < mockElevationData.length - 1; j++) {
                const curr = mockElevationData[j];
                const next = mockElevationData[j + 1];
                if (distanceAtColumn >= curr.distance && distanceAtColumn <= next.distance) {
                  const ratio = (distanceAtColumn - curr.distance) / (next.distance - curr.distance);
                  elevation = curr.elevation + (next.elevation - curr.elevation) * ratio;
                  break;
                }
              }
              
              // Bar height based on elevation (hybrid approach)
              const normalizedElevation = elevation - baseElevation;
              const displayRange = maxDisplayElevation - baseElevation;
              const barHeight = Math.max(2, (normalizedElevation / displayRange) * 60);
              
              // Check if this column has special events
              let columnColor = '#D4B863'; // Yellow-gray default color
              
              // Check for events at this distance
              const eventAtDistance = mockElevationData.find(d => 
                d.event && Math.abs(d.distance - distanceAtColumn) < totalDistance / columnCount
              );
              
              if (eventAtDistance) {
                switch (eventAtDistance.event) {
                  case 'fuel':
                    columnColor = '#FF9800'; // Orange for fuel
                    break;
                  case 'break':
                    columnColor = '#795548'; // Brown for break
                    break;
                  case 'current':
                    columnColor = '#4CAF50'; // Green for current position
                    break;
                  default:
                    columnColor = '#D4B863';
                }
              }
              
              return (
                <rect
                  key={i}
                  x={x}
                  y={75 - barHeight}
                  width={columnWidth - 0.5}
                  height={barHeight}
                  fill={columnColor}
                  opacity={0.9}
                />
              );
            })}
            
            {/* Progress bar at bottom */}
            <rect
              x={startX}
              y="85"
              width={chartWidth}
              height="8"
              fill="#E0E0E0"
              rx="4"
            />
            <rect
              x={startX}
              y="85"
              width={(progressPercent / 100) * chartWidth}
              height="8"
              fill="#4CAF50"
              rx="4"
            />
            
            {/* Event markers above columns */}
            {mockElevationData.map((d, i) => {
              if (!d.event) return null;
              const x = startX + (d.distance / totalDistance) * chartWidth;
              
              let icon = '';
              switch (d.event) {
                case 'start':
                  icon = '🏁';
                  break;
                case 'fuel':
                  icon = '⛽';
                  break;
                case 'break':
                  icon = '☕';
                  break;
                case 'current':
                  icon = '📍';
                  break;
                case 'destination':
                  icon = '🏁';
                  break;
              }
              
              return (
                <g key={i}>
                  <text x={x} y="12" textAnchor="middle" fontSize="14">{icon}</text>
                  <text x={x} y="25" textAnchor="middle" fontSize="9" fill="#666">{d.time}</text>
                </g>
              );
            })}
            
            {/* Progress percentage text */}
            <text x="242" y="98" textAnchor="middle" fontSize="10" fill="#333">
              {Math.round(progressPercent)}% Complete
            </text>
            
            {/* Elevation range indicator */}
            <text x="2" y="98" textAnchor="start" fontSize="9" fill="#666">
              {useRelative ? 'Relatívny' : 'Absolútny'} profil
            </text>
          </svg>
        </div>
      </div>
    );
  };

  const renderCommunicationTab = () => {
    switch (activeCommTab) {
      case 'chat':
        return (
          <div className="comm-chat">
            <div className="chat-messages">
              <div className="chat-message received">
                <span className="message-time">13:30</span>
                <span className="message-text">Práve som naložil tovar v Brne</span>
              </div>
              <div className="chat-message sent">
                <span className="message-time">13:32</span>
                <span className="message-text">Výborne, pokračuj podľa plánu</span>
              </div>
            </div>
            <div className="chat-input">
              <input 
                type="text" 
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Napíš správu..."
              />
              <button>Odoslať</button>
            </div>
          </div>
        );
      
      case 'yesno':
        return (
          <div className="comm-yesno">
            <div className="yesno-question">
              <h4>Rýchla otázka</h4>
              <input type="text" placeholder="Napíš áno/nie otázku..." />
              <button>Odoslať otázku</button>
            </div>
            <div className="yesno-history">
              <div className="yesno-item">
                <span className="question">Môžeš pokračovať v jazde?</span>
                <span className="answer yes">ÁNO</span>
                <span className="time">13:25</span>
              </div>
            </div>
          </div>
        );
      
      case 'voice':
        return (
          <div className="comm-voice">
            <div className="voice-controls">
              <button className="voice-call-btn">📞 Zavolať vodičovi</button>
              <div className="voice-status">Pripojenie: Dostupné</div>
            </div>
          </div>
        );
      
      case 'video':
        return (
          <div className="comm-video">
            <div className="video-controls">
              <button className="video-call-btn">📹 Video hovor</button>
              <div className="stream-controls">
                <label>
                  <input 
                    type="checkbox" 
                    checked={streamEnabled}
                    onChange={(e) => setStreamEnabled(e.target.checked)}
                  />
                  Stream z kabíny
                </label>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <div className="vehicle-modal-overlay" onClick={onClose}>
        <div className="vehicle-modal-content" onClick={e => e.stopPropagation()}>
          {/* Small Header */}
          <div className="vehicle-modal-header" style={{ borderTopColor: delayColor }}>
            <div className="header-left">
              <h2>{vehicle.name}</h2>
              <span className="vehicle-status">{formatDashboardStatus(vehicle.dashboardStatus)}</span>
            </div>
            <div className="header-right">
              <button 
                className="webrtc-test-button"
                onClick={() => setIsWebRTCTestOpen(true)}
                title="Test WebRTC Communication"
              >
                🧪 Test WebRTC
              </button>
              <button className="vehicle-modal-close" onClick={onClose}>×</button>
            </div>
          </div>
          
          <div className="vehicle-modal-body">
            {/* Basic Info Section - 3 columns: Vehicle | Cargo | Driver */}
            <div className="basic-info-section">
              <div className="vehicle-info">
                <h4>Vozidlo</h4>
                <div className="info-item">
                  <span className="info-label">ŠPZ:</span>
                  <span className="info-value">{vehicle.plateNumber}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Typ:</span>
                  <span className="info-value">{vehicle.type}</span>
                </div>
              </div>
              
              <div className="cargo-info">
                <h4>Náklad</h4>
                <div className="info-item">
                  <span className="info-label">Hmotnosť:</span>
                  <span className="info-value">{mockCargoData.weight}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Typ:</span>
                  <span className="info-value">{mockCargoData.type}</span>
                </div>
              </div>

              <div className="driver-info">
                <h4>Vodič</h4>
                <div className="info-item">
                  <span className="info-label">Meno:</span>
                  <span className="info-value">
                    {driver ? `${driver.firstName} ${driver.lastName}` : 'Nepriradený'}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Status:</span>
                  <span className="info-value">Aktívny</span>
                </div>
              </div>
            </div>

            {/* Elevation Profile */}
            {renderElevationProfile()}

            {/* Route Status Section - SCD */}
            <div className="route-status-section">
              {startLocation && (
                <div className="route-point start">
                  <div className="route-marker" style={{ backgroundColor: directionColor }}>🏁</div>
                  <div className="route-info">
                    <div className="route-location">{startLocation.name}</div>
                    <div className="route-details">
                      <img src={getCountryFlag(startLocation)} alt="" className="country-flag" />
                      <span className="departure-time">Odchod: {departureTime}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {currentLocation && (
                <div className="route-point current">
                  <div className="route-marker current" style={{ backgroundColor: '#4CAF50' }}>📍</div>
                  <div className="route-info">
                    <div className="route-location">{currentLocation.name}</div>
                    <div className="route-details">
                      <img src={getCountryFlag(currentLocation)} alt="" className="country-flag" />
                      <span className="current-time">Aktuálne: {currentTime}</span>
                      <span className="current-speed">{vehicle.speed || 0} km/h</span>
                    </div>
                  </div>
                </div>
              )}
              
              {destinationLocation && (
                <div className="route-point destination">
                  <div className="route-marker" style={{ backgroundColor: directionColor }}>🏁</div>
                  <div className="route-info">
                    <div className="route-location">{destinationLocation.name}</div>
                    <div className="route-details">
                      <img src={getCountryFlag(destinationLocation)} alt="" className="country-flag" />
                      <span className="planned-arrival">Plán: {plannedArrival}</span>
                      <span className="estimated-arrival">ETA: {estimatedArrival}</span>
                      {delay > 0 && (
                        <span className="delay-info" style={{ color: delayColor }}>
                          Delay: {delay} min
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Three-column NCS Section: Navigation | Communication | Stream */}
            <div className="ncs-section">
              {/* Navigation Map */}
              <div className="navigation-section">
                <h3>Navigácia</h3>
                <div className="map-placeholder">
                  <div className="map-mock">🗺️ Mapa s aktuálnou pozíciou</div>
                </div>
              </div>

              {/* Communication Section */}
              <div className="communication-section">
                <div className="comm-tabs">
                  <button 
                    className={`comm-tab ${activeCommTab === 'chat' ? 'active' : ''}`}
                    onClick={() => setActiveCommTab('chat')}
                  >
                    💬
                  </button>
                  <button 
                    className={`comm-tab ${activeCommTab === 'yesno' ? 'active' : ''}`}
                    onClick={() => setActiveCommTab('yesno')}
                  >
                    ✅
                  </button>
                  <button 
                    className={`comm-tab ${activeCommTab === 'voice' ? 'active' : ''}`}
                    onClick={() => setActiveCommTab('voice')}
                  >
                    📞
                  </button>
                  <button 
                    className={`comm-tab ${activeCommTab === 'video' ? 'active' : ''}`}
                    onClick={() => setActiveCommTab('video')}
                  >
                    📹
                  </button>
                </div>
                
                <div className="comm-content">
                  {renderCommunicationTab()}
                </div>
              </div>

              {/* Cabin Stream */}
              <div className="stream-section">
                <h3>Stream z kabíny</h3>
                <div className="stream-placeholder">
                  {streamEnabled ? (
                    <div className="stream-mock">📹 Live stream</div>
                  ) : (
                    <div className="stream-disabled">Stream vypnutý</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WebRTC Test Modal - separate modal */}
      {isWebRTCTestOpen && (
        <WebRTCTestIntegration
          vehicleId={vehicle.id}
          isOpen={isWebRTCTestOpen}
          onClose={() => setIsWebRTCTestOpen(false)}
        />
      )}
    </>
  );
};

export default VehicleDetailModal;