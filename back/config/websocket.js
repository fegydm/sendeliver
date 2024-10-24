// ./back/config/websocket.js
import { WebSocketServer } from 'ws';
import { handleMessage } from '../services/wsService.js';

export const setupWebSocket = (server) => {
  const wss = new WebSocketServer({ server });
  
  wss.on('connection', (ws) => {
    console.log('New client connected');
    ws.isAlive = true;

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', (data) => {
      try {
        handleMessage(ws, data);
      } catch (error) {
        console.error('Message handling error:', error);
        ws.send(JSON.stringify({ 
          type: 'error', 
          message: 'Failed to process message'
        }));
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
      ws.isAlive = false;
    });

    // Send initial connection confirmation
    ws.send(JSON.stringify({ 
      type: 'connection', 
      status: 'connected' 
    }));
  });

  // Keepalive check
  setInterval(() => {
    wss.clients.forEach((ws) => {
      if (!ws.isAlive) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  return wss; // Vraciam wss pre prípadné použitie v iných častiach aplikácie
};