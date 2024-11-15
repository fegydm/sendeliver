// ./front/src/services/websocket.service.mts
class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout = 3000;
  private subscribers: { [key: string]: Function[] } = {};

  constructor(private url: string) {}

  connect() {
    try {
      if (this.ws) {
        this.ws.close();
        this.ws = null;
      }

      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log("WebSocket connected successfully");
        this.reconnectAttempts = 0;
        this.notify("connection", null);
      };

      this.ws.onclose = (event) => {
        console.log("WebSocket closed with code:", event.code);
        this.notify("close", event);
        if (!event.wasClean) {
          this.attemptReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        this.notify("error", error);
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.notify("message", message);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
          this.notify("error", error);
        }
      };
    } catch (error) {
      console.error("Error creating WebSocket connection:", error);
      this.attemptReconnect();
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
      );

      setTimeout(
        () => {
          this.connect();
        },
        this.reconnectTimeout * Math.pow(2, this.reconnectAttempts - 1)
      );
    } else {
      console.error("Max reconnection attempts reached");
      this.notify("error", new Error("Max reconnection attempts reached"));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close(1000, "Client disconnecting");
      this.ws = null;
    }
  }

  send(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error("WebSocket is not connected");
      this.notify("error", new Error("WebSocket is not connected"));
    }
  }

  subscribe(event: string, callback: Function) {
    if (!this.subscribers[event]) {
      this.subscribers[event] = [];
    }
    this.subscribers[event].push(callback);
  }

  unsubscribe(event: string, callback: Function) {
    if (this.subscribers[event]) {
      this.subscribers[event] = this.subscribers[event].filter(
        (cb) => cb !== callback
      );
    }
  }

  private notify(event: string, data: any) {
    if (this.subscribers[event]) {
      this.subscribers[event].forEach((callback) => callback(data));
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  getState(): string {
    if (!this.ws) return "CLOSED";
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return "CONNECTING";
      case WebSocket.OPEN:
        return "OPEN";
      case WebSocket.CLOSING:
        return "CLOSING";
      case WebSocket.CLOSED:
        return "CLOSED";
      default:
        return "UNKNOWN";
    }
  }
}

export default WebSocketService;
