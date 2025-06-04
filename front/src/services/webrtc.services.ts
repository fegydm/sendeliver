// File: front/src/services/webrtc/WebRTCManager.ts
// Last change: Initial implementation with video call and screen share functionality

import  WebSocketService  from './websocket.services';
import { 
  WebRTCSignalingMessage, 
  WebRTCConnectionState, 
  WebRTCStreamType,
  VideoCallState,
  ScreenShareState 
} from '../types/webrtc.types';

export interface WebRTCConfig {
  iceServers: RTCIceServer[];
  maxRetries: number;
  connectionTimeout: number;
  enableVideo: boolean;
  enableAudio: boolean;
  enableScreenShare: boolean;
}

export interface WebRTCCallbacks {
  onConnectionStateChange: (state: WebRTCConnectionState) => void;
  onRemoteStream: (stream: MediaStream, type: WebRTCStreamType) => void;
  onStreamEnded: (type: WebRTCStreamType) => void;
  onError: (error: Error) => void;
  onDataChannelMessage: (message: any) => void;
}

export class WebRTCManager {
  private config: WebRTCConfig;
  private callbacks: WebRTCCallbacks;
  private wsService: WebSocketService;
  
  // WebRTC Core
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private localStream: MediaStream | null = null;
  private screenStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  
  // State Management
  private connectionState: WebRTCConnectionState = 'disconnected';
  private isInitiator: boolean = false;
  private retryCount: number = 0;
  private connectionTimer: NodeJS.Timeout | null = null;
  
  // Connection Info
  private remoteUserId: string | null = null;
  private callId: string | null = null;

  constructor(
    config: WebRTCConfig,
    callbacks: WebRTCCallbacks,
    wsService: WebSocketService
  ) {
    this.config = {
      ...config,
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        ...(config.iceServers || [])
      ],
      maxRetries: 3,
      connectionTimeout: 30000,
      enableVideo: true,
      enableAudio: true,
      enableScreenShare: true
    };
    
    this.callbacks = callbacks;
    this.wsService = wsService;
    
    this.setupWebSocketHandlers();
  }

  // Setup WebSocket message handlers for signaling
  private setupWebSocketHandlers(): void {
    this.wsService.onMessage('webrtc-signaling', (message: WebRTCSignalingMessage) => {
      this.handleSignalingMessage(message);
    });
    
    this.wsService.onMessage('call-request', (data) => {
      this.handleIncomingCall(data);
    });
    
    this.wsService.onMessage('call-ended', (data) => {
      this.handleCallEnded(data);
    });
  }

  // Initialize Video Call
  public async initiateVideoCall(remoteUserId: string): Promise<void> {
    try {
      console.log(`[WebRTC] Initiating video call to user: ${remoteUserId}`);
      
      this.remoteUserId = remoteUserId;
      this.callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.isInitiator = true;
      
      // Request permissions and get user media
      await this.setupLocalStream();
      
      // Create peer connection
      await this.createPeerConnection();
      
      // Add local stream to connection
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          this.peerConnection?.addTrack(track, this.localStream!);
        });
      }
      
      // Setup data channel for text communication
      this.setupDataChannel();
      
      // Send call request via WebSocket
      this.wsService.send({
        type: 'call-request',
        data: {
          callId: this.callId,
          targetUserId: remoteUserId,
          callType: 'video',
          timestamp: Date.now()
        }
      });
      
      this.updateConnectionState('connecting');
      this.startConnectionTimer();
      
    } catch (error) {
      console.error('[WebRTC] Failed to initiate video call:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.callbacks.onError(new Error(`Failed to initiate call: ${errorMessage}`));
      this.cleanup();
    }
  }

  // Accept incoming call
  public async acceptCall(callId: string, fromUserId: string): Promise<void> {
    try {
      console.log(`[WebRTC] Accepting call ${callId} from ${fromUserId}`);
      
      this.callId = callId;
      this.remoteUserId = fromUserId;
      this.isInitiator = false;
      
      // Setup local stream
      await this.setupLocalStream();
      
      // Create peer connection
      await this.createPeerConnection();
      
      // Add local stream
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          this.peerConnection?.addTrack(track, this.localStream!);
        });
      }
      
      // Setup data channel handler (receiver side)
      this.setupDataChannelReceiver();
      
      // Send acceptance via WebSocket
      this.wsService.send({
        type: 'call-accepted',
        data: {
          callId,
          timestamp: Date.now()
        }
      });
      
      this.updateConnectionState('connecting');
      
    } catch (error) {
      console.error('[WebRTC] Failed to accept call:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.callbacks.onError(new Error(`Failed to accept call: ${errorMessage}`));
      this.rejectCall(callId);
    }
  }

  // Reject incoming call
  public rejectCall(callId: string): void {
    console.log(`[WebRTC] Rejecting call: ${callId}`);
    
    this.wsService.send({
      type: 'call-rejected',
      data: {
        callId,
        timestamp: Date.now()
      }
    });
    
    this.cleanup();
  }

  // End current call
  public endCall(): void {
    console.log('[WebRTC] Ending call');
    
    if (this.callId) {
      this.wsService.send({
        type: 'call-ended',
        data: {
          callId: this.callId,
          timestamp: Date.now()
        }
      });
    }
    
    this.cleanup();
  }

  // Start screen sharing
  public async startScreenShare(): Promise<void> {
    try {
      console.log('[WebRTC] Starting screen share');
      
      if (!this.config.enableScreenShare) {
        throw new Error('Screen sharing is disabled');
      }
      
      if (!this.peerConnection) {
        throw new Error('No active connection for screen sharing');
      }
      
      // Get screen capture stream
      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      
      // Replace video track with screen share
      const videoSender = this.peerConnection.getSenders().find(
        sender => sender.track?.kind === 'video'
      );
      
      if (videoSender && this.screenStream.getVideoTracks()[0]) {
        await videoSender.replaceTrack(this.screenStream.getVideoTracks()[0]);
      }
      
      // Handle screen share end
      this.screenStream.getVideoTracks()[0].onended = () => {
        this.stopScreenShare();
      };
      
      // Notify remote peer about screen share
      this.sendDataChannelMessage({
        type: 'screen-share-started',
        timestamp: Date.now()
      });
      
      console.log('[WebRTC] Screen share started successfully');
      
    } catch (error) {
      console.error('[WebRTC] Failed to start screen share:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.callbacks.onError(new Error(`Screen share failed: ${errorMessage}`));
    }
  }

  // Stop screen sharing
  public async stopScreenShare(): Promise<void> {
    try {
      console.log('[WebRTC] Stopping screen share');
      
      if (!this.peerConnection || !this.screenStream) {
        return;
      }
      
      // Stop screen stream
      this.screenStream.getTracks().forEach(track => track.stop());
      this.screenStream = null;
      
      // Restore original camera stream
      if (this.localStream) {
        const videoSender = this.peerConnection.getSenders().find(
          sender => sender.track?.kind === 'video'
        );
        
        const videoTrack = this.localStream.getVideoTracks()[0];
        if (videoSender && videoTrack) {
          await videoSender.replaceTrack(videoTrack);
        }
      }
      
      // Notify remote peer
      this.sendDataChannelMessage({
        type: 'screen-share-stopped',
        timestamp: Date.now()
      });
      
      this.callbacks.onStreamEnded('screen');
      
    } catch (error) {
      console.error('[WebRTC] Failed to stop screen share:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.callbacks.onError(new Error(`Failed to stop screen share: ${errorMessage}`));
    }
  }

  // Toggle audio
  public toggleAudio(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });
      
      this.sendDataChannelMessage({
        type: 'audio-toggle',
        enabled,
        timestamp: Date.now()
      });
    }
  }

  // Toggle video
  public toggleVideo(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
      });
      
      this.sendDataChannelMessage({
        type: 'video-toggle',
        enabled,
        timestamp: Date.now()
      });
    }
  }

  // Send message via data channel
  public sendDataChannelMessage(message: any): void {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      this.dataChannel.send(JSON.stringify(message));
    }
  }

  // Get current connection state
  public getConnectionState(): WebRTCConnectionState {
    return this.connectionState;
  }

  // Get local stream
  public getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  // Get remote stream
  public getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  // Check if screen sharing is active
  public isScreenSharing(): boolean {
    return this.screenStream !== null;
  }

  // Private Methods

  private async setupLocalStream(): Promise<void> {
    try {
      console.log('[WebRTC] Setting up local media stream');
      
      const constraints: MediaStreamConstraints = {
        video: this.config.enableVideo ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        } : false,
        audio: this.config.enableAudio ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } : false
      };
      
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('[WebRTC] Local stream acquired successfully');
      
    } catch (error) {
      console.error('[WebRTC] Failed to get user media:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to access camera/microphone: ${errorMessage}`);
    }
  }

  private async createPeerConnection(): Promise<void> {
    console.log('[WebRTC] Creating peer connection');
    
    this.peerConnection = new RTCPeerConnection({
      iceServers: this.config.iceServers
    });
    
    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.wsService.send({
          type: 'webrtc-signaling',
          data: {
            type: 'ice-candidate',
            candidate: event.candidate,
            callId: this.callId,
            targetUserId: this.remoteUserId
          }
        });
      }
    };
    
    // Handle remote stream
    this.peerConnection.ontrack = (event) => {
      console.log('[WebRTC] Received remote track');
      this.remoteStream = event.streams[0];
      this.callbacks.onRemoteStream(this.remoteStream, 'video');
    };
    
    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState;
      console.log(`[WebRTC] Connection state changed to: ${state}`);
      
      switch (state) {
        case 'connected':
          this.updateConnectionState('connected');
          this.clearConnectionTimer();
          this.retryCount = 0;
          break;
        case 'disconnected':
          this.updateConnectionState('disconnected');
          this.handleConnectionFailure();
          break;
        case 'failed':
          this.updateConnectionState('failed');
          this.handleConnectionFailure();
          break;
        case 'closed':
          this.updateConnectionState('disconnected');
          break;
      }
    };
    
    // Handle data channel from remote peer
    this.peerConnection.ondatachannel = (event) => {
      const channel = event.channel;
      this.setupDataChannelHandlers(channel);
    };
  }

  private setupDataChannel(): void {
    if (!this.peerConnection) return;
    
    console.log('[WebRTC] Setting up data channel');
    
    this.dataChannel = this.peerConnection.createDataChannel('messages', {
      ordered: true
    });
    
    this.setupDataChannelHandlers(this.dataChannel);
  }

  private setupDataChannelReceiver(): void {
    // Data channel will be received via ondatachannel event
    console.log('[WebRTC] Waiting for data channel from initiator');
  }

  private setupDataChannelHandlers(channel: RTCDataChannel): void {
    channel.onopen = () => {
      console.log('[WebRTC] Data channel opened');
    };
    
    channel.onclose = () => {
      console.log('[WebRTC] Data channel closed');
    };
    
    channel.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('[WebRTC] Data channel message received:', message);
        this.callbacks.onDataChannelMessage(message);
      } catch (error) {
        console.error('[WebRTC] Failed to parse data channel message:', error);
      }
    };
    
    channel.onerror = (error) => {
      console.error('[WebRTC] Data channel error:', error);
    };
    
    this.dataChannel = channel;
  }

  private async handleSignalingMessage(message: WebRTCSignalingMessage): Promise<void> {
    try {
      console.log('[WebRTC] Handling signaling message:', message.type);
      
      if (!this.peerConnection) {
        console.warn('[WebRTC] Received signaling message but no peer connection exists');
        return;
      }
      
      switch (message.type) {
        case 'offer':
          await this.handleOffer(message.offer!);
          break;
        case 'answer':
          await this.handleAnswer(message.answer!);
          break;
        case 'ice-candidate':
          await this.handleIceCandidate(message.candidate!);
          break;
        default:
          console.warn('[WebRTC] Unknown signaling message type:', message.type);
      }
    } catch (error) {
      console.error('[WebRTC] Error handling signaling message:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.callbacks.onError(new Error(`Signaling error: ${errorMessage}`));
    }
  }

  private async handleOffer(offer: RTCSessionDescriptionInit): Promise<void> {
    console.log('[WebRTC] Handling offer');
    
    await this.peerConnection!.setRemoteDescription(offer);
    
    const answer = await this.peerConnection!.createAnswer();
    await this.peerConnection!.setLocalDescription(answer);
    
    this.wsService.send({
      type: 'webrtc-signaling',
      data: {
        type: 'answer',
        answer,
        callId: this.callId,
        targetUserId: this.remoteUserId
      }
    });
  }

  private async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    console.log('[WebRTC] Handling answer');
    await this.peerConnection!.setRemoteDescription(answer);
  }

  private async handleIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    console.log('[WebRTC] Handling ICE candidate');
    await this.peerConnection!.addIceCandidate(candidate);
  }

  private handleIncomingCall(data: any): void {
    console.log('[WebRTC] Incoming call received:', data);
    
    // This should trigger UI to show incoming call dialog
    // The actual acceptance/rejection is handled by acceptCall/rejectCall methods
    this.callbacks.onConnectionStateChange('incoming-call');
  }

  private handleCallEnded(data: any): void {
    console.log('[WebRTC] Call ended by remote peer:', data);
    this.cleanup();
  }

  private async handleConnectionFailure(): Promise<void> {
    if (this.retryCount < this.config.maxRetries) {
      this.retryCount++;
      console.log(`[WebRTC] Connection failed, retrying... (${this.retryCount}/${this.config.maxRetries})`);
      
      setTimeout(() => {
        this.retryConnection();
      }, 2000 * this.retryCount); // Exponential backoff
    } else {
      console.error('[WebRTC] Max retries reached, giving up');
      this.callbacks.onError(new Error('Connection failed after maximum retries'));
      this.cleanup();
    }
  }

  private async retryConnection(): Promise<void> {
    try {
      this.cleanup(false); // Don't reset retry count
      
      if (this.isInitiator && this.remoteUserId) {
        await this.initiateVideoCall(this.remoteUserId);
      }
    } catch (error) {
      console.error('[WebRTC] Retry failed:', error);
      this.handleConnectionFailure();
    }
  }

  private startConnectionTimer(): void {
    this.clearConnectionTimer();
    
    this.connectionTimer = setTimeout(() => {
      console.warn('[WebRTC] Connection timeout');
      this.callbacks.onError(new Error('Connection timeout'));
      this.cleanup();
    }, this.config.connectionTimeout);
  }

  private clearConnectionTimer(): void {
    if (this.connectionTimer) {
      clearTimeout(this.connectionTimer);
      this.connectionTimer = null;
    }
  }

  private updateConnectionState(state: WebRTCConnectionState): void {
    if (this.connectionState !== state) {
      this.connectionState = state;
      this.callbacks.onConnectionStateChange(state);
    }
  }

  private cleanup(resetRetries: boolean = true): void {
    console.log('[WebRTC] Cleaning up connection');
    
    // Stop all streams
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop());
      this.screenStream = null;
    }
    
    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    
    // Close data channel
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }
    
    // Clear timers
    this.clearConnectionTimer();
    
    // Reset state
    this.updateConnectionState('disconnected');
    this.remoteUserId = null;
    this.callId = null;
    this.isInitiator = false;
    this.remoteStream = null;
    
    if (resetRetries) {
      this.retryCount = 0;
    }
    
    // Notify about stream end
    this.callbacks.onStreamEnded('video');
    if (this.screenStream) {
      this.callbacks.onStreamEnded('screen');
    }
  }

  // Public cleanup method
  public dispose(): void {
    console.log('[WebRTC] Disposing WebRTC manager');
    this.cleanup();
  }
}