// ./back/config/websocket.js
import { WebSocketServer } from 'ws';
import { handleMessage } from '../services/wsService.js';

export const setupWebSocket = (server) => {
  const wss = new WebSocketServer({ server });
  
  wss.on('connection', (ws) => {
    ws.isAlive = true;

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', (data) => {
      handleMessage(ws, data);
    });

    ws.on('close', () => {
      // Cleanup logic
    });
  });

  // Keepalive check
  setInterval(() => {
    wss.clients.forEach((ws) => {
      if (!ws.isAlive) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);
};
