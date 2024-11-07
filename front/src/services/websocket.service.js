// ./front/src/services/websocket.service.js

class WebSocketService {
  constructor() {
    this.messageHandlers = new Map();
    this.intentionalClose = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.connect();
  }

  connect() {
    try {
      // Upravená URL logika
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = import.meta.env.PROD 
        ? `${wsProtocol}//${window.location.host}`
        : 'ws://localhost:5000';

      console.log('Attempting to connect to:', wsUrl);
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('Connected to WebSocket');
        this.reconnectAttempts = 0; // Reset počítadla pokusov
        this.startPingInterval();
        
        // Identifikácia podľa URL path namiesto hostname
        const path = window.location.pathname;
        if (path.includes('/hauler') || path.includes('/carriers')) {
          this.initHauler();
        } else if (path.includes('/sender') || path.includes('/clients')) {
          this.initSender();
        }
      };

      this.ws.onclose = (event) => {
        this.clearPingInterval();
        console.log('WebSocket closed with code:', event.code);
        
        if (!this.intentionalClose && this.reconnectAttempts < this.maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
          console.log(`Reconnecting in ${delay}ms... (attempt ${this.reconnectAttempts + 1})`);
          setTimeout(() => {
            this.reconnectAttempts++;
            this.connect();
          }, delay);
        } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('Max reconnection attempts reached');
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'ping') {
            this.ws.send(JSON.stringify({ 
              type: 'pong',
              timestamp: Date.now()
            }));
            return;
          }
          const handler = this.messageHandlers.get(data.type);
          if (handler) {
            handler(data);
          } else {
            console.log('Unhandled message type:', data.type);
          }
        } catch (e) {
          console.error('Error processing message:', e, 'Raw data:', event.data);
        }
      };
    } catch (error) {
      console.error('Error in connect:', error);
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(() => this.connect(), 3000);
      }
    }
  }

  startPingInterval() {
    this.clearPingInterval(); // Vyčistí existujúci interval ak existuje
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send('ping', { timestamp: Date.now() });
      } else {
        this.clearPingInterval();
      }
    }, 30000);
  }

  clearPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  send(type, data) {
    try {
      if (this.ws?.readyState === WebSocket.OPEN) {
        const message = JSON.stringify({
          type,
          ...data,
          timestamp: Date.now()
        });
        this.ws.send(message);
      } else {
        console.warn(`WebSocket not ready (state: ${this.ws?.readyState}). Message queued:`, type);
        setTimeout(() => this.send(type, data), 1000);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  // Ostatné metódy zostávajú rovnaké
  initHauler() {
    const haulerId = localStorage.getItem('haulerId') || `hauler_${Date.now()}`;
    localStorage.setItem('haulerId', haulerId);
    this.send('hauler_init', { haulerId });
  }

  initSender() {
    const clientId = localStorage.getItem('clientId') || `client_${Date.now()}`;
    localStorage.setItem('clientId', clientId);
    this.send('client_init', { clientId });
  }

  sendDeliveryRequest(requestData) {
    this.send('delivery_request', {
      requestId: `req_${Date.now()}`,
      clientId: localStorage.getItem('clientId'),
      ...requestData
    });
  }

  sendDeliveryOffer(requestId, offerData) {
    this.send('delivery_offer', {
      offerId: `offer_${Date.now()}`,
      haulerId: localStorage.getItem('haulerId'),
      requestId,
      ...offerData
    });
  }

  onMessage(type, handler) {
    this.messageHandlers.set(type, handler);
  }

  close() {
    this.intentionalClose = true;
    this.clearPingInterval();
    if (this.ws) {
      this.ws.close();
    }
  }
}

const wsService = new WebSocketService();
export default wsService;