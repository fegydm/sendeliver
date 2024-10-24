// ./back/config/websocket.js
import { WebSocketServer } from 'ws';
import { handleMessage } from '../services/wsService.js';

export const setupWebSocket = (server) => {
  const wss = new WebSocketServer({ 
    server,
    path: '/ws',
    perMessageDeflate: false
  });
  
  wss.on('connection', (ws, request) => {
    console.log('New WebSocket connection:', {
      path: request.url,
      headers: request.headers
    });
    
    ws.on('message', (data) => handleMessage(ws, data));
    
    ws.on('error', (error) => {
      console.error('WebSocket connection error:', error);
    });
    
    ws.send(JSON.stringify({ type: 'welcome', message: 'Connected to WebSocket server' }));
  });

  return wss;
};