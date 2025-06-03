// File: front/src/services/websocket-wrapper.service.ts
// Last change: Created WebSocket wrapper with GPS, chat, and communication features
import React from 'react';
import WebSocketService from './websocket.service';
import { 
  WebSocketMessage, 
  GPSUpdateMessage, 
  ChatMessage, 
  YesNoQuestionMessage,
  YesNoAnswerMessage,
  ScreenshotMessage,
  VehicleConnectedMessage,
  VehicleDisconnectedMessage,
  ConnectionQualityMessage,
  StreamStartMessage,
  StreamStopMessage} from '@/types/websocket-messages.types';

// GPS data structures
interface GPSPoint {
  vehicleId: string;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  accuracy: number;
  timestamp: string;
  altitude?: number;
  batteryLevel?: number;
}

interface VehicleStatus {
  vehicleId: string;
  isOnline: boolean;
  lastSeen: string;
  connectionType: 'p2p' | 'server' | 'switching' | 'failed';
  quality: {
    latency: number;
    signalStrength: 1 | 2 | 3 | 4 | 5;
    bandwidth: number;
    packetLoss: number;
  };
}

interface ChatConversation {
  conversationId: string;
  participants: string[];
  lastMessage?: ChatMessage;
  unreadCount: number;
}

class WebSocketWrapperService {
  private wsService: WebSocketService;
  private messageHandlers = new Map<string, Set<Function>>();
  
  // GPS data storage
  private vehiclePositions = new Map<string, GPSPoint>();
  private vehicleTrails = new Map<string, GPSPoint[]>();
  private vehicleStatuses = new Map<string, VehicleStatus>();
  
  // Chat data storage
  private conversations = new Map<string, ChatConversation>();
  private chatHistory = new Map<string, ChatMessage[]>();
  
  // Yes/No questions storage
  private pendingQuestions = new Map<string, YesNoQuestionMessage>();
  
  // Configuration
  private readonly maxTrailLength = 100;
  private readonly heartbeatInterval = 30000; // 30 seconds
  private heartbeatTimer?: NodeJS.Timeout;
  
  constructor(wsUrl: string = 'ws://localhost:5000') {
    this.wsService = new WebSocketService(wsUrl);
    this.setupMessageHandling();
    this.setupHeartbeat();
  }

  // Initialize WebSocket connection
  async connect(): Promise<void> {
    await this.wsService.connect();
    this.emit('connected', null);
  }

  // Setup message routing
  private setupMessageHandling(): void {
    this.wsService.subscribe('message', (message: WebSocketMessage) => {
      this.routeMessage(message);
    });

    this.wsService.subscribe('connection', () => {
      this.emit('connected', null);
    });

    this.wsService.subscribe('close', (event: CloseEvent) => {
      this.emit('disconnected', event);
    });

    this.wsService.subscribe('error', (error: any) => {
      this.emit('error', error);
    });
  }

  // Route incoming messages by type
  private routeMessage(message: WebSocketMessage): void {
    console.log(`[WebSocket] Received ${message.type}:`, message);

    switch (message.type) {
      case 'GPS_UPDATE':
        this.handleGPSUpdate(message as GPSUpdateMessage);
        break;
      case 'CHAT_MESSAGE':
        this.handleChatMessage(message as ChatMessage);
        break;
      case 'YESNO_QUESTION':
        this.handleYesNoQuestion(message as YesNoQuestionMessage);
        break;
      case 'YESNO_ANSWER':
        this.handleYesNoAnswer(message as YesNoAnswerMessage);
        break;
      case 'SCREENSHOT':
        this.handleScreenshot(message as ScreenshotMessage);
        break;
      case 'VEHICLE_CONNECTED':
      case 'VEHICLE_DISCONNECTED':
        this.handleVehicleConnection(message as VehicleConnectedMessage | VehicleDisconnectedMessage);
        break;
      case 'CONNECTION_QUALITY':
        this.handleConnectionQuality(message as ConnectionQualityMessage);
        break;
      case 'STREAM_START':
      case 'STREAM_STOP':
        this.handleStreamControl(message as StreamStartMessage | StreamStopMessage);
        break;
      default:
        console.warn(`[WebSocket] Unhandled message type: ${message.type}`);
    }

    // Emit to specific message type listeners
    this.emit(message.type, message);
    this.emit('message', message);
  }

  // GPS handling methods
  private handleGPSUpdate(message: GPSUpdateMessage): void {
    const gpsPoint: GPSPoint = {
      vehicleId: message.vehicleId,
      lat: message.lat,
      lng: message.lng,
      speed: message.speed,
      heading: message.heading,
      accuracy: message.accuracy,
      timestamp: message.timestamp,
      altitude: message.altitude,
      batteryLevel: message.batteryLevel
    };

    // Update current position
    this.vehiclePositions.set(message.vehicleId, gpsPoint);

    // Add to trail
    const trail = this.vehicleTrails.get(message.vehicleId) || [];
    trail.push(gpsPoint);
    
    // Keep only last N points
    if (trail.length > this.maxTrailLength) {
      trail.shift();
    }
    this.vehicleTrails.set(message.vehicleId, trail);

    // Update vehicle as online
    const status = this.vehicleStatuses.get(message.vehicleId);
    if (status) {
      status.isOnline = true;
      status.lastSeen = message.timestamp;
    } else {
      this.vehicleStatuses.set(message.vehicleId, {
        vehicleId: message.vehicleId,
        isOnline: true,
        lastSeen: message.timestamp,
        connectionType: 'server', // Default until we get connection quality
        quality: {
          latency: 0,
          signalStrength: 3,
          bandwidth: 0,
          packetLoss: 0
        }
      });
    }

    this.emit('gps-update', gpsPoint);
    this.emit(`vehicle-gps-${message.vehicleId}`, gpsPoint);
  }

  // Chat handling methods
  private handleChatMessage(message: ChatMessage): void {
    const conversationId = message.conversationId;
    
    // Update conversation
    let conversation = this.conversations.get(conversationId);
    if (!conversation) {
      conversation = {
        conversationId,
        participants: [message.from, message.to],
        lastMessage: message,
        unreadCount: 1
      };
      this.conversations.set(conversationId, conversation);
    } else {
      conversation.lastMessage = message;
      conversation.unreadCount++;
    }

    // Add to chat history
    const history = this.chatHistory.get(conversationId) || [];
    history.push(message);
    this.chatHistory.set(conversationId, history);

    this.emit('chat-message', message);
    this.emit(`chat-${conversationId}`, message);
  }

  // Yes/No question handling
  private handleYesNoQuestion(message: YesNoQuestionMessage): void {
    this.pendingQuestions.set(message.questionId, message);
    this.emit('yesno-question', message);
    this.emit(`question-${message.to}`, message);
  }

  private handleYesNoAnswer(message: YesNoAnswerMessage): void {
    this.pendingQuestions.delete(message.questionId);
    this.emit('yesno-answer', message);
  }

  // Screenshot handling
  private handleScreenshot(message: ScreenshotMessage): void {
    this.emit('screenshot', message);
    this.emit(`screenshot-${message.to}`, message);
  }

  // Vehicle connection handling
  private handleVehicleConnection(message: VehicleConnectedMessage | VehicleDisconnectedMessage): void {
    const vehicleId = message.vehicleId;
    const isConnected = message.type === 'VEHICLE_CONNECTED';

    let status = this.vehicleStatuses.get(vehicleId);
    if (!status) {
      status = {
        vehicleId,
        isOnline: isConnected,
        lastSeen: message.timestamp,
        connectionType: 'server',
        quality: {
          latency: 0,
          signalStrength: 3,
          bandwidth: 0,
          packetLoss: 0
        }
      };
    } else {
      status.isOnline = isConnected;
      status.lastSeen = message.timestamp;
    }

    this.vehicleStatuses.set(vehicleId, status);
    this.emit('vehicle-connection', { vehicleId, isConnected, status });
  }

  // Connection quality handling
  private handleConnectionQuality(message: ConnectionQualityMessage): void {
    const status = this.vehicleStatuses.get(message.from);
    if (status) {
      status.connectionType = message.connectionType;
      status.quality = {
        latency: message.latency,
        signalStrength: message.quality,
        bandwidth: message.bandwidth,
        packetLoss: message.packetLoss
      };
    }

    this.emit('connection-quality', message);
    this.emit(`quality-${message.from}`, message);
  }

  // Stream control handling
  private handleStreamControl(message: StreamStartMessage | StreamStopMessage): void {
    this.emit('stream-control', message);
    this.emit(`stream-${message.vehicleId}`, message);
  }

  // Public API methods

  // Send chat message
  sendChatMessage(to: string, message: string, conversationId?: string): void {
    const chatMessage: ChatMessage = {
      type: 'CHAT_MESSAGE',
      from: 'current-user', // Replace with actual user ID
      to,
      message,
      conversationId: conversationId || `${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString()
    };

    this.wsService.send(chatMessage);
    this.handleChatMessage(chatMessage); // Add to local history
  }

  // Send Yes/No question
  sendYesNoQuestion(to: string, question: string): string {
    const questionId = `q-${Date.now()}-${Math.random()}`;
    const questionMessage: YesNoQuestionMessage = {
      type: 'YESNO_QUESTION',
      from: 'current-user',
      to,
      question,
      questionId,
      timestamp: new Date().toISOString()
    };

    this.wsService.send(questionMessage);
    return questionId;
  }

  // Request GPS history
  requestGPSHistory(vehicleId: string, fromTime?: Date, toTime?: Date): void {
    this.wsService.send({
      type: 'GPS_HISTORY_REQUEST',
      vehicleId,
      fromTime: fromTime?.toISOString(),
      toTime: toTime?.toISOString(),
      timestamp: new Date().toISOString()
    });
  }

  // Control vehicle stream
  startStream(vehicleId: string, streamType: 'cabin' | 'external', quality: '480p' | '720p' | '1080p' = '720p'): void {
    this.wsService.send({
      type: 'STREAM_START',
      vehicleId,
      streamType,
      quality,
      timestamp: new Date().toISOString()
    });
  }

  stopStream(vehicleId: string, streamType: 'cabin' | 'external'): void {
    this.wsService.send({
      type: 'STREAM_STOP',
      vehicleId,
      streamType,
      timestamp: new Date().toISOString()
    });
  }

  // Event subscription methods
  on(event: string, callback: Function): () => void {
    if (!this.messageHandlers.has(event)) {
      this.messageHandlers.set(event, new Set());
    }
    
    this.messageHandlers.get(event)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      const handlers = this.messageHandlers.get(event);
      if (handlers) {
        handlers.delete(callback);
        if (handlers.size === 0) {
          this.messageHandlers.delete(event);
        }
      }
    };
  }

  private emit(event: string, data: any): void {
    const handlers = this.messageHandlers.get(event);
    if (handlers) {
      handlers.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[WebSocket] Error in ${event} handler:`, error);
        }
      });
    }
  }

  // Heartbeat system
  private setupHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.wsService.isConnected()) {
        this.wsService.send({
          type: 'HEARTBEAT',
          from: 'current-user',
          timestamp: new Date().toISOString()
        });
      }
    }, this.heartbeatInterval);
  }

  // Getter methods for data access
  getCurrentPosition(vehicleId: string): GPSPoint | null {
    return this.vehiclePositions.get(vehicleId) || null;
  }

  getVehicleTrail(vehicleId: string): GPSPoint[] {
    return this.vehicleTrails.get(vehicleId) || [];
  }

  getVehicleStatus(vehicleId: string): VehicleStatus | null {
    return this.vehicleStatuses.get(vehicleId) || null;
  }

  getActiveVehicles(): string[] {
    return Array.from(this.vehicleStatuses.keys()).filter(id => 
      this.vehicleStatuses.get(id)?.isOnline
    );
  }

  getChatHistory(conversationId: string): ChatMessage[] {
    return this.chatHistory.get(conversationId) || [];
  }

  getConversations(): ChatConversation[] {
    return Array.from(this.conversations.values());
  }

  getPendingQuestions(): YesNoQuestionMessage[] {
    return Array.from(this.pendingQuestions.values());
  }

  // Connection management
  disconnect(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }
    this.wsService.disconnect();
    this.messageHandlers.clear();
    this.vehiclePositions.clear();
    this.vehicleTrails.clear();
    this.vehicleStatuses.clear();
    this.conversations.clear();
    this.chatHistory.clear();
    this.pendingQuestions.clear();
  }

  isConnected(): boolean {
    return this.wsService.isConnected();
  }

  getConnectionState(): string {
    return this.wsService.getState();
  }
}

// Singleton instance
export const webSocketWrapper = new WebSocketWrapperService();

// Export types
export type { GPSPoint, VehicleStatus, ChatConversation };

// React hook for easy integration
export const useWebSocketWrapper = () => {
  const [isConnected, setIsConnected] = React.useState(false);
  const [activeVehicles, setActiveVehicles] = React.useState<string[]>([]);
  const [connectionState, setConnectionState] = React.useState<string>('CLOSED');

  React.useEffect(() => {
    const unsubscribeConnected = webSocketWrapper.on('connected', () => {
      setIsConnected(true);
      setConnectionState('OPEN');
    });

    const unsubscribeDisconnected = webSocketWrapper.on('disconnected', () => {
      setIsConnected(false);
      setConnectionState('CLOSED');
    });

    const unsubscribeGpsUpdate = webSocketWrapper.on('gps-update', () => {
      setActiveVehicles(webSocketWrapper.getActiveVehicles());
    });

    const unsubscribeVehicleConnection = webSocketWrapper.on('vehicle-connection', () => {
      setActiveVehicles(webSocketWrapper.getActiveVehicles());
    });

    // Initialize connection if not already connected
    if (!webSocketWrapper.isConnected()) {
      webSocketWrapper.connect().catch(console.error);
    }

    return () => {
      unsubscribeConnected();
      unsubscribeDisconnected();
      unsubscribeGpsUpdate();
      unsubscribeVehicleConnection();
    };
  }, []);

  return {
    isConnected,
    activeVehicles,
    connectionState,
    service: webSocketWrapper
  };
};