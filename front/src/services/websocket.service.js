// ./front/src/services/websocket.js

class WebSocketService {
  constructor() {
    this.messageHandlers = new Map();
    this.connect();
  }

  connect() {
    this.ws = new WebSocket('wss://sendeliver.onrender.com');

    this.ws.onopen = () => {
      console.log('Connected to WebSocket');
      
      // Identifikácia na základe domény
      const domain = window.location.hostname;
      if (domain.includes('carriers') || domain.includes('hauler')) {
        this.initHauler();
      } else if (domain.includes('clients') || domain.includes('sender')) {
        this.initSender();
      }
    };

    this.ws.onclose = (event) => {
      console.log('Disconnected from WebSocket', event);
      setTimeout(() => this.connect(), 3000); // reconnect after 3 seconds
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket encountered an error:', error);
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const handler = this.messageHandlers.get(data.type);
        if (handler) handler(data);
      } catch (e) {
        console.error('Error parsing message data:', e);
      }
    };
  }

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

  send(type, data) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, ...data }));
    } else {
      console.warn('WebSocket is not open. Message not sent:', type, data);
    }
  }

  onMessage(type, handler) {
    this.messageHandlers.set(type, handler);
  }

  close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

const wsService = new WebSocketService();
export default wsService;
