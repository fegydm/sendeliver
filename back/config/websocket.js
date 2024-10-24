// ./back/config/websocket.js
import { WebSocketServer } from 'ws';
import { handleMessage } from '../services/wsService.js';

export const setupWebSocket = (server) => {
  console.log('Setting up WebSocket server...');
  
  const wss = new WebSocketServer({ 
    server,
    path: "/ws",
    clientTracking: true
  });
  
  wss.on('connection', (ws) => {
    console.log('Client trying to connect');
    ws.isAlive = true;

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', (data) => {
      console.log('Received message:', data.toString());
      handleMessage(ws, data);
    });

    ws.on('close', () => {
      console.log('Client disconnected');
      ws.isAlive = false;
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    // Send test message
    ws.send(JSON.stringify({ type: 'connection', status: 'connected' }));
    console.log('Sent connection confirmation');
  });

  return wss;
};