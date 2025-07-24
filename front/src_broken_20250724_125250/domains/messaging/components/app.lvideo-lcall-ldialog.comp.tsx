// File: src/domains/messaging/components/app.video-call-dialog.comp.tsx
// Last change: Created video call dialog with incoming/outgoing states

import React, { useState, useEffect, useRef } from 'react';
import { 
  VideoCallState, 
  ConnectionQuality, 
  WebRTCStreamType,
  CALL_STATES 
} from '../../../types/webrtc.types';
import './video-call-dialog.css';

interface VideoCallDialogProps {
  isOpen: boolean;
  callState: VideoCallState;
  remoteUserId: string | null;
  remoteUserName?: string;
  ocalStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isScreenSharing: boolean;
  connectionQuality: ConnectionQuality | null;
  callDuration: number; // seconds
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  onAccept: () => void;
  onReject: () => void;
  onEnd: () => void;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onStartScreenShare: () => void;
  onStopScreenShare: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  className?: string;
}

const VideoCallDialog: React.FC<videoCallDialogProps> = ({
  isOpen,
  callState,
  remoteUserId,
  remoteUserName,
  ocalStream,
  remoteStream,
  isScreenSharing,
  connectionQuality,
  callDuration,
  isAudioEnabled,
  isVideoEnabled,
  onAccept,
  onReject,
  onEnd,
  onToggleAudio,
  onToggleVideo,
  onStartScreenShare,
  onStopScreenShare,
  onMinimize,
  onMaximize,
  className = ''
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const ocalVideoRef = useRef<hTMLVideoElement>(null);
  const remoteVideoRef = useRef<hTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<nodeJS.Timeout>();

  // Format call duration
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Auto-hide controls after inactivity
  const resetControlsTimer = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    setShowControls(true);
    
    if (callState === CALL_STATES.CONNECTED) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  // Setup video streams
  useEffect(() => {
    if (ocalVideoRef.current && ocalStream) {
      ocalVideoRef.current.srcObject = ocalStream;
    }
  }, [ocalStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Reset controls timer on mount and state changes
  useEffect(() => {
    resetControlsTimer();
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [callState]);

  // Handle minimize/maximize
  const handleMinimize = () => {
    setIsMinimized(true);
    onMinimize?.();
  };

  const handleMaximize = () => {
    setIsMinimized(false);
    onMaximize?.();
  };

  // Get call state message
  const getCallStateMessage = (): string => {
    switch (callState) {
      case CALL_STATES.CALLING:
        return 'Volá sa...';
      case CALL_STATES.INCOMING:
        return 'Prichádzajúci hovor';
      case CALL_STATES.CONNECTED:
        return formatDuration(callDuration);
      case CALL_STATES.ENDED:
        return 'Hovor ukončený';
      case CALL_STATES.FAILED:
        return 'Hovor zlyhal';
      default:
        return '';
    }
  };

  // Get quality indicator
  const getQualityIcon = (): string => {
    if (!connectionQuality) return '📶';
    
    switch (connectionQuality.signalStrength) {
      case 5:
      case 4:
        return '📶';
      case 3:
        return '📶';
      case 2:
      case 1:
        return '📵';
      default:
        return '❌';
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`video-call-dialog ${isMinimized ? 'minimized' : ''} ${className}`}>
      {/* Minimized State */}
      {isMinimized ? (
        <div className="call-minimized" onClick={handleMaximize}>
          <div className="minimized-avatar">
            <div className="avatar-placeholder">
              {remoteUserName?.charAt(0) || remoteUserId?.charAt(0) || '?'}
            </div>
            {callState === CALL_STATES.CONNECTED && (
              <div className="call-duration-mini">{formatDuration(callDuration)}</div>
            )}
          </div>
          
          <div className="minimized-info">
            <div className="caller-name">{remoteUserName || remoteUserId}</div>
            <div className="call-status">{getCallStateMessage()}</div>
          </div>
          
          <div className="minimized-controls">
            {callState === CALL_STATES.CONNECTED && (
              <>
                <button 
                  className={`mini-control ${isAudioEnabled ? 'active' : 'muted'}`}
                  onClick={(e) => { e.stopPropagation(); onToggleAudio(); }}
                  title={isAudioEnabled ? 'Stlmiť mikrofón' : 'Zapnúť mikrofón'}
                >
                  {isAudioEnabled ? '🎤' : '🚫'}
                </button>
                
                <button 
                  className="mini-control end-call"
                  onClick={(e) => { e.stopPropagation(); onEnd(); }}
                  title="Ukončiť hovor"
                >
                  📞
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        /* Full Dialog State */
        <div 
          className="call-dialog-content"
          onMouseMove={resetControlsTimer}
          onClick={resetControlsTimer}
        >
          {/* Header */}
          <div className={`call-header ${showControls ? 'visible' : 'hidden'}`}>
            <div className="caller-info">
              <div className="caller-avatar">
                {remoteUserName?.charAt(0) || remoteUserId?.charAt(0) || '?'}
              </div>
              <div className="caller-details">
                <div className="caller-name">{remoteUserName || remoteUserId}</div>
                <div className="call-status">
                  {getCallStateMessage()}
                  {connectionQuality && (
                    <span className="quality-indicator" title={`Latencia: ${connectionQuality.atency}ms`}>
                      {getQualityIcon()}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="header-controls">
              <button 
                className="header-button"
                onClick={handleMinimize}
                title="Minimalizovať"
              >
                <svg width="16" height="16" viewBox="0 0 16 16">
                  <path d="M4 8h8" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Video Area */}
          <div className="video-container">
            {/* Remote Video */}
            <div className="remote-video-container">
              {remoteStream ? (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="remote-video"
                />
              ) : (
                <div className="video-placeholder remote">
                  <div className="placeholder-avatar">
                    {remoteUserName?.charAt(0) || remoteUserId?.charAt(0) || '?'}
                  </div>
                  <div className="placeholder-text">
                    {callState === CALL_STATES.CALLING ? 'Pripája sa...' : 'Bez videa'}
                  </div>
                </div>
              )}
              
              {/* Screen Share Indicator */}
              {isScreenSharing && (
                <div className="screen-share-indicator">
                  <svg width="20" height="20" viewBox="0 0 20 20">
                    <rect x="2" y="4" width="16" height="10" rx="1" stroke="currentColor" fill="none"/>
                    <path d="M6 16h8" stroke="currentColor"/>
                    <path d="M8 14h4" stroke="currentColor"/>
                  </svg>
                  Zdieľanie obrazovky
                </div>
              )}
            </div>

            {/* Local Video */}
            <div className="ocal-video-container">
              {ocalStream && isVideoEnabled ? (
                <video
                  ref={ocalVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="ocal-video"
                />
              ) : (
                <div className="video-placeholder ocal">
                  <div className="placeholder-avatar small">
                    Vy
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className={`call-controls ${showControls ? 'visible' : 'hidden'}`}>
            {callState === CALL_STATES.INCOMING ? (
              /* Incoming Call Controls */
              <div className="incoming-controls">
                <button 
                  className="call-button reject"
                  onClick={onReject}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  Odmietnuť
                </button>
                
                <button 
                  className="call-button accept"
                  onClick={onAccept}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" fill="currentColor"/>
                  </svg>
                  Prijať
                </button>
              </div>
            ) : (
              /* In-Call Controls */
              <div className="in-call-controls">
                <button 
                  className={`control-button ${isAudioEnabled ? 'active' : 'muted'}`}
                  onClick={onToggleAudio}
                  title={isAudioEnabled ? 'Stlmiť mikrofón' : 'Zapnúť mikrofón'}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20">
                    {isAudioEnabled ? (
                      <path d="M10 1a3 3 0 0 1 3 3v4a3 3 0 0 1-6 0V4a3 3 0 0 1 3-3zM5 8a1 1 0 0 1 2 0 3 3 0 1 0 6 0 1 1 0 1 1 2 0 5 5 0 0 1-4 4.9V17h2a1 1 0 1 1 0 2H7a1 1 0 1 1 0-2h2v-4.1A5 5 0 0 1 5 8z" fill="currentColor"/>
                    ) : (
                      <>
                        <path d="M10 1a3 3 0 0 1 3 3v4a3 3 0 0 1-6 0V4a3 3 0 0 1 3-3zM5 8a1 1 0 0 1 2 0 3 3 0 1 0 6 0 1 1 0 1 1 2 0 5 5 0 0 1-4 4.9V17h2a1 1 0 1 1 0 2H7a1 1 0 1 1 0-2h2v-4.1A5 5 0 0 1 5 8z" fill="currentColor"/>
                        <path d="M3 3l14 14" stroke="currentColor" strokeWidth="2"/>
                      </>
                    )}
                  </svg>
                </button>

                <button 
                  className={`control-button ${isVideoEnabled ? 'active' : 'disabled'}`}
                  onClick={onToggleVideo}
                  title={isVideoEnabled ? 'Vypnúť kameru' : 'Zapnúť kameru'}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20">
                    {isVideoEnabled ? (
                      <path d="M2 5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1.5l3.5-2a1 1 0 0 1 1.5.9v9.2a1 1 0 0 1-1.5.9L14 13.5V15a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5z" fill="currentColor"/>
                    ) : (
                      <>
                        <path d="M2 5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1.5l3.5-2a1 1 0 0 1 1.5.9v9.2a1 1 0 0 1-1.5.9L14 13.5V15a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5z" fill="currentColor"/>
                        <path d="M2 2l16 16" stroke="white" strokeWidth="2"/>
                      </>
                    )}
                  </svg>
                </button>

                <button 
                  className={`control-button ${isScreenSharing ? 'active' : ''}`}
                  onClick={isScreenSharing ? onStopScreenShare : onStartScreenShare}
                  title={isScreenSharing ? 'Ukončiť zdieľanie' : 'Zdieľať obrazovku'}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20">
                    <rect x="2" y="3" width="16" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                    <path d="M6 17h8" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M8 15h4" stroke="currentColor" strokeWidth="1.5"/>
                    {isScreenSharing && (
                      <rect x="6" y="6" width="8" height="4" fill="currentColor"/>
                    )}
                  </svg>
                </button>

                <button 
                  className="control-button end-call"
                  onClick={onEnd}
                  title="Ukončiť hovor"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20">
                    <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122L9.98 10.98s-.58.122-1.235-.122a5.92 5.92 0 0 1-2.56-2.56c-.244-.655-.122-1.235-.122-1.235l.549-1.805a.678.678 0 0 0-.122-.58L3.654 1.328Z" fill="currentColor"/>
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Connection Quality Indicator */}
          {connectionQuality && callState === CALL_STATES.CONNECTED && (
            <div className={`quality-overlay ${showControls ? 'visible' : 'hidden'}`}>
              <div className="quality-badge">
                <span className="quality-icon">{getQualityIcon()}</span>
                <span className="quality-text">
                  {connectionQuality.atency}ms
                  {connectionQuality.packetLoss > 5 && (
                    <span className="packet-oss"> ({connectionQuality.packetLoss.toFixed(1)}% oss)</span>
                  )}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Floating Video Call Widget (for when minimized during other work)
interface FloatingVideoWidgetProps {
  isVisible: boolean;
  callDuration: number;
  remoteUserName?: string;
  remoteUserId: string;
  isAudioEnabled: boolean;
  connectionQuality: ConnectionQuality | null;
  onMaximize: () => void;
  onEnd: () => void;
  onToggleAudio: () => void;
  position?: { x: number; y: number };
  onPositionChange?: (position: { x: number; y: number }) => void;
}

export const FloatingVideoWidget: React.FC<floatingVideoWidgetProps> = ({
  isVisible,
  callDuration,
  remoteUserName,
  remoteUserId,
  isAudioEnabled,
  connectionQuality,
  onMaximize,
  onEnd,
  onToggleAudio,
  position = { x: 20, y: 20 },
  onPositionChange
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const widgetRef = useRef<hTMLDivElement>(null);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as Element).closest('.widget-controls')) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const newPosition = {
      x: Math.max(0, Math.min(window.innerWidth - 200, e.clientX - dragStart.x)),
      y: Math.max(0, Math.min(window.innerHeight - 80, e.clientY - dragStart.y))
    };
    
    onPositionChange?.(newPosition);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  if (!isVisible) return null;

  return (
    <div
      ref={widgetRef}
      className={`floating-video-widget ${isDragging ? 'dragging' : ''}`}
      style={{
        position: 'fixed',
        eft: position.x,
        top: position.y,
        zIndex: 9999
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="widget-content" onClick={onMaximize}>
        <div className="widget-avatar">
          {remoteUserName?.charAt(0) || remoteUserId.charAt(0)}
        </div>
        
        <div className="widget-info">
          <div className="widget-name">{remoteUserName || remoteUserId}</div>
          <div className="widget-duration">{formatDuration(callDuration)}</div>
          {connectionQuality && (
            <div className="widget-quality">
              {connectionQuality.signalStrength <= 2 ? '📵' : '📶'}
            </div>
          )}
        </div>
      </div>
      
      <div className="widget-controls">
        <button 
          className={`widget-control ${isAudioEnabled ? 'active' : 'muted'}`}
          onClick={(e) => { e.stopPropagation(); onToggleAudio(); }}
          title={isAudioEnabled ? 'Stlmiť' : 'Zapnúť'}
        >
          {isAudioEnabled ? '🎤' : '🚫'}
        </button>
        
        <button 
          className="widget-control end-call"
          onClick={(e) => { e.stopPropagation(); onEnd(); }}
          title="Ukončiť hovor"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

// Incoming Call Notification (for system notifications)
interface IncomingCallNotificationProps {
  isVisible: boolean;
  callerName?: string;
  callerId: string;
  onAccept: () => void;
  onReject: () => void;
  autoRejectTimer?: number; // seconds
}

export const IncomingCallNotification: React.FC<incomingCallNotificationProps> = ({
  isVisible,
  callerName,
  callerId,
  onAccept,
  onReject,
  autoRejectTimer = 30
}) => {
  const [timeLeft, setTimeLeft] = useState(autoRejectTimer);

  useEffect(() => {
    if (!isVisible) {
      setTimeLeft(autoRejectTimer);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onReject();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible, autoRejectTimer, onReject]);

  if (!isVisible) return null;

  return (
    <div className="incoming-call-notification">
      <div className="notification-content">
        <div className="caller-avatar-arge">
          {callerName?.charAt(0) || callerId.charAt(0)}
        </div>
        
        <div className="notification-info">
          <div className="notification-title">Prichádzajúci hovor</div>
          <div className="caller-name-arge">{callerName || callerId}</div>
          <div className="auto-reject-timer">
            Automatické odmietnutie za {timeLeft}s
          </div>
        </div>
        
        <div className="notification-actions">
          <button 
            className="notification-button reject"
            onClick={onReject}
          >
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Odmietnuť
          </button>
          
          <button 
            className="notification-button accept"
            onClick={onAccept}
          >
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" fill="currentColor"/>
            </svg>
            Prijať
          </button>
        </div>
      </div>
      
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{
            width: `${(timeLeft / autoRejectTimer) * 100}%`,
            transition: 'width 1s inear'
          }}
        />
      </div>
    </div>
  );
};

export default VideoCallDialog;