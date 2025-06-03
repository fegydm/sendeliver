// File: front/src/services/websocket.service.ts
// Last change: Optimized WebSocketService with better TypeScript support and performance

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

        console.log(`[WebSocket] Connecting to ${this.url}...`);
        this.ws = new WebSocket(this.url);

        const onOpen = () => {
          console.log('[WebSocket] Connected successfully');
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
    console.log(`[WebSocket] Connection closed (${event.code}): ${event.reason}`);
    this.notify('close', event);

    // Only attempt reconnect if not manually disconnected and not a clean close
    if (!this.isManualDisconnect && !event.wasClean && event.code !== 1000) {
      this.attemptReconnect();
    }
  };

  private handleMessage = (event: MessageEvent): void => {
    try {
      const message = JSON.parse(event.data);
      this.notify('message', message);
    } catch (error) {
      console.error('[WebSocket] Error parsing message:', error);
      console.log('[WebSocket] Raw message:', event.data);
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
    
    console.log(`[WebSocket] Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);

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
    console.log('[WebSocket] Manual disconnect requested');
    this.isManualDisconnect = true;
    this.clearReconnectTimer();
    this.cleanup();
  }

  private cleanup(): void {
    if (this.ws) {
      // Remove event listeners to prevent memory leaks
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

  // Graceful shutdown
  destroy(): void {
    console.log('[WebSocket] Destroying service');
    this.disconnect();
    this.subscribers.clear();
  }
}

export default WebSocketService;

// Export types for external use
export type { WebSocketEventMap, WebSocketEventType, WebSocketEventHandler };