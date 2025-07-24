// File: shared/types/shared.shared.shared.websocket-messages.types.types.types.types.ts
// Last change: Created TypeScript interfaces for all WebSocket message types

// Base message interface
interface BaseMessage {
  timestamp: string;
  id?: string; // Optional message ID for tracking
}

// GPS Tracking Messages
export interface GPSUpdateMessage extends BaseMessage {
  type: 'GPS_UPDATE';
  vehicleId: string;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  accuracy: number;
  altitude?: number;
  batteryLevel?: number;
}

export interface GPSHistoryRequestMessage extends BaseMessage {
  type: 'GPS_HISTORY_REQUEST';
  vehicleId: string;
  fromTime?: string;
  toTime?: string;
}

export interface GPSHistoryResponseMessage extends BaseMessage {
  type: 'GPS_HISTORY_RESPONSE';
  vehicleId: string;
  points: Array<{
    lat: number;
    lng: number;
    speed: number;
    timestamp: string;
  }>;
}

// Chat Messages
export interface ChatMessage extends BaseMessage {
  type: 'CHAT_MESSAGE';
  from: string; // userId
  to: string;   // vehicleId or userId
  message: string;
  conversationId: string;
}

export interface ChatDeliveredMessage extends BaseMessage {
  type: 'CHAT_DELIVERED';
  messageId: string;
  deliveredTo: string;
}

export interface ChatReadMessage extends BaseMessage {
  type: 'CHAT_READ';
  messageId: string;
  readBy: string;
}

// Yes/No Question Messages
export interface YesNoQuestionMessage extends BaseMessage {
  type: 'YESNO_QUESTION';
  from: string;
  to: string;
  question: string;
  questionId: string;
}

export interface YesNoAnswerMessage extends BaseMessage {
  type: 'YESNO_ANSWER';
  questionId: string;
  answer: 'yes' | 'no';
  from: string;
}

// WebRTC Signaling Messages
export interface WebRTCOfferMessage extends BaseMessage {
  type: 'WEBRTC_OFFER';
  from: string;
  to: string;
  offer: RTCSessionDescriptionInit;
  callType: 'video' | 'audio' | 'stream';
  callId: string;
}

export interface WebRTCAnswerMessage extends BaseMessage {
  type: 'WEBRTC_ANSWER';
  from: string;
  to: string;
  answer: RTCSessionDescriptionInit;
  callId: string;
}

export interface WebRTCCandidateMessage extends BaseMessage {
  type: 'WEBRTC_CANDIDATE';
  from: string;
  to: string;
  candidate: RTCIceCandidateInit;
  callId: string;
}

export interface WebRTCCallEndMessage extends BaseMessage {
  type: 'WEBRTC_CALL_END';
  callId: string;
  from: string;
  reason?: 'hangup' | 'timeout' | 'error';
}

// Stream Control Messages
export interface StreamStartMessage extends BaseMessage {
  type: 'STREAM_START';
  vehicleId: string;
  streamType: 'cabin' | 'external';
  quality: '480p' | '720p' | '1080p';
}

export interface StreamStopMessage extends BaseMessage {
  type: 'STREAM_STOP';
  vehicleId: string;
  streamType: 'cabin' | 'external';
}

export interface StreamStatusMessage extends BaseMessage {
  type: 'STREAM_STATUS';
  vehicleId: string;
  status: 'starting' | 'active' | 'stopped' | 'error';
  streamType: 'cabin' | 'external';
  viewers?: number;
}

// File/Screenshot Messages
export interface ScreenshotMessage extends BaseMessage {
  type: 'SCREENSHOT';
  from: string;
  to: string;
  imageData: string; // base64 encoded
  description?: string;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface FileTransferMessage extends BaseMessage {
  type: 'FILE_TRANSFER';
  from: string;
  to: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileData: string; // base64 encoded
  transferId: string;
}

export interface FileTransferStatusMessage extends BaseMessage {
  type: 'FILE_TRANSFER_STATUS';
  transferId: string;
  status: 'starting' | 'progress' | 'completed' | 'error';
  progress?: number; // 0-100
  error?: string;
}

// Connection Status Messages
export interface VehicleConnectedMessage extends BaseMessage {
  type: 'VEHICLE_CONNECTED';
  vehicleId: string;
  driverId: string;
  deviceInfo: {
    platform: 'ios' | 'android';
    version: string;
    batteryLevel?: number;
    networkType: '3G' | '4G' | '5G' | 'WiFi';
  };
}

export interface VehicleDisconnectedMessage extends BaseMessage {
  type: 'VEHICLE_DISCONNECTED';
  vehicleId: string;
  reason?: 'normal' | 'timeout' | 'error';
}

export interface UserStatusMessage extends BaseMessage {
  type: 'USER_STATUS';
  userId: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen?: string;
}

// Command Messages
export interface VehicleCommandMessage extends BaseMessage {
  type: 'VEHICLE_COMMAND';
  vehicleId: string;
  command: 'honk' | 'lights' | 'location_request' | 'emergency_stop';
  parameters?: Record<string, any>;
  commandId: string;
}

export interface CommandResponseMessage extends BaseMessage {
  type: 'COMMAND_RESPONSE';
  commandId: string;
  success: boolean;
  error?: string;
  data?: any;
}

// Connection Quality Messages
export interface ConnectionQualityMessage extends BaseMessage {
  type: 'CONNECTION_QUALITY';
  from: string;
  connectionType: 'p2p' | 'server' | 'switching' | 'failed';
  latency: number; // ms
  quality: 1 | 2 | 3 | 4 | 5; // signal strength
  bandwidth: number; // kbps
  packetLoss: number; // percentage
  jitter?: number; // ms
}

// System Messages
export interface SystemMessage extends BaseMessage {
  type: 'SYSTEM_MESSAGE';
  messageType: 'info' | 'warning' | 'error';
  message: string;
  targetUser?: string;
  targetVehicle?: string;
}

export interface HeartbeatMessage extends BaseMessage {
  type: 'HEARTBEAT';
  from: string;
}

export interface HeartbeatResponseMessage extends BaseMessage {
  type: 'HEARTBEAT_RESPONSE';
  to: string;
  serverTime: string;
}

// Union type for all possible messages
export type WebSocketMessage = 
  | GPSUpdateMessage
  | GPSHistoryRequestMessage
  | GPSHistoryResponseMessage
  | ChatMessage
  | ChatDeliveredMessage
  | ChatReadMessage
  | YesNoQuestionMessage
  | YesNoAnswerMessage
  | WebRTCOfferMessage
  | WebRTCAnswerMessage
  | WebRTCCandidateMessage
  | WebRTCCallEndMessage
  | StreamStartMessage
  | StreamStopMessage
  | StreamStatusMessage
  | ScreenshotMessage
  | FileTransferMessage
  | FileTransferStatusMessage
  | VehicleConnectedMessage
  | VehicleDisconnectedMessage
  | UserStatusMessage
  | VehicleCommandMessage
  | CommandResponseMessage
  | ConnectionQualityMessage
  | SystemMessage
  | HeartbeatMessage
  | HeartbeatResponseMessage;

// Helper type for message handlers
export type MessageHandler<T extends WebSocketMessage> = (message: T) => void;

// Message type guards for type safety
export const isGPSUpdate = (msg: WebSocketMessage): msg is GPSUpdateMessage => 
  msg.type === 'GPS_UPDATE';

export const isChatMessage = (msg: WebSocketMessage): msg is ChatMessage => 
  msg.type === 'CHAT_MESSAGE';

export const isWebRTCSignaling = (msg: WebSocketMessage): msg is WebRTCOfferMessage | WebRTCAnswerMessage | WebRTCCandidateMessage => 
  msg.type === 'WEBRTC_OFFER' || msg.type === 'WEBRTC_ANSWER' || msg.type === 'WEBRTC_CANDIDATE';

export const isStreamControl = (msg: WebSocketMessage): msg is StreamStartMessage | StreamStopMessage | StreamStatusMessage => 
  msg.type === 'STREAM_START' || msg.type === 'STREAM_STOP' || msg.type === 'STREAM_STATUS';

export const isConnectionStatus = (msg: WebSocketMessage): msg is VehicleConnectedMessage | VehicleDisconnectedMessage => 
  msg.type === 'VEHICLE_CONNECTED' || msg.type === 'VEHICLE_DISCONNECTED';

// Constants for message types
export const MESSAGE_TYPES = {
  GPS_UPDATE: 'GPS_UPDATE',
  CHAT_MESSAGE: 'CHAT_MESSAGE',
  WEBRTC_OFFER: 'WEBRTC_OFFER',
  STREAM_START: 'STREAM_START',
  CONNECTION_QUALITY: 'CONNECTION_QUALITY',
  // ... add more as needed
} as const;