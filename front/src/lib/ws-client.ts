// Frontend src/lib/ws-client.ts
export class WebSocketClient {
    private ws: WebSocket | null = null;
    private reconnectTimeout: number = 1000;
    private maxReconnectAttempts: number = 5;
    private reconnectAttempts: number = 0;
    private listeners: Map<string, Set<(data: any) => void>> = new Map();
  
    constructor(private url: string) {}
  
    connect() {
      this.ws = new WebSocket(this.url);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onerror = this.handleError.bind(this);
    }
  
    private handleMessage(event: MessageEvent) {
      try {
        const { type, data } = JSON.parse(event.data);
        const listeners = this.listeners.get(type);
        listeners?.forEach(listener => listener(data));
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    }
  
    private handleClose() {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        setTimeout(() => this.connect(), this.reconnectTimeout);
      }
    }
  
    private handleError(error: Event) {
      console.error('WebSocket error:', error);
    }
  
    subscribe(type: string, callback: (data: any) => void) {
      if (!this.listeners.has(type)) {
        this.listeners.set(type, new Set());
      }
      this.listeners.get(type)?.add(callback);
    }
  
    unsubscribe(type: string, callback: (data: any) => void) {
      this.listeners.get(type)?.delete(callback);
    }
  
    send(type: string, data: any) {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type, data }));
      }
    }
  
    disconnect() {
      this.ws?.close();
      this.ws = null;
      this.listeners.clear();
    }
  }
  
  export default new WebSocketClient(import.meta.env.VITE_WS_URL || 'ws://localhost:5000/ws');