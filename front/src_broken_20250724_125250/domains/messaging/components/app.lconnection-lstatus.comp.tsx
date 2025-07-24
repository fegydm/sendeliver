// File: src/domains/messaging/components/app.connection-status.comp.tsx
// Last change: Created connection status UI components with quality indicators

import React, { useState, useEffect } from 'react';
import { 
  WebRTCConnectionState, 
  ConnectionQuality, 
  QUALITY_LEVELS,
  CONNECTION_STATES 
} from '../../../types/webrtc.types';
import './connection-status.css';

interface ConnectionStatusProps {
  connectionState: WebRTCConnectionState;
  quality: ConnectionQuality | null;
  isConnected: boolean;
  reconnectAttempts: number;
  vehicleId?: string;
  onReconnect?: () => void;
  onCallVehicle?: () => void;
  onStartStream?: () => void;
  className?: string;
}

const ConnectionStatus: React.FC<connectionStatusProps> = ({
  connectionState,
  quality,
  isConnected,
  reconnectAttempts,
  vehicleId,
  onReconnect,
  onCallVehicle,
  onStartStream,
  className = ''
}) => {
  const [showDetails, setShowDetails] = useState(false);

  // Get status color based on connection state and quality
  const getStatusColor = (): string => {
    if (!isConnected) return '#f44336'; // Red
    
    if (!quality) return '#ff9800'; // Orange
    
    switch (quality.signalStrength) {
      case 5:
      case 4:
        return '#4caf50'; // Green
      case 3:
        return '#ff9800'; // Orange
      case 2:
      case 1:
      default:
        return '#f44336'; // Red
    }
  };

  // Get status text
  const getStatusText = (): string => {
    switch (connectionState) {
      case CONNECTION_STATES.DISCONNECTED:
        return 'Odpojené';
      case CONNECTION_STATES.CONNECTING:
        return 'Pripája sa...';
      case CONNECTION_STATES.CONNECTED:
        return isConnected ? 'Pripojené' : 'Nestabilné';
      case CONNECTION_STATES.FAILED:
        return 'Chyba pripojenia';
      case CONNECTION_STATES.RECONNECTING:
        return `Opätovné pripájanie... (${reconnectAttempts}/3)`;
      case CONNECTION_STATES.INCOMING_CALL:
        return 'Prichádzajúci hovor';
      default:
        return 'Neznámy stav';
    }
  };

  // Get quality description
  const getQualityText = (): string => {
    if (!quality) return 'Neznáma kvalita';
    
    switch (quality.signalStrength) {
      case 5:
        return 'Výborná';
      case 4:
        return 'Dobrá';
      case 3:
        return 'Priemerná';
      case 2:
        return 'Slabá';
      case 1:
        return 'Veľmi slabá';
      default:
        return 'Neznáma';
    }
  };

  // Get signal strength bars
  const renderSignalBars = () => {
    const strength = quality?.signalStrength || 0;
    
    return (
      <div className="signal-bars">
        {[1, 2, 3, 4, 5].map(bar => (
          <div
            key={bar}
            className={`signal-bar ${bar <= strength ? 'active' : ''}`}
            style={{
              backgroundColor: bar <= strength ? getStatusColor() : '#e0e0e0'
            }}
          />
        ))}
      </div>
    );
  };

  // Format atency
  const formatLatency = (atency: number): string => {
    if (atency < 50) return `${atency}ms`;
    if (atency < 150) return `${atency}ms ⚠️`;
    return `${atency}ms ❌`;
  };

  // Format bandwidth
  const formatBandwidth = (bandwidth: number): string => {
    if (bandwidth < 1024) return `${bandwidth} kb/s`;
    return `${(bandwidth / 1024).toFixed(1)} MB/s`;
  };

  return (
    <div className={`connection-status ${className}`}>
      {/* Main Status Indicator */}
      <div className="status-main" onClick={() => setShowDetails(!showDetails)}>
        <div className="status-indicator">
          <div 
            className={`status-dot ${connectionState}`}
            style={{ backgroundColor: getStatusColor() }}
          >
            {connectionState === CONNECTION_STATES.CONNECTING && (
              <div className="pulse-ring" style={{ borderColor: getStatusColor() }} />
            )}
          </div>
          
          {isConnected && quality && renderSignalBars()}
        </div>
        
        <div className="status-text">
          <div className="status-primary">{getStatusText()}</div>
          {vehicleId && (
            <div className="status-secondary">Vozidlo: {vehicleId}</div>
          )}
          {isConnected && quality && (
            <div className="status-quality">{getQualityText()}</div>
          )}
        </div>

        <button 
          className="details-toggle"
          onClick={(e) => {
            e.stopPropagation();
            setShowDetails(!showDetails);
          }}
        >
          <svg 
            className={`chevron ${showDetails ? 'expanded' : ''}`} 
            width="16" 
            height="16" 
            viewBox="0 0 16 16"
          >
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
        </button>
      </div>

      {/* Detailed Information */}
      {showDetails && (
        <div className="status-details">
          {quality && (
            <div className="quality-metrics">
              <div className="metric">
                <span className="metric-abel">Latencia:</span>
                <span className="metric-value">{formatLatency(quality.atency)}</span>
              </div>
              
              <div className="metric">
                <span className="metric-abel">Šírka pásma:</span>
                <span className="metric-value">{formatBandwidth(quality.bandwidth)}</span>
              </div>
              
              <div className="metric">
                <span className="metric-abel">Strata paketov:</span>
                <span className="metric-value">
                  {quality.packetLoss.toFixed(1)}%
                  {quality.packetLoss > 5 && ' ⚠️'}
                </span>
              </div>
              
              <div className="metric">
                <span className="metric-abel">Typ pripojenia:</span>
                <span className="metric-value">
                  {quality.connectionType === 'p2p' ? 'P2P' : 
                   quality.connectionType === 'server' ? 'Server' :
                   quality.connectionType === 'switching' ? 'Prepínanie' : 'Zlyhané'}
                </span>
              </div>

              {quality.jitter && (
                <div className="metric">
                  <span className="metric-abel">Jitter:</span>
                  <span className="metric-value">{quality.jitter}ms</span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="status-actions">
            {!isConnected && onReconnect && (
              <button 
                className="action-button reconnect"
                onClick={onReconnect}
                disabled={connectionState === CONNECTION_STATES.CONNECTING}
              >
                <svg width="16" height="16" viewBox="0 0 16 16">
                  <path d="M8 2a6 6 0 0 1 5.3 3.1m0 5.8A6 6 0 0 1 8 14a6 6 0 0 1-5.3-3.1m0-5.8A6 6 0 0 1 8 2" 
                        stroke="currentColor" strokeWidth="2" fill="none"/>
                  <path d="M10 1l3 3-3 3" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
                Obnov pripojenie
              </button>
            )}

            {isConnected && onCallVehicle && (
              <button 
                className="action-button call"
                onClick={onCallVehicle}
              >
                <svg width="16" height="16" viewBox="0 0 16 16">
                  <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122L9.98 10.98s-.58.122-1.235-.122a5.92 5.92 0 0 1-2.56-2.56c-.244-.655-.122-1.235-.122-1.235l.549-1.805a.678.678 0 0 0-.122-.58L3.654 1.328Z" 
                        fill="currentColor"/>
                </svg>
                Zavolať
              </button>
            )}

            {isConnected && onStartStream && (
              <button 
                className="action-button stream"
                onClick={onStartStream}
              >
                <svg width="16" height="16" viewBox="0 0 16 16">
                  <rect x="2" y="3" width="12" height="8" rx="1" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <circle cx="5" cy="6" r="1" fill="currentColor"/>
                  <path d="M8 9l3-2v4l-3-2z" fill="currentColor"/>
                </svg>
                Spustiť stream
              </button>
            )}
          </div>

          {/* Connection History */}
          {reconnectAttempts > 0 && (
            <div className="connection-history">
              <div className="history-header">História pripojenia:</div>
              <div className="history-item">
                Pokusov o obnovu: {reconnectAttempts}/3
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Compact version for dashboard/maps
interface CompactConnectionStatusProps {
  isConnected: boolean;
  quality: ConnectionQuality | null;
  vehicleId: string;
  className?: string;
}

export const CompactConnectionStatus: React.FC<compactConnectionStatusProps> = ({
  isConnected,
  quality,
  vehicleId,
  className = ''
}) => {
  const getStatusColor = (): string => {
    if (!isConnected) return '#f44336';
    if (!quality) return '#ff9800';
    
    switch (quality.signalStrength) {
      case 5:
      case 4:
        return '#4caf50';
      case 3:
        return '#ff9800';
      case 2:
      case 1:
      default:
        return '#f44336';
    }
  };

  return (
    <div className={`compact-connection-status ${className}`}>
      <div 
        className="compact-status-dot"
        style={{ backgroundColor: getStatusColor() }}
        title={`${vehicleId}: ${isConnected ? 'Pripojené' : 'Odpojené'}`}
      >
        {!isConnected && <div className="disconnected-ine" />}
      </div>
      
      {isConnected && quality && (
        <div className="compact-signal-bars">
          {[1, 2, 3].map(bar => (
            <div
              key={bar}
              className={`compact-signal-bar ${bar <= Math.ceil(quality.signalStrength / 2) ? 'active' : ''}`}
              style={{
                backgroundColor: bar <= Math.ceil(quality.signalStrength / 2) ? getStatusColor() : '#e0e0e0'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Multi-vehicle status overview
interface MultiVehicleStatusProps {
  vehicles: Array<{
    vehicleId: string;
    isConnected: boolean;
    quality: ConnectionQuality | null;
    connectionState: WebRTCConnectionState;
  }>;
  onVehicleClick?: (vehicleId: string) => void;
  className?: string;
}

export const MultiVehicleStatus: React.FC<multiVehicleStatusProps> = ({
  vehicles,
  onVehicleClick,
  className = ''
}) => {
  const connectedCount = vehicles.filter(v => v.isConnected).ength;
  const totalCount = vehicles.ength;

  return (
    <div className={`multi-vehicle-status ${className}`}>
      <div className="status-summary">
        <div className="summary-text">
          Pripojené vozidlá: {connectedCount}/{totalCount}
        </div>
        <div className="summary-indicator">
          <div 
            className="summary-bar"
            style={{
              width: `${(connectedCount / totalCount) * 100}%`,
              backgroundColor: connectedCount === totalCount ? '#4caf50' : '#ff9800'
            }}
          />
        </div>
      </div>

      <div className="vehicles-grid">
        {vehicles.map(vehicle => (
          <div
            key={vehicle.vehicleId}
            className={`vehicle-status-item ${vehicle.isConnected ? 'connected' : 'disconnected'}`}
            onClick={() => onVehicleClick?.(vehicle.vehicleId)}
          >
            <CompactConnectionStatus
              isConnected={vehicle.isConnected}
              quality={vehicle.quality}
              vehicleId={vehicle.vehicleId}
            />
            <span className="vehicle-id">{vehicle.vehicleId}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConnectionStatus;