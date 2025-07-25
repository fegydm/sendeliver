// File: front/src/components/hauler/content/WebRTCTestIntegration.tsx
// Last change: Fixed all TypeScript errors with proper error handling

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  WebRTCConfig,
  WebRTCCallbacks,
  WebRTCState,
  DEFAULT_WEBRTC_CONFIG,
  DEFAULT_WEBRTC_STATE,
  CameraDevice,
  MicrophoneDevice
} from '../../../types/webrtc.types';
import './webrtc-test.css';

interface WebRTCTestIntegrationProps {
  vehicleId?: string;
  isOpen: boolean;
  onClose: () => void;
}

const WebRTCTestIntegration: React.FC<WebRTCTestIntegrationProps> = ({
  vehicleId = 'test-vehicle',
  isOpen,
  onClose
}) => {
  // WebRTC State
  const [webrtcState, setWebrtcState] = useState<WebRTCState>(DEFAULT_WEBRTC_STATE);
  const [config] = useState<WebRTCConfig>({
    ...DEFAULT_WEBRTC_CONFIG,
    reconnectAttempts: 3
  });
  
  // Device states
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [microphones, setMicrophones] = useState<MicrophoneDevice[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [selectedMicrophone, setSelectedMicrophone] = useState<string>('');
  
  // UI states
  const [isCallActive, setIsCallActive] = useState(false);
  const [callType, setCallType] = useState<'video' | 'audio'>('video');
  const [connectionLog, setConnectionLog] = useState<string[]>([]);
  const [stats, setStats] = useState<Record<string, any>>({});
  
  // Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);

  // Logging function
  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setConnectionLog(prev => [...prev.slice(-20), `[${timestamp}] ${message}`]);
    console.log(`[WebRTC] ${message}`);
  }, []);

  // WebRTC Callbacks
  const callbacks: WebRTCCallbacks = {
    onConnectionStateChange: (state: RTCPeerConnectionState) => {
      setWebrtcState(prev => ({ ...prev, connectionState: state }));
      addLog(`Connection state: ${state}`);
    },
    
    onIceConnectionStateChange: (state: RTCIceConnectionState) => {
      setWebrtcState(prev => ({ ...prev, iceConnectionState: state }));
      addLog(`ICE connection state: ${state}`);
      
      if (state === 'connected') {
        setWebrtcState(prev => ({ ...prev, isConnected: true, isConnecting: false }));
      } else if (state === 'disconnected' || state === 'failed') {
        setWebrtcState(prev => ({ ...prev, isConnected: false, isConnecting: false }));
      }
    },
    
    onLocalStream: (stream: MediaStream) => {
      setWebrtcState(prev => ({
        ...prev,
        localStream: stream,
        hasLocalVideo: stream.getVideoTracks().length > 0,
        hasLocalAudio: stream.getAudioTracks().length > 0
      }));
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      addLog(`Local stream acquired: ${stream.getTracks().length} tracks`);
    },
    
    onRemoteStream: (stream: MediaStream) => {
      setWebrtcState(prev => ({
        ...prev,
        remoteStream: stream,
        hasRemoteVideo: stream.getVideoTracks().length > 0,
        hasRemoteAudio: stream.getAudioTracks().length > 0
      }));
      
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
      
      addLog(`Remote stream received: ${stream.getTracks().length} tracks`);
    },
    
    onError: (error: Error) => {
      setWebrtcState(prev => ({ ...prev, lastError: error.message }));
      addLog(`Error: ${error.message}`);
    },
    
    onDataChannelMessage: (message: string) => {
      addLog(`Data channel message: ${message}`);
    }
  };

  // Get available devices
  const getAvailableDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      const videoDevices = devices.filter(device => device.kind === 'videoinput') as CameraDevice[];
      const audioDevices = devices.filter(device => device.kind === 'audioinput') as MicrophoneDevice[];
      
      setCameras(videoDevices);
      setMicrophones(audioDevices);
      
      if (videoDevices.length > 0 && !selectedCamera) {
        setSelectedCamera(videoDevices[0].deviceId);
      }
      
      if (audioDevices.length > 0 && !selectedMicrophone) {
        setSelectedMicrophone(audioDevices[0].deviceId);
      }
      
      addLog(`Found ${videoDevices.length} cameras, ${audioDevices.length} microphones`);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      addLog(`Failed to enumerate devices: ${err.message}`);
    }
  }, [selectedCamera, selectedMicrophone, addLog]);

  // Initialize WebRTC
  const initializeWebRTC = useCallback(async () => {
    try {
      addLog('Initializing WebRTC...');
      
      // Create peer connection
      const peerConnection = new RTCPeerConnection({
        iceServers: config.iceServers
      });
      
      peerConnectionRef.current = peerConnection;
      
      // Set up event listeners
      peerConnection.onconnectionstatechange = () => {
        callbacks.onConnectionStateChange?.(peerConnection.connectionState);
      };
      
      peerConnection.oniceconnectionstatechange = () => {
        callbacks.onIceConnectionStateChange?.(peerConnection.iceConnectionState);
      };
      
      peerConnection.ontrack = (event) => {
        callbacks.onRemoteStream?.(event.streams[0]);
      };
      
      peerConnection.ondatachannel = (event) => {
        const channel = event.channel;
        dataChannelRef.current = channel;
        
        channel.onopen = () => addLog('Data channel opened');
        channel.onmessage = (event) => callbacks.onDataChannelMessage?.(event.data);
        channel.onclose = () => addLog('Data channel closed');
      };
      
      // Get user media
      const constraints = {
        video: callType === 'video' ? {
          deviceId: selectedCamera ? { exact: selectedCamera } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } : false,
        audio: {
          deviceId: selectedMicrophone ? { exact: selectedMicrophone } : undefined,
          echoCancellation: true,
          noiseSuppression: true
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      
      // Add tracks to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });
      
      callbacks.onLocalStream?.(stream);
      setWebrtcState(prev => ({ ...prev, isConnecting: true }));
      
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setWebrtcState(prev => ({ ...prev, lastError: err.message }));
      addLog(`Initialization error: ${err.message}`);
    }
  }, [config, callType, selectedCamera, selectedMicrophone, callbacks, addLog]);

  // Start call
  const startCall = useCallback(async () => {
    if (!peerConnectionRef.current) {
      await initializeWebRTC();
    }
    
    try {
      addLog('Starting call...');
      setIsCallActive(true);
      setWebrtcState(prev => ({ ...prev, isInCall: true, isVideoCall: callType === 'video' }));
      
      // Create data channel
      const dataChannel = peerConnectionRef.current!.createDataChannel('messages');
      dataChannelRef.current = dataChannel;
      
      dataChannel.onopen = () => addLog('Data channel opened');
      dataChannel.onmessage = (event) => callbacks.onDataChannelMessage?.(event.data);
      
      // For testing, we'll create an offer
      const offer = await peerConnectionRef.current!.createOffer();
      await peerConnectionRef.current!.setLocalDescription(offer);
      
      addLog('Call started, waiting for answer...');
      
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setWebrtcState(prev => ({ ...prev, lastError: err.message }));
      addLog(`Call start error: ${err.message}`);
    }
  }, [initializeWebRTC, callType, callbacks, addLog]);

  // End call
  const endCall = useCallback(() => {
    addLog('Ending call...');
    
    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    
    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    // Close data channel
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }
    
    setIsCallActive(false);
    setWebrtcState(DEFAULT_WEBRTC_STATE);
    
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  }, [addLog]);

  // Toggle mute
  const toggleMute = useCallback((type: 'audio' | 'video') => {
    if (!localStreamRef.current) return;
    
    const tracks = type === 'audio' 
      ? localStreamRef.current.getAudioTracks()
      : localStreamRef.current.getVideoTracks();
    
    tracks.forEach(track => {
      track.enabled = !track.enabled;
    });
    
    if (type === 'audio') {
      setWebrtcState(prev => ({ ...prev, isAudioMuted: !prev.isAudioMuted }));
    } else {
      setWebrtcState(prev => ({ ...prev, isVideoMuted: !prev.isVideoMuted }));
    }
    
    addLog(`${type} ${tracks[0]?.enabled ? 'unmuted' : 'muted'}`);
  }, [addLog]);

  // Send test message
  const sendTestMessage = useCallback(() => {
    if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
      const message = `Test message from dispatcher at ${new Date().toLocaleTimeString()}`;
      dataChannelRef.current.send(message);
      addLog(`Sent: ${message}`);
    } else {
      addLog('Data channel not ready');
    }
  }, [addLog]);

  // Get connection stats
  const getStats = useCallback(async () => {
    if (!peerConnectionRef.current) return;
    
    try {
      const statsReport = await peerConnectionRef.current.getStats();
      const statsObj: Record<string, any> = {};
      
      statsReport.forEach((report: any) => {
        if (report.type === 'inbound-rtp' || report.type === 'outbound-rtp') {
          statsObj[report.type] = {
            kind: report.kind || 'unknown',
            bytesReceived: report.bytesReceived || 0,
            bytesSent: report.bytesSent || 0,
            packetsLost: report.packetsLost || 0,
            jitter: report.jitter || 0
          };
        }
      });
      
      setStats(statsObj);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      addLog(`Failed to get stats: ${err.message}`);
    }
  }, [addLog]);

  // Initialize on mount
  useEffect(() => {
    if (isOpen) {
      getAvailableDevices();
      
      // Get stats periodically
      const statsInterval = setInterval(getStats, 5000);
      
      return () => {
        clearInterval(statsInterval);
        endCall();
      };
    }
  }, [isOpen, getAvailableDevices, getStats, endCall]);

  if (!isOpen) return null;

  return (
    <div className="webrtc-test-modal-overlay" onClick={onClose}>
      <div className="webrtc-test-modal-content" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="webrtc-test-header">
          <h2>WebRTC Test Integration - Vehicle {vehicleId}</h2>
          <button className="webrtc-test-close" onClick={onClose}>×</button>
        </div>
        
        <div className="webrtc-test-body">
          
          {/* Device Selection */}
          <div className="webrtc-test-section">
            <h3>Device Configuration</h3>
            <div className="device-controls">
              <div className="device-group">
                <label>Camera:</label>
                <select 
                  value={selectedCamera} 
                  onChange={e => setSelectedCamera(e.target.value)}
                  disabled={isCallActive}
                >
                  {cameras.map(camera => (
                    <option key={camera.deviceId} value={camera.deviceId}>
                      {camera.label || `Camera ${camera.deviceId.slice(0, 8)}`}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="device-group">
                <label>Microphone:</label>
                <select 
                  value={selectedMicrophone} 
                  onChange={e => setSelectedMicrophone(e.target.value)}
                  disabled={isCallActive}
                >
                  {microphones.map(mic => (
                    <option key={mic.deviceId} value={mic.deviceId}>
                      {mic.label || `Microphone ${mic.deviceId.slice(0, 8)}`}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="device-group">
                <label>Call Type:</label>
                <select 
                  value={callType} 
                  onChange={e => setCallType(e.target.value as 'video' | 'audio')}
                  disabled={isCallActive}
                >
                  <option value="video">Video Call</option>
                  <option value="audio">Audio Only</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Video Streams */}
          <div className="webrtc-test-section">
            <h3>Video Streams</h3>
            <div className="video-container">
              <div className="video-stream">
                <h4>Local Stream (Dispatcher)</h4>
                <video 
                  ref={localVideoRef} 
                  autoPlay 
                  muted 
                  playsInline
                  className="local-video"
                />
                <div className="stream-info">
                  <span className={`stream-status ${webrtcState.hasLocalVideo ? 'active' : 'inactive'}`}>
                    Video: {webrtcState.hasLocalVideo ? 'Active' : 'Inactive'}
                  </span>
                  <span className={`stream-status ${webrtcState.hasLocalAudio ? 'active' : 'inactive'}`}>
                    Audio: {webrtcState.hasLocalAudio ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              <div className="video-stream">
                <h4>Remote Stream (Driver)</h4>
                <video 
                  ref={remoteVideoRef} 
                  autoPlay 
                  playsInline
                  className="remote-video"
                />
                <div className="stream-info">
                  <span className={`stream-status ${webrtcState.hasRemoteVideo ? 'active' : 'inactive'}`}>
                    Video: {webrtcState.hasRemoteVideo ? 'Active' : 'Inactive'}
                  </span>
                  <span className={`stream-status ${webrtcState.hasRemoteAudio ? 'active' : 'inactive'}`}>
                    Audio: {webrtcState.hasRemoteAudio ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Call Controls */}
          <div className="webrtc-test-section">
            <h3>Call Controls</h3>
            <div className="call-controls">
              {!isCallActive ? (
                <button className="call-button start-call" onClick={startCall}>
                  📞 Start {callType === 'video' ? 'Video' : 'Audio'} Call
                </button>
              ) : (
                <>
                  <button className="call-button end-call" onClick={endCall}>
                    📞 End Call
                  </button>
                  
                  <button 
                    className={`call-button mute-audio ${webrtcState.isAudioMuted ? 'muted' : ''}`}
                    onClick={() => toggleMute('audio')}
                  >
                    {webrtcState.isAudioMuted ? '🔇' : '🔊'} Audio
                  </button>
                  
                  {callType === 'video' && (
                    <button 
                      className={`call-button mute-video ${webrtcState.isVideoMuted ? 'muted' : ''}`}
                      onClick={() => toggleMute('video')}
                    >
                      {webrtcState.isVideoMuted ? '📹' : '📷'} Video
                    </button>
                  )}
                  
                  <button className="call-button send-message" onClick={sendTestMessage}>
                    💬 Send Test Message
                  </button>
                </>
              )}
            </div>
          </div>
          
          {/* Connection Status */}
          <div className="webrtc-test-section">
            <h3>Connection Status</h3>
            <div className="status-grid">
              <div className="status-item">
                <span className="status-label">Connection:</span>
                <span className={`status-value ${webrtcState.isConnected ? 'connected' : 'disconnected'}`}>
                  {webrtcState.connectionState}
                </span>
              </div>
              
              <div className="status-item">
                <span className="status-label">ICE:</span>
                <span className={`status-value ${webrtcState.iceConnectionState === 'connected' ? 'connected' : 'disconnected'}`}>
                  {webrtcState.iceConnectionState}
                </span>
              </div>
              
              <div className="status-item">
                <span className="status-label">Signaling:</span>
                <span className="status-value">{webrtcState.signalingState}</span>
              </div>
              
              {webrtcState.lastError && (
                <div className="status-item error">
                  <span className="status-label">Error:</span>
                  <span className="status-value">{webrtcState.lastError}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Statistics */}
          {Object.keys(stats).length > 0 && (
            <div className="webrtc-test-section">
              <h3>Connection Statistics</h3>
              <div className="stats-container">
                {Object.entries(stats).map(([type, data]) => (
                  <div key={type} className="stats-group">
                    <h4>{type}</h4>
                    <div className="stats-grid">
                      {Object.entries(data).map(([key, value]) => (
                        <div key={key} className="stats-item">
                          <span className="stats-label">{key}:</span>
                          <span className="stats-value">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Connection Log */}
          <div className="webrtc-test-section">
            <h3>Connection Log</h3>
            <div className="log-container">
              {connectionLog.map((log, index) => (
                <div key={index} className="log-entry">{log}</div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default WebRTCTestIntegration;