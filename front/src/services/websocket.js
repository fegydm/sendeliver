// ./front/src/services/websocket.js
class WebSocketService {
  constructor() {
    this.connect();
    this.messageHandlers = new Map();
  }

  connect() {
    this.ws = new WebSocket(process.env.REACT_APP_WS_URL);
    
    this.ws.onopen = () => {
      console.log('Connected to WebSocket');
    };

    this.ws.onclose = () => {
      console.log('Disconnected from WebSocket');
      setTimeout(() => this.connect(), 1000);
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const handler = this.messageHandlers.get(data.type);
      if (handler) handler(data);
    };
  }

  send(type, data) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, data }));
    }
  }

  onMessage(type, handler) {
    this.messageHandlers.set(type, handler);
  }
}

export default new WebSocketService();
