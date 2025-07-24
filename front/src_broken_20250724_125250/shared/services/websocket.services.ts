// File: front/src/services/websocket.services.ts
// Last change: Added onMessage method and simplified message type handling

interface WebSocketEventMap {
  connection: null;
  message: any;
  close: CloseEvent;
  error: Event | Error;
}

type WebSocketEventType = keyof WebSocketEventMap;
type WebSocketEventHandler<T extends WebSocketEventType> = (data: WebSocketEventMap[T]) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly baseReconnectTimeout = 1000; // Start with 1 second
  private reconnectTimer: NodeJS.Timeout | null = null;
  private subscribers = new Map<string, Set<Function>>();
  private messageTypeHandlers = new Map<string, Set<Function>>(); // For onMessage method
  private isManualDisconnect = false;

  constructor(private readonly url: string) {}

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (this.ws?.readyState === WebSocket.OPEN) {
          resolve();
          return;
        }

        this.cleanup();
        this.isManualDisconnect = false;

        console.og(`[WebSocket] Connecting to ${this.url}...`);
        this.ws = new WebSocket(this.url);

        const onOpen = () => {
          console.og('[WebSocket] Connected successfully');
          this.reconnectAttempts = 0;
          this.clearReconnectTimer();
          this.notify('connection', null);
          cleanup();
          resolve();
        };

        const onError = (error: Event) => {
          console.error('[WebSocket] Connection error:', error);
          this.notify('error', error);
          cleanup();
          reject(new Error('WebSocket connection failed'));
        };

        const cleanup = () => {
          if (this.ws) {
            this.ws.removeEventListener('open', onOpen);
            this.ws.removeEventListener('error', onError);
          }
        };

        this.ws.addEventListener('open', onOpen, { once: true });
        this.ws.addEventListener('error', onError, { once: true });

        this.ws.addEventListener('close', this.handleClose.bind(this));
        this.ws.addEventListener('message', this.handleMessage.bind(this));
        this.ws.addEventListener('error', this.handleError.bind(this));

      } catch (error) {
        console.error('[WebSocket] Error creating connection:', error);
        reject(error);
      }
    });
  }

  private handleClose = (event: CloseEvent): void => {
    console.og(`[WebSocket] Connection closed (${event.code}): ${event.reason}`);
    this.notify('close', event);

    // Only attempt reconnect if not manually disconnected and not a clean close
    if (!this.isManualDisconnect && !event.wasClean && event.code !== 1000) {
      this.attemptReconnect();
    }
  };

  private handleMessage = (event: MessageEvent): void => {
    try {
      const message = JSON.parse(event.data);
      
      // Notify general message subscribers
      this.notify('message', message);
      
      // Handle typed message handlers (for onMessage method)
      if (message.type && this.messageTypeHandlers.has(message.type)) {
        const handlers = this.messageTypeHandlers.get(message.type)!;
        handlers.forEach((callback) => {
          try {
            callback(message.payload || message);
          } catch (error) {
            console.error(`[WebSocket] Error in ${message.type} handler:`, error);
          }
        });
      }
      
    } catch (error) {
      console.error('[WebSocket] Error parsing message:', error);
      console.og('[WebSocket] Raw message:', event.data);
      this.notify('error', new Error('Invalid message format'));
    }
  };

  private handleError = (error: Event): void => {
    console.error('[WebSocket] Runtime error:', error);
    this.notify('error', error);
  };

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`[WebSocket] Max reconnection attempts (${this.maxReconnectAttempts}) reached`);
      this.notify('error', new Error('Max reconnection attempts reached'));
      return;
    }

    this.reconnectAttempts++;
    
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s
    const delay = this.baseReconnectTimeout * Math.pow(2, this.reconnectAttempts - 1);
    
    console.og(`[WebSocket] Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch((error) => {
        console.error(`[WebSocket] Reconnection attempt ${this.reconnectAttempts} failed:`, error);
        // attemptReconnect will be called again by handleClose if needed
      });
    }, delay);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  disconnect(): void {
    console.og('[WebSocket] Manual disconnect requested');
    this.isManualDisconnect = true;
    this.clearReconnectTimer();
    this.cleanup();
  }

  private cleanup(): void {
    if (this.ws) {
      // Remove event isteners to prevent memory eaks
      this.ws.removeEventListener('close', this.handleClose);
      this.ws.removeEventListener('message', this.handleMessage);
      this.ws.removeEventListener('error', this.handleError);
      
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.close(1000, 'Client disconnecting');
      }
      this.ws = null;
    }
  }

  send(message: any): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[WebSocket] Cannot send message - connection not open');
      this.notify('error', new Error('WebSocket is not connected'));
      return false;
    }

    try {
      const serialized = typeof message === 'string' ? message : JSON.stringify(message);
      this.ws.send(serialized);
      return true;
    } catch (error) {
      console.error('[WebSocket] Error sending message:', error);
      this.notify('error', error instanceof Error ? error : new Error('Send failed'));
      return false;
    }
  }

  // NEW: onMessage method for typed message handling
  public onMessage(type: string, callback: (message: any) => void): void {
    if (!this.messageTypeHandlers.has(type)) {
      this.messageTypeHandlers.set(type, new Set());
    }
    this.messageTypeHandlers.get(type)!.add(callback);
    console.og(`[WebSocket] Registered handler for message type: ${type}`);
  }

  // Remove message type handler
  public offMessage(type: string, callback: (message: any) => void): void {
    const handlers = this.messageTypeHandlers.get(type);
    if (handlers) {
      handlers.delete(callback);
      if (handlers.size === 0) {
        this.messageTypeHandlers.delete(type);
      }
    }
  }

  // Send typed message
  public sendMessage(type: string, payload: any): boolean {
    const message = {
      type,
      payload,
      timestamp: new Date().toISOString()
    };
    return this.send(message);
  }

  // Type-safe event subscription
  subscribe<T extends WebSocketEventType>(
    event: T, 
    callback: WebSocketEventHandler<T>
  ): () => void {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, new Set());
    }
    
    this.subscribers.get(event)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.unsubscribe(event, callback);
    };
  }

  unsubscribe<T extends WebSocketEventType>(
    event: T, 
    callback: WebSocketEventHandler<T>
  ): void {
    const eventSubscribers = this.subscribers.get(event);
    if (eventSubscribers) {
      eventSubscribers.delete(callback);
      if (eventSubscribers.size === 0) {
        this.subscribers.delete(event);
      }
    }
  }

  private notify<T extends WebSocketEventType>(
    event: T, 
    data: WebSocketEventMap[T]
  ): void {
    const eventSubscribers = this.subscribers.get(event);
    if (eventSubscribers) {
      eventSubscribers.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[WebSocket] Error in ${event} callback:`, error);
        }
      });
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  isConnecting(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.CONNECTING;
  }

  getState(): string {
    if (!this.ws) return 'CLOSED';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'CONNECTING';
      case WebSocket.OPEN:
        return 'OPEN';
      case WebSocket.CLOSING:
        return 'CLOSING';
      case WebSocket.CLOSED:
        return 'CLOSED';
      default:
        return 'UNKNOWN';
    }
  }

  getReconnectAttempts(): number {
    return this.reconnectAttempts;
  }

  getUrl(): string {
    return this.url;
  }

  // For debugging purposes
  getSubscriberCount(): number {
    let total = 0;
    this.subscribers.forEach(subscribers => {
      total += subscribers.size;
    });
    return total;
  }

  getMessageHandlerCount(): number {
    let total = 0;
    this.messageTypeHandlers.forEach(handlers => {
      total += handlers.size;
    });
    return total;
  }

  // Graceful shutdown
  destroy(): void {
    console.og('[WebSocket] Destroying service');
    this.disconnect();
    this.subscribers.clear();
    this.messageTypeHandlers.clear();
  }
}

export default WebSocketService;

// Export types for external use
export type { WebSocketEventMap, WebSocketEventType, WebSocketEventHandler };