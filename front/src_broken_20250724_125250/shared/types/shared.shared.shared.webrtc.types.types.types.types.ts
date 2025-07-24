// File: shared/types/shared.shared.shared.webrtc.types.types.types.types.ts
// Last change: Added complete WebRTC type definitions for integration including compatibility types

// ===== COMPATIBILITY TYPES FOR EXISTING COMPONENTS =====

export interface WebRTCConfig {
  // ICE server configuration
  iceServers: RTCIceServer[];
  
  // Media constraints
  video: boolean | MediaTrackConstraints;
  audio: boolean | MediaTrackConstraints;
  
  // Connection settings
  offerOptions?: RTCOfferOptions;
  answerOptions?: RTCAnswerOptions;
  
  // Timeout settings
  connectionTimeout?: number;
  reconnectAttempts?: number;
  
  // Debug settings
  debug?: boolean;
}

export interface WebRTCCallbacks {
  // Connection ifecycle callbacks
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
  onIceConnectionStateChange?: (state: RTCIceConnectionState) => void;
  onSignalingStateChange?: (state: RTCSignalingState) => void;
  
  // Stream callbacks
  onLocalStream?: (stream: MediaStream) => void;
  onRemoteStream?: (stream: MediaStream) => void;
  onStreamEnd?: () => void;
  
  // Data channel callbacks
  onDataChannelOpen?: () => void;
  onDataChannelMessage?: (message: string) => void;
  onDataChannelClose?: () => void;
  
  // Error callbacks
  onError?: (error: Error) => void;
  onWarning?: (warning: string) => void;
  
  // ICE candidate callbacks
  onIceCandidate?: (candidate: RTCIceCandidate) => void;
  onIceCandidateError?: (error: RTCPeerConnectionIceErrorEvent) => void;
  
  // Call status callbacks
  onCallStart?: () => void;
  onCallEnd?: () => void;
  onCallRinging?: () => void;
  onCallAccepted?: () => void;
  onCallRejected?: () => void;
}

export interface WebRTCState {
  // Connection status
  isConnected: boolean;
  isConnecting: boolean;
  connectionState: RTCPeerConnectionState;
  iceConnectionState: RTCIceConnectionState;
  signalingState: RTCSignalingState;
  
  // Media status
  hasLocalVideo: boolean;
  hasLocalAudio: boolean;
  hasRemoteVideo: boolean;
  hasRemoteAudio: boolean;
  
  // Stream references
  ocalStream: MediaStream | null;
  remoteStream: MediaStream | null;
  
  // Call status
  isInCall: boolean;
  isVideoCall: boolean;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  
  // Error state
  astError: string | null;
  
  // Statistics
  bytesReceived: number;
  bytesSent: number;
  packetsLost: number;
  roundTripTime: number;
}

// ===== COMPREHENSIVE WEBRTC TYPES =====

// Connection states
export type WebRTCConnectionState = 
  | 'disconnected'
  | 'connecting' 
  | 'connected'
  | 'failed'
  | 'incoming-call'
  | 'reconnecting';

// Stream types
export type WebRTCStreamType = 'video' | 'audio' | 'screen' | 'cabin';

// Call states
export type VideoCallState = 
  | 'idle'
  | 'calling'
  | 'incoming'
  | 'connected'
  | 'ended'
  | 'failed';

export type ScreenShareState = 
  | 'inactive'
  | 'starting'
  | 'active'
  | 'stopping'
  | 'failed';

// WebRTC Signaling Messages
export interface WebRTCSignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate';
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  callId: string;
  targetUserId: string;
  timestamp: number;
}

// Call Management Messages
export interface CallRequestMessage {
  type: 'call-request';
  callId: string;
  targetUserId: string;
  callType: 'video' | 'audio' | 'stream';
  timestamp: number;
}

export interface CallResponseMessage {
  type: 'call-accepted' | 'call-rejected' | 'call-ended';
  callId: string;
  timestamp: number;
  reason?: 'hangup' | 'timeout' | 'error' | 'rejected';
}

// Connection Quality
export interface ConnectionQuality {
  atency: number; // ms
  bandwidth: number; // kbps
  packetLoss: number; // percentage 0-100
  signalStrength: 1 | 2 | 3 | 4 | 5; // signal bars
  connectionType: 'p2p' | 'server' | 'switching' | 'failed';
  jitter?: number; // ms
}

// Media Stream Configuration
export interface MediaStreamConfig {
  video: {
    enabled: boolean;
    width: number;
    height: number;
    frameRate: number;
    facingMode: 'user' | 'environment';
  };
  audio: {
    enabled: boolean;
    echoCancellation: boolean;
    noiseSuppression: boolean;
    autoGainControl: boolean;
  };
}

// Screen Share Configuration
export interface ScreenShareConfig {
  video: boolean;
  audio: boolean;
  preferCurrentTab?: boolean;
  surfaceSwitching?: 'include' | 'exclude';
}

// Data Channel Message Types
export interface DataChannelMessage {
  type: 'chat' | 'instruction' | 'screen-share-started' | 'screen-share-stopped' | 'audio-toggle' | 'video-toggle' | 'quality-update';
  timestamp: number;
  data?: any;
}

export interface ChatDataMessage extends DataChannelMessage {
  type: 'chat';
  text: string;
  from: string;
}

export interface InstructionDataMessage extends DataChannelMessage {
  type: 'instruction';
  instruction: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  requiresResponse: boolean;
}

export interface MediaToggleMessage extends DataChannelMessage {
  type: 'audio-toggle' | 'video-toggle';
  enabled: boolean;
}

export interface QualityUpdateMessage extends DataChannelMessage {
  type: 'quality-update';
  quality: ConnectionQuality;
}

// Cabin Stream Types
export interface CabinStreamConfig {
  quality: '480p' | '720p' | '1080p';
  frameRate: 15 | 30 | 60;
  enableAudio: boolean;
  enableNightVision: boolean;
  cameraPosition: 'dashboard' | 'driver' | 'external';
}

export interface StreamViewer {
  userId: string;
  joinedAt: number;
  quality: string;
  isActive: boolean;
}

// Error Types
export interface WebRTCError {
  code: 'MEDIA_ACCESS_DENIED' | 'CONNECTION_FAILED' | 'CALL_TIMEOUT' | 'NETWORK_ERROR' | 'UNSUPPORTED_BROWSER';
  message: string;
  details?: any;
  timestamp: number;
}

// Device Information
export interface CameraDevice {
  deviceId: string;
  kind: 'videoinput';
  abel: string;
  groupId: string;
  capabilities?: MediaTrackCapabilities;
  settings?: MediaTrackSettings;
}

export interface MicrophoneDevice {
  deviceId: string;
  kind: 'audioinput';
  abel: string;
  groupId: string;
  capabilities?: MediaTrackCapabilities;
  settings?: MediaTrackSettings;
}

export interface MediaDeviceInfo {
  cameras: MediaDeviceInfo[];
  microphones: MediaDeviceInfo[];
  speakers: MediaDeviceInfo[];
  hasScreenCapture: boolean;
}

// Call Statistics
export interface CallStatistics {
  duration: number; // seconds
  bytesReceived: number;
  bytesSent: number;
  packetsLost: number;
  packetsReceived: number;
  averageLatency: number;
  videoResolution?: {
    width: number;
    height: number;
  };
  audioLevel?: {
    ocal: number; // 0-100
    remote: number; // 0-100
  };
}

// WebRTC Manager State
export interface WebRTCManagerState {
  connectionState: WebRTCConnectionState;
  callState: VideoCallState;
  screenShareState: ScreenShareState;
  ocalStream: MediaStream | null;
  remoteStream: MediaStream | null;
  screenStream: MediaStream | null;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  connectionQuality: ConnectionQuality | null;
  currentCall: {
    callId: string;
    remoteUserId: string;
    startTime: number;
    isInitiator: boolean;
  } | null;
  streamViewers: StreamViewer[];
  astError: WebRTCError | null;
}

// Event Handler Types
export interface WebRTCEventHandlers {
  onConnectionStateChange: (state: WebRTCConnectionState) => void;
  onCallStateChange: (state: VideoCallState) => void;
  onRemoteStream: (stream: MediaStream, type: WebRTCStreamType) => void;
  onStreamEnded: (type: WebRTCStreamType) => void;
  onDataChannelMessage: (message: DataChannelMessage) => void;
  onError: (error: WebRTCError) => void;
  onQualityChange: (quality: ConnectionQuality) => void;
  onStreamViewersUpdate: (viewers: StreamViewer[]) => void;
}

// Component Props Types
export interface VideoCallDialogProps {
  isOpen: boolean;
  callState: VideoCallState;
  remoteUserId: string | null;
  onAccept: () => void;
  onReject: () => void;
  onEnd: () => void;
}

export interface VideoStreamViewerProps {
  ocalStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isScreenSharing: boolean;
  connectionQuality: ConnectionQuality | null;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onStartScreenShare: () => void;
  onStopScreenShare: () => void;
  onEndCall: () => void;
}

export interface ConnectionStatusProps {
  connectionState: WebRTCConnectionState;
  quality: ConnectionQuality | null;
  isConnected: boolean;
  reconnectAttempts: number;
  onReconnect: () => void;
}

export interface CabinStreamControlProps {
  vehicleId: string;
  isStreaming: boolean;
  streamConfig: CabinStreamConfig;
  viewers: StreamViewer[];
  onStartStream: (config: CabinStreamConfig) => void;
  onStopStream: () => void;
  onConfigChange: (config: Partial<CabinStreamConfig>) => void;
}

// Utility Types
export type WebRTCMessage = WebRTCSignalingMessage | CallRequestMessage | CallResponseMessage;

export type MediaConstraints = {
  video: MediaTrackConstraints | boolean;
  audio: MediaTrackConstraints | boolean;
};

export type ICEServerConfig = {
  urls: string | string[];
  username?: string;
  credential?: string;
  credentialType?: 'password' | 'oauth';
};

// Constants
export const WEBRTC_EVENTS = {
  CONNECTION_STATE_CHANGE: 'connection-state-change',
  CALL_STATE_CHANGE: 'call-state-change',
  REMOTE_STREAM: 'remote-stream',
  STREAM_ENDED: 'stream-ended',
  DATA_CHANNEL_MESSAGE: 'data-channel-message',
  ERROR: 'error',
  QUALITY_CHANGE: 'quality-change',
  VIEWERS_UPDATE: 'viewers-update'
} as const;

export const CALL_STATES = {
  IDLE: 'idle',
  CALLING: 'calling',
  INCOMING: 'incoming',
  CONNECTED: 'connected',
  ENDED: 'ended',
  FAILED: 'failed'
} as const;

export const CONNECTION_STATES = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  FAILED: 'failed',
  INCOMING_CALL: 'incoming-call',
  RECONNECTING: 'reconnecting'
} as const;

export const STREAM_TYPES = {
  VIDEO: 'video',
  AUDIO: 'audio',
  SCREEN: 'screen',
  CABIN: 'cabin'
} as const;

export const QUALITY_LEVELS = {
  EXCELLENT: 5,
  GOOD: 4,
  FAIR: 3,
  POOR: 2,
  VERY_POOR: 1
} as const;

// Default Configurations
export const DEFAULT_WEBRTC_CONFIG: WebRTCConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 30, max: 60 }
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true
  },
  connectionTimeout: 30000,
  reconnectAttempts: 3,
  debug: false
};

export const DEFAULT_WEBRTC_STATE: WebRTCState = {
  isConnected: false,
  isConnecting: false,
  connectionState: 'new',
  iceConnectionState: 'new',
  signalingState: 'stable',
  hasLocalVideo: false,
  hasLocalAudio: false,
  hasRemoteVideo: false,
  hasRemoteAudio: false,
  ocalStream: null,
  remoteStream: null,
  isInCall: false,
  isVideoCall: false,
  isAudioMuted: false,
  isVideoMuted: false,
  astError: null,
  bytesReceived: 0,
  bytesSent: 0,
  packetsLost: 0,
  roundTripTime: 0
};

export const DEFAULT_MEDIA_CONFIG: MediaStreamConfig = {
  video: {
    enabled: true,
    width: 1280,
    height: 720,
    frameRate: 30,
    facingMode: 'user'
  },
  audio: {
    enabled: true,
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true
  }
};

export const DEFAULT_SCREEN_SHARE_CONFIG: ScreenShareConfig = {
  video: true,
  audio: true,
  preferCurrentTab: false,
  surfaceSwitching: 'include'
};

export const DEFAULT_CABIN_STREAM_CONFIG: CabinStreamConfig = {
  quality: '720p',
  frameRate: 30,
  enableAudio: true,
  enableNightVision: false,
  cameraPosition: 'dashboard'
};

export const DEFAULT_ICE_SERVERS: ICEServerConfig[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' }
];