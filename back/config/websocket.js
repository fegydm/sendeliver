// ./back/config/websocket.js
import { WebSocketServer } from 'ws';

export const setupWebSocket = (server) => {
  const wss = new WebSocketServer({ 
    server,
    path: '/ws',
    perMessageDeflate: false,
    handleProtocols: () => 'echo-protocol'
  });
  
  wss.on('connection', (ws) => {
    console.log('Client connected');
    
    ws.send(JSON.stringify({ message: 'Connected!' }));
    
    ws.on('message', (message) => {
      console.log('Received:', message.toString());
      ws.send(message.toString()); // Echo back
    });
  });

  return wss;
};