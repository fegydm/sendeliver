// ./front/src/services/websocket.js
class WebSocketService {
  constructor() {
    this.connect();
    this.messageHandlers = new Map();
  }
 
  connect() {
    this.ws = new WebSocket('wss://sendeliver.onrender.com');
    
    this.ws.onopen = () => {
      console.log('Connected to WebSocket');
      
      // Identifikuj sa podľa domény
      const domain = window.location.hostname;
      if (domain.includes('carriers') || domain.includes('hauler')) {
        this.initHauler();
      } else if (domain.includes('clients') || domain.includes('sender')) {
        this.initSender();
      }
    };
 
    this.ws.onclose = () => {
      console.log('Disconnected from WebSocket');
      setTimeout(() => this.connect(), 1000); // reconnect
    };
 
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const handler = this.messageHandlers.get(data.type);
      if (handler) handler(data);
    };
  }
 
  // Inicializácia pre dopravcu
  initHauler() {
    const haulerId = localStorage.getItem('haulerId') || `hauler_${Date.now()}`;
    localStorage.setItem('haulerId', haulerId);
    
    this.send('hauler_init', { haulerId });
  }
 
  // Inicializácia pre odosielateľa
  initSender() {
    const clientId = localStorage.getItem('clientId') || `client_${Date.now()}`;
    localStorage.setItem('clientId', clientId);
    
    this.send('client_init', { clientId });
  }
 
  // Poslanie delivery requestu
  sendDeliveryRequest(requestData) {
    this.send('delivery_request', {
      type: 'delivery_request',
      requestId: `req_${Date.now()}`,
      clientId: localStorage.getItem('clientId'),
      ...requestData
    });
  }
 
  // Poslanie ponuky od dopravcu
  sendDeliveryOffer(requestId, offerData) {
    this.send('delivery_offer', {
      type: 'delivery_offer',
      offerId: `offer_${Date.now()}`,
      haulerId: localStorage.getItem('haulerId'),
      requestId,
      ...offerData
    });
  }
 
  // Základná send metóda
  send(type, data) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, ...data }));
    }
  }
 
  // Registrácia handlerov pre rôzne typy správ
  onMessage(type, handler) {
    this.messageHandlers.set(type, handler);
  }
 }
 
 export default new WebSocketService();